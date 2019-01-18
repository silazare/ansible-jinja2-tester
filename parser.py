# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function

from flask import Flask, render_template, request
from ansible.template import Templar
from ansible.parsing.dataloader import DataLoader
from cgi import escape
import logging.handlers
import json
import yaml
import config


app = Flask(__name__)


@app.route("/")
def home():
    return render_template('index.html')


@app.route('/convert', methods=['GET', 'POST'])
def convert():
    loader = DataLoader()

    values = {}
    if request.form['input_type'] == "json":
        try:
            values = json.loads(request.form['values'])
        except Exception as e:
            return "Invalid JSON: {0}".format(e)
    elif request.form['input_type'] == "yaml":
        try:
            values = yaml.load(request.form['values'])
        except Exception as e:
            return "Invalid YAML: {0}".format(e)
    else:
        return "Unsupported input type: {0}".format(request.form['input_type'])

    try:
        # jinja2_tpl = jinja2_env.from_string(request.form['template'])
        templar = Templar(loader=loader, variables=values)
    except Exception as e:
        return "Template syntax error: {0}".format(e)

    try:
        rendered = templar.template(request.form['template'])
    except Exception as e:
        return "Template rendering failed: {0}".format(e)

    return escape(str(rendered))
    # return str(rendered)


if __name__ == "__main__":
    # Set up logging
    app.logger.setLevel(logging.__getattribute__(config.LOGGING_LEVEL))
    file_handler = logging.handlers.RotatingFileHandler(filename=config.LOGGING_LOCATION, maxBytes=10*1024*1024, backupCount=5)
    file_handler.setFormatter(logging.Formatter(config.LOGGING_FORMAT))
    file_handler.setLevel(logging.__getattribute__(config.LOGGING_LEVEL))
    app.logger.addHandler(file_handler)

    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG,
    )
