#!/usr/bin/env python3
import os
import json
import index

req = os.environ.get('__ARC_REQ__')
event = json.loads(req)
context = {}
result = '__ARC__' + json.dumps(index.handler(event, context))

print(result, flush=True)
