import json
import logging
import sys
import time
from datetime import datetime, timezone

import redis
from bson import ObjectId
from pymongo import MongoClient

from config import settings
from operations import process_text


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    stream=sys.stdout,
)


class TaskWorker:
    def __init__(self):
        self.redis = redis.Redis.from_url(settings.redis_url, decode_responses=True)
        self.mongo = MongoClient(settings.mongo_uri)
        self.tasks = self.mongo.neuroqueue["tasks"]

    def append_log(self, task_id: str, message: str):
        timestamp = datetime.now(timezone.utc).isoformat()
        self.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"logs": f"{timestamp} {message}"}},
        )

    def update_task(self, task_id: str, update: dict):
        self.tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update},
        )

    def process(self, task_id: str):
        task = self.tasks.find_one({"_id": ObjectId(task_id)})
        if not task:
            logging.warning("Task %s not found", task_id)
            return

        attempts = int(task.get("attempts", 0)) + 1
        self.update_task(
            task_id,
            {"status": "running", "attempts": attempts, "updatedAt": datetime.now(timezone.utc)},
        )
        self.append_log(task_id, f"Worker started attempt {attempts}")

        try:
            result = process_text(task["operation"], task["input"])
            self.update_task(
                task_id,
                {
                    "status": "success",
                    "result": result,
                    "updatedAt": datetime.now(timezone.utc),
                },
            )
            self.append_log(task_id, "Task completed successfully")
            logging.info("Processed task %s successfully", task_id)
        except Exception as exc:
            logging.exception("Task %s failed", task_id)
            self.append_log(task_id, f"Task failed: {exc}")

            if attempts < settings.max_retries:
                self.update_task(
                    task_id,
                    {"status": "pending", "updatedAt": datetime.now(timezone.utc)},
                )
                self.redis.rpush(settings.queue_name, json.dumps({"taskId": task_id}))
                self.append_log(task_id, "Task re-queued for retry")
            else:
                self.update_task(
                    task_id,
                    {
                        "status": "failed",
                        "updatedAt": datetime.now(timezone.utc),
                    },
                )
                self.append_log(task_id, "Task marked as failed after max retries")

    def run(self):
        logging.info("Worker started, listening on %s", settings.queue_name)
        while True:
            try:
                item = self.redis.blpop(settings.queue_name, timeout=settings.poll_timeout)
                if not item:
                    continue

                _, payload = item
                message = json.loads(payload)
                task_id = message["taskId"]
                self.process(task_id)
            except redis.RedisError:
                logging.exception("Redis connection error, retrying")
                time.sleep(2)
            except Exception:
                logging.exception("Unexpected worker error")
                time.sleep(1)


if __name__ == "__main__":
    worker = TaskWorker()
    worker.run()

