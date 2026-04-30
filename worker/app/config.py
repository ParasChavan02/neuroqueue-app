import os


class Settings:
    mongo_uri = os.getenv("MONGO_URI", "mongodb://mongodb:27017/neuroqueue")
    
    # Redis configuration with automatic TLS detection
    redis_host = os.getenv("REDIS_HOST", "redis")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    redis_password = os.getenv("REDIS_PASSWORD", "")
    
    # Build Redis URL based on whether password exists (for Upstash vs local)
    if redis_password:
        redis_url = f"rediss://:{redis_password}@{redis_host}:{redis_port}/0"
    else:
        redis_url = f"redis://{redis_host}:{redis_port}/0"
    
    queue_name = os.getenv("QUEUE_NAME", "task_queue")
    max_retries = int(os.getenv("MAX_RETRIES", "3"))
    poll_timeout = int(os.getenv("WORKER_POLL_TIMEOUT", "5"))


settings = Settings()

