require 'json'
require './index'

request = JSON.parse(ENV['__ARC_REQ__'])
response = '__ARC__' + handler(request).to_json

puts response
exit(0)
