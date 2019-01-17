# Ansible Jinja2 Tester

All you need is Python and preferably [pip](https://pypi.python.org/pypi/pip). Can parse JSON and YAML inputs.
A lightweight live parser for the [Ansible](https://www.ansible.com/) flavor of [Jinja2](http://jinja.pocoo.org/docs/dev/).  

[![Deploy](https://www.herokucdn.com/deploy/button.png)](https://heroku.com/deploy)

## Install

### Clone + pip

    $ git clone git@github.com:kadaan/ansible-jinja2-tester.git
    $ pip install -r requirements.txt
    $ python parser.py

### Dockerfile

Build it:

    docker build -t mydocker/j2parser .
    docker run -d -p 5000:5000 mydocker/j2parser

Or simply pull it from registry (without building):

    docker run -d -p 5000:5000 kadaan/j2parser


## Usage

You are all set, go to `http://localhost:5000/` and have fun.  

