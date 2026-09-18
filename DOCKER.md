# 🐳 Docker Deployment & Containerization Guide for LuxNest

This project includes complete, production-grade Docker setups supporting both **Single Full-Stack Container** and **Multi-Container Microservices Architecture (Docker Compose)**.

---

## 🚀 Quick Start with Docker Compose (Recommended)

To spin up the full application (React Frontend, Express API, and MongoDB database) with one command:

```bash
docker compose up --build
```

### Access Points:
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5050/api](http://localhost:5050/api)
- **API Health Check**: [http://localhost:5050/api/health](http://localhost:5050/api/health)
- **MongoDB**: `localhost:27017`

To run in the background (detached mode):
```bash
docker compose up -d --build
```

To stop containers:
```bash
docker compose down
```

To stop containers and delete database volumes:
```bash
docker compose down -v
```

---

## 📦 Option 1: All-in-One Multi-Stage Production Image

Build a single container that compiles the React client and serves both the frontend SPA and the REST API from Node.js on port `5050`:

### 1. Build the Docker Image:
```bash
docker build -t luxnest:latest .
```

### 2. Run the Container:
```bash
docker run -d \
  --name luxnest-app \
  -p 5050:5050 \
  -e LOCAL_MONGODB_URI="mongodb://host.docker.internal:27017/luxnest" \
  luxnest:latest
```
Access the application at [http://localhost:5050](http://localhost:5050).

---

## 🌐 Option 2: Production Multi-Container Orchestration

For high-performance production setups using Docker Compose:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🛠️ Individual Image Builds

### 1. Backend REST API Only:
```bash
cd server
docker build -t luxnest-server:latest .
docker run -d -p 5050:5050 --name luxnest-server luxnest-server:latest
```

### 2. Frontend React + Nginx Only:
```bash
cd client
docker build -t luxnest-client:latest .
docker run -d -p 80:80 --name luxnest-client luxnest-client:latest
```

---

## 📂 Docker File Structure Overview

| File | Purpose |
|------|---------|
| [`Dockerfile`](./Dockerfile) | Multi-stage production build (builds client with Vite and bundles with Express server). |
| [`docker-compose.yml`](./docker-compose.yml) | Orchestrates MongoDB 7.0, Express API (5050), and React Nginx client (5173). |
| [`docker-compose.prod.yml`](./docker-compose.prod.yml) | Production deployment orchestration. |
| [`client/Dockerfile`](./client/Dockerfile) | Dedicated frontend container serving built static assets via Nginx. |
| [`client/nginx.conf`](./client/nginx.conf) | Nginx configuration with gzip compression, caching, and API reverse proxy. |
| [`server/Dockerfile`](./server/Dockerfile) | Dedicated Node.js 20 Alpine backend container. |
| [`.dockerignore`](./.dockerignore) | Excludes node_modules, .env, and temp files from build context. |
