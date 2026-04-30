FROM python:3.12-alpine AS deps
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-alpine AS runner
WORKDIR /app
COPY --from=deps /usr/local/lib/python3.12 /usr/local/lib/python3.12
COPY --from=deps /usr/local/bin /usr/local/bin
COPY app ./app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["python", "app/main.py"]
