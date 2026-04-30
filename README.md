# NeuroQueue

NeuroQueue is a MERN + Python distributed system for authenticated, asynchronous text task processing. Users submit text operations through a React frontend, the Node.js API persists tasks in MongoDB and enqueues jobs in Redis, and Python workers process jobs in the background with retries and detailed logs.

## Folder Structure

```text
NeuroQueue/
|-- backend/
|-- frontend/
|-- worker/
|-- infra/
|   |-- argocd/
|   `-- k8s/
|-- .github/
|   `-- workflows/
|-- docker-compose.yml
|-- README.md
`-- Architecture.md
```

## Features

- JWT authentication with bcrypt password hashing
- Protected task APIs
- Redis-backed async task queue
- Python workers with retries, logs, and MongoDB result persistence
- React dashboard with task creation, task details, and live status polling
- Docker, Docker Compose, Kubernetes, Argo CD, and GitHub Actions support

## Local Development

### Prerequisites

- Docker Desktop or Docker Engine with Compose support

### Run with Docker

```bash
docker compose up --build -d
```

Open:

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend health: [http://localhost:5000/health](http://localhost:5000/health)

Stop the stack:

```bash
docker compose down
```

### Local Worker Parity

The compose file starts three worker containers by default:

- `worker`
- `worker-2`
- `worker-3`

This mirrors the Kubernetes worker replica count more closely for local queue testing.

## Environment Variables

### Backend

See [backend/.env.example](C:\Users\paras\OneDrive\Desktop\NeuroQueue\backend\.env.example)

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `CLIENT_ORIGIN`
- `QUEUE_NAME`

### Worker

See [worker/.env.example](C:\Users\paras\OneDrive\Desktop\NeuroQueue\worker\.env.example)

- `MONGO_URI`
- `REDIS_URL`
- `QUEUE_NAME`
- `MAX_RETRIES`
- `WORKER_POLL_TIMEOUT`

### Frontend

See [frontend/.env.example](C:\Users\paras\OneDrive\Desktop\NeuroQueue\frontend\.env.example)

- `VITE_API_URL`

## API Endpoints

Required contract:

- `POST /auth/register`
- `POST /auth/login`
- `POST /tasks`
- `GET /tasks`
- `GET /tasks/:id`
- `POST /tasks/:id/run`

Ingress-friendly aliases are also exposed:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks/:id/run`

## Kubernetes

Apply manifests in this order:

```bash
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secret.yaml
kubectl apply -f infra/k8s/mongodb.yaml
kubectl apply -f infra/k8s/redis.yaml
kubectl apply -f infra/k8s/backend.yaml
kubectl apply -f infra/k8s/worker.yaml
kubectl apply -f infra/k8s/frontend.yaml
kubectl apply -f infra/k8s/ingress.yaml
```

## Argo CD

1. Create a separate infrastructure repository, for example `neuroqueue-infra`.
2. Copy the Kubernetes manifests from `infra/k8s/` into that repo.
3. Update `repoURL` in [infra/argocd/application.yaml](C:\Users\paras\OneDrive\Desktop\NeuroQueue\infra\argocd\application.yaml) to your real infra repository URL.
4. Apply the Argo CD application:

```bash
kubectl apply -f infra/argocd/application.yaml -n argocd
```

Auto-sync, pruning, and self-heal are already enabled in the manifest.

## CI/CD

### Required GitHub Secrets

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `INFRA_REPO_TOKEN`

### Required GitHub Variables

- `DOCKERHUB_NAMESPACE`
- `INFRA_REPO`

The workflow:

1. Lints backend and frontend
2. Builds Docker images
3. Pushes images to Docker Hub
4. Checks out the infra repo
5. Updates Kubernetes image tags
6. Pushes the infra repo change for Argo CD sync

## Notes

- The backend fails fast if MongoDB or Redis is unavailable on startup.
- Workers consume queue items with Redis blocking pop semantics.
- Task logs are stored in MongoDB and displayed in the task details page.
- For production, replace the example secrets and image namespaces before deployment.
