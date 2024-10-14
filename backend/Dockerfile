FROM python:3.12

WORKDIR /app

COPY pyproject.toml poetry.lock* /app/

RUN pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-dev --no-interaction --no-ansi

COPY . /app

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
