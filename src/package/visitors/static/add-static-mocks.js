let toLogicalID = require('../to-logical-id')
let mime = require('mime-types')
let glob = require('glob')
let path = require('path')
let fs = require('fs')

function getContentType(file) {
  var bits = file.split('.')
  var last = bits[bits.length - 1]
  if (last === 'tsx') return "'text/tsx'"
  return `'${mime.lookup(last)}; charset=utf8'`
}

module.exports = function addStaticMocks(arc, template) {

  let appname = toLogicalID(arc.app[0])
  let publicDir = path.join(process.cwd(), 'public')
  let staticAssets = path.join(publicDir, '/**/*')
  let assets = glob.sync(staticAssets)

  assets.forEach(asset=> {

    let path = asset.replace(publicDir, '')
    let type = getContentType(asset)
    let body = fs.readFileSync(asset).toString()

    template.Resources[appname].Properties.DefinitionBody.paths[path] = {
      get: {
        responses: {
          '200': {
            description: '200 response',
            headers: {
              'Content-Type': {schema: {type: 'string'}}
            },
            content: {
              'application/json': {schema: {type: 'string'}}
            }
          }
        },
        'x-amazon-apigateway-integration': {
          responses: {
            default: {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Content-Type': type
              },
              responseTemplates: {
                'application/json': body
              }
            }
          },
          requestTemplates: {
            'application/json': '{"statusCode": 200}'
          },
          passthroughBehavior: 'when_no_match',
          type: 'mock'
        }
      }
    }
  })

  return template
}
