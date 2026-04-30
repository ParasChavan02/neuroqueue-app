import os
import redis
from redis.sentinel import Sentinel

def get_redis_client():
    redis_host = os.getenv('REDIS_HOST', 'redis')
    redis_port = int(os.getenv('REDIS_PORT', 6379))
    redis_password = os.getenv('REDIS_PASSWORD', '')

    redis_config = {
        'host': redis_host,
        'port': redis_port,
        'decode_responses': True,
    }

    if redis_password:
        redis_config['password'] = redis_password
        redis_config['ssl'] = True
        redis_config['ssl_cert_reqs'] = 'none'
        print('[Redis] Connecting with TLS/SSL (Upstash production)')
    else:
        print('[Redis] Connecting without TLS (local setup)')

    try:
        client = redis.Redis(**redis_config)
        client.ping()
        print('[Redis] Connected successfully')
        return client
    except Exception as e:
        print(f'[Redis] Connection failed: {str(e)}')
        raise
