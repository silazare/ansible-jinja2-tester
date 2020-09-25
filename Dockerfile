FROM python:3.8-slim-buster

ENV PYTHONUNBUFFERED 1

RUN set -ex && \
    adduser --no-create-home --disabled-password --gecos '' appuser && \
    mkdir -p /home/appuser/.ansible && \
    chmod -R 777 /home/appuser/.ansible && \
    mkdir -p /tester

WORKDIR /tester
ADD . /tester

RUN set -ex && \
    chmod +x tester.py && \
    chown -R appuser:appuser /tester && \
    pip install -r requirements.txt && \
    rm -rf requirements.txt && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ENV HOST 0.0.0.0
EXPOSE 5000

USER appuser

CMD ["python", "tester.py"]
