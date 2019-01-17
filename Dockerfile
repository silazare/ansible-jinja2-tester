###################################
# Ansible Jinja2 Tester Dockerfile
#
# Version: 0.1
# Author:  Joel Baranick(kadaan)<jbaranick@gmail.com>
###################################

# Pull base image.
FROM python:2.7

RUN git clone https://github.com/kadaan/ansible-jinja2-tester.git /data

WORKDIR /data

# Install dependencies
RUN pip install -r requirements.txt

# Change bind host
RUN sed -i 's/host=config.HOST/host="0.0.0.0"/g' parser.py

# Expose port to Host
EXPOSE 5000

# Define default command.
CMD ["python", "parser.py"]
