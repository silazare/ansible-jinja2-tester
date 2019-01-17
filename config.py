# Builtin config values: http://flask.pocoo.org/docs/0.10/config/
import os

DEBUG = os.environ.get('DEBUG', False)
HOST = os.environ.get('HOST', 'localhost')
PORT = int(os.environ.get('PORT', 80))

LOGGING_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
LOGGING_LOCATION = 'ansible-jinja2-tester.log'
LOGGING_LEVEL = 'DEBUG'
