import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

def get_mongo_client():
    mongo_uri = os.getenv('MONGO_URI')
    
    if not mongo_uri:
        raise ValueError('MONGO_URI is required in environment variables')

    try:
        client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
        )
        client.admin.command('ping')
        print(f'[MongoDB] Connected successfully to: {mongo_uri.replace(":@", ":***@")}')
        return client
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f'[MongoDB] Connection failed: {str(e)}')
        raise
    except Exception as e:
        print(f'[MongoDB] Unexpected error: {str(e)}')
        raise

def get_database(db_name='neuroqueue'):
    client = get_mongo_client()
    return client[db_name]
