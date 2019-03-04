# -*- coding: utf-8 -*-
from __future__ import absolute_import, print_function

import ansible
from ansible.template import Templar
from ansible.parsing.dataloader import DataLoader
import config
import firebase_admin
from firebase_admin import credentials, db
from flask import Flask, abort, render_template, request, send_from_directory
import hashids
import json
import logging.handlers
import os
import yaml


def is_snapshots_enabled():
    return config.FIREBASE_URL is not None and config.FIREBASE_CREDENTIALS is not None


app = Flask(__name__)
if is_snapshots_enabled():
    hasher = hashids.Hashids(config.FIREBASE_URL, min_length=6)
    cred = credentials.Certificate(config.FIREBASE_CREDENTIALS)
    firebase_admin.initialize_app(cred, {
        'databaseURL': config.FIREBASE_URL
    })
    counter_db = db.reference('counter')
    snapshots_db = db.reference('snapshots')


@app.route("/")
@app.route("/<code>")
def home(code=None):
    enable_snapshots = is_snapshots_enabled()
    values_type = "yaml"
    values = ""
    template = ""
    render = ""
    if code is not None:
        if not enable_snapshots:
            abort(404)
        # noinspection PyBroadException
        try:
            snapshots = snapshots_db.order_by_key().equal_to(code).limit_to_first(1).get()
            _, snapshot_value = next(iter(snapshots.items()))
            values_type = escape_value(snapshot_value['values_type'])
            values = escape_value(snapshot_value['values'])
            template = escape_value(snapshot_value['template'])
            render = escape_value(snapshot_value['render'])
        except Exception as e:
            app.logger.exception('Failed to load snapshot: %s', e, )
            abort(500)

    return render_template('index.html', enable_snapshots=enable_snapshots, values_type=values_type, values=values,
                           template=template, render=render, ansible_version=ansible.__version__)


@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'images'),
                               'favicon.png', mimetype='image/png')


@app.route("/snapshot", methods=['POST'])
def snapshot():
    if not is_snapshots_enabled():
        abort(404)

    values_type = get_values_type()
    values = get_values_raw()
    template = get_template()
    render = get_render()
    data = {
        "values_type": values_type,
        "values": values,
        "template": template,
        "render": render,
        "timestamp": {".sv": "timestamp"}
    }
    # noinspection PyBroadException
    try:
        new_id = counter_db.transaction(increment_counter)
        code = hasher.encode(new_id)
        snapshots_db.child(code).set(data)
        return "%s%s" % (request.url_root, code)
    except Exception as e:
        app.logger.exception('Failed to save snapshot: %s', e, )
        abort(500)


def increment_counter(current_value):
    return current_value + 1 if current_value else 1


@app.route('/test', methods=['GET', 'POST'])
def test():
    values = get_values()
    try:
        loader = DataLoader()
        templar = Templar(loader=loader, variables=values)
        try:
            rendered = templar.template(get_template(), convert_data=False)
        except Exception as e:
            rendered = "Template rendering failed: {0}".format(e)
    except Exception as e:
        rendered = "Template syntax error: {0}".format(e)

    result = {
        "result": str(rendered)
    }

    return json.dumps(result)


def get_values_type():
    if request.form['values_type'] == "json":
        return "json"
    elif request.form['values_type'] == "yaml":
        return "yaml"
    else:
        return "Unsupported value type: {0}".format(request.form['values_type'])


def get_values_raw():
    return request.form['values']


def get_values():
    values_type = get_values_type()
    if values_type == "json":
        try:
            return json.loads(get_values_raw())
        except Exception as e:
            return "Invalid JSON: {0}".format(e)
    elif values_type == "yaml":
        try:
            return yaml.load(get_values_raw())
        except Exception as e:
            return "Invalid YAML: {0}".format(e)
    else:
        return "Unsupported value type: {0}".format(values_type)


def get_template():
    return request.form['template']


def get_render():
    return request.form['render']


def escape_value(value):
    return str(value).encode('string_escape').replace('"', '\\"')


if __name__ == "__main__":
    app.logger.setLevel(logging.__getattribute__(config.LOGGING_LEVEL))
    file_handler = logging.handlers.RotatingFileHandler(filename=config.LOGGING_LOCATION, maxBytes=10*1024*1024,
                                                        backupCount=5)
    file_handler.setFormatter(logging.Formatter(config.LOGGING_FORMAT))
    file_handler.setLevel(logging.__getattribute__(config.LOGGING_LEVEL))
    app.logger.addHandler(file_handler)

    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG,
    )
