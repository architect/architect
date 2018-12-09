#!/usr/bin/env python3
import os
import sys
import json
import index

event = json.loads(sys.stdin.read())
context = {}
result = index.handler(event, context)
os.write(3, json.dumps(result))
os.fsync(3)
