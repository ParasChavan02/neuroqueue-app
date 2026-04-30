# NeuroQueue Architecture

## System Overview

NeuroQueue is a distributed async processing platform with four main runtime components:

- React frontend for authentication, task submission, and task visibility
- Express API for auth, task persistence, and queue publishing
- Redis queue for decoupled job dispatch
- Python workers for background execution

MongoDB is the system of record for users and tasks. Redis provides transient queue semantics. Kubernetes orchestrates runtime scaling, while Argo CD reconciles desired cluster state from an infra repository.

## Worker Scaling Strategy

Workers are stateless and can scale horizontally with Kubernetes replica count. Redis `BLPOP` ensures only one worker receives a queued job. At higher volumes, scale workers based on:

- queue depth
- average processing latency
- CPU saturation
- task retry rate

In production, pair the worker deployment with KEDA or an HPA driven by queue depth metrics exported from Redis.

## Handling 100k Tasks Per Day

100k tasks/day is roughly 1.16 tasks/second on average, but burst handling matters more than the mean. The platform supports that load by:

- using Redis as a low-latency ingestion buffer between API and workers
- keeping worker processes stateless so replicas can be increased quickly
- indexing task queries around user access patterns and status filters
- separating frontend, API, and worker scaling so compute is added only where needed

Recommended production additions for this volume:

- Redis persistence enabled with AOF
- dedicated managed MongoDB with replica set
- connection pooling and cluster monitoring
- autoscaling workers from queue metrics
- API read pagination and capped log size if task logs grow materially

## Redis Failure Handling

Redis is a transient dependency, so failure handling should be explicit:

- Backend startup fails fast if Redis is unavailable, which prevents accepting tasks that cannot be queued safely.
- Worker reconnect logic retries on Redis connection errors.
- Failed task processing retries are controlled inside MongoDB through the `attempts` field.
- In production, enable Redis persistence and use a highly available deployment such as Redis Sentinel or managed Redis.

If stricter delivery guarantees are needed, move from a raw list queue to Redis Streams or a broker with acknowledgements such as RabbitMQ.

## Database Indexing Strategy

The `tasks` collection uses:

- index on `userId` for user-scoped task fetches
- index on `status` for operational queries and dashboards
- index on `createdAt` for recent-first sorting

This matches the current access patterns:

- `GET /tasks` filters by authenticated user and sorts by creation time
- `GET /tasks/:id` fetches a single document by `_id` and `userId`
- operational monitoring can query `status` for pending, running, or failed tasks

For larger scale, add a compound index on `{ userId: 1, createdAt: -1 }` and consider TTL or archive strategies if historical task volume becomes large.

## Staging vs Production Deployment

Staging should mirror production topology but at lower scale:

- single MongoDB and Redis instances
- one backend replica
- one frontend replica
- one or two worker replicas
- separate namespace and secrets

Production should add:

- replica-backed API and frontend deployments
- managed database and cache offerings where possible
- ingress TLS
- observability stack for logs, metrics, and traces
- image promotion strategy instead of direct mutable tags
- secret management via External Secrets, Vault, or cloud-native secret stores

## Infra Repo Layout

Recommended separate GitOps repository:

```text
neuroqueue-infra/
└── k8s/
    ├── namespace.yaml
    ├── configmap.yaml
    ├── secret.yaml
    ├── mongodb.yaml
    ├── redis.yaml
    ├── backend.yaml
    ├── worker.yaml
    ├── frontend.yaml
    └── ingress.yaml
```

The GitHub Actions workflow in the app repo updates image tags in that infra repo, and Argo CD applies the changes automatically.
