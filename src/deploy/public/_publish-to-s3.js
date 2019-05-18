let aws = require('aws-sdk')
let exec = require('child_process').exec
let mime = require('mime-types')
let glob = require('glob')
let chalk = require('chalk')
let path = require('path')
let pathExists = require('path-exists').sync
let fs = require('fs')
let waterfall = require('run-waterfall')
let series = require('run-series')
let sha = require('sha')
let sort = require('path-sort')

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
  let {Bucket, fingerprinting, ignore, shouldDelete} = params
  let s3 = new aws.S3({region: process.env.AWS_REGION})
  let publicDir = normalizePath(path.join(process.cwd(), 'public'))
  let staticAssets = path.join(publicDir, '/**/*')
  let files
  let staticManifest = {}
  waterfall([
    /**
     * Scan for files in the public directory
     */
    function globFiles(callback) {
      glob(staticAssets, {dot:true, nodir:true}, callback)
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
        'static.json',
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
      if (fingerprinting) {
        // Hash those files
        let hashFiles = files.map(file => {
          return (callback) => {
            sha.get(file, function done(err, hash) {
              if (err) callback(err)
              else {
                hash = hash.substr(0,10)
                let filename = file.split('.')
                // This will do weird stuff on multi-ext files (*.tar.gz) ¯\_(ツ)_/¯
                filename[filename.length - 2] = `${filename[filename.length - 2]}-${hash}`
                // Target shape: {'foo/bar.jpg': 'foo/bar-6bf1794b4c.jpg'}
                staticManifest[file.replace(publicDir, '').substr(1)] = filename.join('.').replace(publicDir, '').substr(1)
                callback()
              }
            })
          }
        })
        series(hashFiles, function done(err) {
          if (err) callback(err)
          else {
            // Write out public/static.json
            fs.writeFile(path.join(publicDir, 'static.json'), JSON.stringify(staticManifest, null, 2), callback)
          }
        })
      }
      else {
        if (pathExists(path.join(publicDir, 'static.json'))) {
          console.log(`${chalk.yellow('Warning')} ${chalk.gray(`Found ${publicDir}static.json file with fingerprinting disabled, deleting file`)}`)
          let cmd = 'rm static.json'
          exec(cmd, {cwd: publicDir}, (err, stdout, stderr) => {
            if (err) callback(err)
            else if (stderr) {
              console.log(`${chalk.yellow('Warning')} ${chalk.gray(`Error removing static.json file, please remove it manually or static asset calls may be broken`)}`)
              callback()
            }
            else callback()
          })
        }
        else callback()
      }
    },

    /**
     * Upload files to S3
     */
    function uploadFiles(callback) {
      let tasks = files.map(file=> {
        return function _maybeUploadFileToS3(callback) {
          // First, let's check to ensure we even need to upload the file
          let stats = fs.lstatSync(file)
          let Key = file.replace(publicDir, '').substr(1)
          if (fingerprinting) {
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
                  ContentType: getContentType(file),
                }
                if (fingerprinting) {
                  params.CacheControl = 'max-age=315360000'
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
                    callback()
                  }
                })
              }
              else {
                console.log(`${chalk.gray('[Not modified]')} ${chalk.underline.cyan(url)}`)
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
      if (shouldDelete) {
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

            if (fingerprinting) {
              leftovers = filesOnS3.Contents.filter((S3File) => {
                return !Object.values(staticManifest).some(f => f === S3File.Key)
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
