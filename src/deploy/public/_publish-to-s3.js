let aws = require('aws-sdk')
let chalk = require('chalk')
let fs = require('fs')
let fingerprinter = require('@architect/utils').fingerprint
let glob = require('glob')
let mime = require('mime-types')
let path = require('path')
let series = require('run-series')
let sort = require('path-sort')
let waterfall = require('run-waterfall')

function getContentType(file) {
  let bits = file.split('.')
  let last = bits[bits.length - 1]
  if (last === 'tsx') return 'text/tsx'
  return mime.lookup(last)
}

function normalizePath(path) {
  // process.cwd() and path.join uses '\\' as a path delimiter on Windows
  // glob uses '/'
  return path.replace(/\\/g, '/')
}

module.exports = function factory(params, callback) {
  let {Bucket, fingerprint, ignore, prune} = params
  let s3 = new aws.S3({region: process.env.AWS_REGION})
  let publicDir = normalizePath(path.join(process.cwd(), 'public'))
  let staticAssets = path.join(publicDir, '/**/*')
  let files
  let staticManifest
  waterfall([
    /**
     * Notices
     */
    function notices(callback) {
      console.log(chalk.green.dim('✓'), chalk.grey(`Static asset fingerpringing ${fingerprint ? 'enabled' : 'disabled'}`))
      console.log(chalk.green.dim('✓'), chalk.grey(`Orphaned file pruning ${prune ? 'enabled' : 'disabled'}`))
      callback()
    },

    /**
     * Scan for files in the public directory
     */
    function globFiles(callback) {
      glob(staticAssets, {dot:true, nodir:true, follow:true}, callback)
    },

    /**
     * Filter based on default and user-specified ignore rules
     */
    function filterFiles(filesFound, callback) {
      // Always ignore these files
      ignore = ignore.concat([
        '.DS_Store',
        'node_modules',
        'readme.md',
        'static.json', // Ignored here, but uploaded later
      ])

      // Find non-ignored files and sort for readability
      files = filesFound.filter(file => !ignore.some(i => file.includes(i)))
      files = sort(files)

      if (!files.length) {
        callback(Error('no_files_to_publish'))
      }
      else callback()
    },

    /**
     * Write (or remove) fingerprinted static asset manifest
     */
    function writeStaticManifest(callback) {
      fingerprinter({fingerprint, ignore}, callback)
    },

    /**
     * Upload files to S3
     */
    function uploadFiles(manifest={}, callback) {
      staticManifest = manifest
      if (fingerprint) {
        // Ensure static.json is uploaded
        files.unshift(path.join(publicDir, 'static.json'))
      }

      let tasks = files.map(file=> {
        return function _maybeUploadFileToS3(callback) {
          // First, let's check to ensure we even need to upload the file
          let stats = fs.lstatSync(file)
          let Key = file.replace(publicDir, '').substr(1)
          let big = stats.size >= 5750000
          if (fingerprint && Key !== 'static.json') {
            Key = staticManifest[file.replace(publicDir, '').substr(1)]
          }
          s3.headObject({
            Bucket,
            Key,
          },
          function headObj(err, headData) {
            if (err && err.code !== 'NotFound') {
              console.error('Error on headObject request', err)
              callback()
            }
            else if (err && err.code === 'AccessDenied') {
              callback(Error('access_denied'))
            }
            else {
              let url = `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${Key}`
              if (!headData || !headData.LastModified || stats.mtime > headData.LastModified) {
                let params = {
                  ACL: 'public-read',
                  Bucket,
                  Key,
                  Body: fs.readFileSync(file),
                }
                if (getContentType(file)) {
                  params.ContentType = getContentType(file)
                }
                if (fingerprint && Key !== 'static.json') {
                  params.CacheControl = 'max-age=315360000'
                }
                if (fingerprint && Key === 'static.json') {
                  params.CacheControl = 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0'
                }
                s3.putObject(params, function _putObj(err) {
                  if (err && err.code === 'AccessDenied') {
                    callback(Error('access_denied'))
                  }
                  else if (err) {
                    console.log(err)
                    callback()
                  }
                  else {
                    console.log(`${chalk.blue('[  Uploaded  ]')} ${chalk.underline.cyan(url)}`)
                    if (big) console.log(`${chalk.yellow('[  Warning!  ]')} ${chalk.white.bold(`${Key} is > 5.75MB`)}${chalk.white(`; files over 6MB cannot be proxied by Lambda (arc.proxy)`)}`)
                    callback()
                  }
                })
              }
              else {
                console.log(`${chalk.gray('[Not modified]')} ${chalk.underline.cyan(url)}`)
                if (big) console.log(`${chalk.yellow('[  Warning!  ]')} ${chalk.white.bold(`${Key} is > 5.75MB`)}${chalk.white(`; files over 6MB cannot be proxied by Lambda (arc.proxy)`)}`)
                callback()
              }
            }
          })
        }
      })
      // Upload all the objects
      // (This used to be a parallel op, but large batches could rate limit out)
      series(tasks, callback)
    },

    /**
     * Delete old files (if requested)
     */
    function deleteFiles(results, callback) {
      if (prune) {
        s3.listObjectsV2({Bucket}, function(err, filesOnS3) {
          if (err) {
            console.error('Listing objects for deletion in S3 failed', err)
            callback()
          }
          else {
            // calculate diff between files_on_s3 and local_files
            // TODO: filesOnS3.IsTruncated may be true if you have > 1000 files.
            // might want to handle that (need to ask for next page, etc)...
            let leftovers = filesOnS3.Contents.filter((S3File) => {
              let fileOnS3 = path.join(process.cwd(), 'public', S3File.Key.replace('/', path.sep)) // windows
              return !files.includes(fileOnS3)
            }).map(function(S3File) {
              return {Key: S3File.Key}
            })

            if (fingerprint) {
              leftovers = filesOnS3.Contents.filter((S3File) => {
                if (S3File.Key === 'static.json') return
                else return !Object.values(staticManifest).some(f => f === S3File.Key)
              }).map(function(S3File) {
                return {Key: S3File.Key}
              })
            }

            if (leftovers.length) {
              let deleteParams = {
                Bucket,
                Delete: {
                  Objects: leftovers,
                  Quiet: false
                }
              }

              // TODO chunk requests to 1k
              s3.deleteObjects(deleteParams, function(err, data) {
                if (err) {
                  console.error('Deleting objects on S3 failed', err)
                }
                else {
                  data.Deleted.forEach(function(deletedFile) {
                    let last = `https://${Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${deletedFile.Key}`
                    console.log(`${chalk.red('[ ✗ Deleted  ]')} ${chalk.cyan(last)}`)
                  })
                }
                callback()
              })
            }
            else {
              callback()
            }
          }
        })
      }
      else callback()
    }
  ], function done(err) {
    if (err && err.message === 'no_files_to_publish') {
      console.log(`${chalk.gray('No static assets found to deploy from public' + path.sep)}`)
      callback()
    }
    else if (err && err.message === 'access_denied') {
      console.log(chalk.bgRed.bold.white('S3 Access Denied'))
      console.log(chalk.yellow('Could not access S3 bucket '+ Bucket))
      console.log('Possible reason: bucket already exists and belongs to another AWS account')
      callback()
    }
    else if (err) {
      callback(err)
    }
    else {
      console.log(`${chalk.green('✓ Success!')} ${chalk.green.dim('Deployed static assets from public' + path.sep)}`)
      callback()
    }
  })
}
