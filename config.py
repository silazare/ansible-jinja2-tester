# Builtin config values: http://flask.pocoo.org/docs/0.10/config/
import base64
import os
import json


def _get_firebase_credentials():
    creds_base64 = os.environ.get('FIREBASE_CREDENTIALS_BASE64')
    if creds_base64 is None:
        return None
    return json.loads(base64.b64decode(creds_base64).decode('utf-8'))


DEBUG = os.environ.get('DEBUG', False)
HOST = os.environ.get('HOST', 'localhost')
PORT = int(os.environ.get('PORT', 5000))
FIREBASE_URL = os.environ.get('FIREBASE_URL')
FIREBASE_CREDENTIALS = _get_firebase_credentials()

LOGGING_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOGGING_LOCATION = 'ansible-jinja2-tester.log'
LOGGING_LEVEL = 'DEBUG'
