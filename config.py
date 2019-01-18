# Builtin config values: http://flask.pocoo.org/docs/0.10/config/
import base64
import os
import json

DEBUG = os.environ.get('DEBUG', False)
HOST = os.environ.get('HOST', 'localhost')
PORT = int(os.environ.get('PORT', 80))
FIREBASE_URL = os.environ.get('FIREBASE_URL')
FIREBASE_CREDENTIALS = json.loads(base64.b64decode(os.environ.get('FIREBASE_CREDENTIALS_BASE64')).decode('utf-8'))

LOGGING_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOGGING_LOCATION = 'ansible-jinja2-tester.log'
LOGGING_LEVEL = 'DEBUG'
