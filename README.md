# todo-fullstack-aws-terraform

Full-stack Todo app built with **React, TypeScript, Material UI and FastAPI**, containerized with **Docker** and deployed to **AWS Elastic Beanstalk** using **Terraform**.

## Tech stack

| Layer          | Tools |
|----------------|-------|
| Frontend       | React 18, TypeScript, Vite, Material UI |
| Backend        | FastAPI, SQLAlchemy, Pydantic, SQLite |
| Containers     | Docker (multi-stage build), Docker Compose, nginx |
| Infrastructure | Terraform, AWS Elastic Beanstalk, EC2, S3, IAM |

## Features

- Create, edit, complete and delete todos
- Priority levels, due dates and overdue highlighting
- Filter, search and sort
- Stats dashboard with progress bar
- Light / dark mode
- REST API with interactive docs (`/docs`) and pytest tests

## Architecture

```
Browser ──► Elastic Beanstalk (EC2)
              └─ docker compose
                   ├─ frontend: nginx serves React, proxies /api ──►
                   └─ backend:  FastAPI + SQLite (Docker volume)

Terraform provisions: IAM roles · S3 (deploy bundle) · Beanstalk app + environment
Images are pulled from Docker Hub.
```

## Project structure

```
backend/    FastAPI app, tests, Dockerfile
frontend/   React + TypeScript app, nginx config, Dockerfile
deploy/     docker-compose template used by Elastic Beanstalk
infra/      Terraform (providers, variables, IAM, main, tfvars)
docker-compose.yml   Run the whole app locally
```

## Run locally

**With Docker**

```bash
docker compose up --build
```
Open http://localhost:3000

**Without Docker**

```bash
# Backend  → http://localhost:8000/docs
cd backend
python -m venv .venv && .venv\Scripts\activate   # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend → http://localhost:5173
cd frontend
npm install
npm run dev
```

Run backend tests: `cd backend && pytest`

## Deploy to AWS

**1. Push images to Docker Hub**

```bash
docker compose build
docker tag todoapp-backend:latest  <dockerhub-user>/todo-backend:1.0
docker tag todoapp-frontend:latest <dockerhub-user>/todo-frontend:1.0
docker push <dockerhub-user>/todo-backend:1.0
docker push <dockerhub-user>/todo-frontend:1.0
```

**2. Configure** `infra/terraform.tfvars`

```hcl
docker_user   = "<dockerhub-user>"
image_tag     = "1.0"
region        = "ca-central-1"
instance_type = "t3.micro"
```

**3. Deploy** (requires AWS CLI configured with `aws configure`)

```bash
cd infra
terraform init
terraform plan
terraform apply
```

Terraform prints `app_url`. Open it in your browser.

**Update:** push new image tags, change `image_tag`, run `terraform apply`.
**Remove everything:** `terraform destroy`

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/todos` | List (filters: `status`, `search`, `priority`, `sort`, `order`) |
| POST   | `/api/todos` | Create |
| PATCH  | `/api/todos/{id}` | Update |
| PATCH  | `/api/todos/{id}/toggle` | Toggle complete |
| DELETE | `/api/todos/{id}` | Delete |
| DELETE | `/api/todos/completed` | Clear completed |
| GET    | `/api/todos/stats` | Counts |

## What I learned

- Building a typed React + FastAPI app with a clean API layer
- Writing Dockerfiles with multi-stage builds and running services with Docker Compose
- Provisioning AWS infrastructure (IAM, S3, Elastic Beanstalk) with Terraform
- Keeping cloud costs within the AWS Free Tier and tearing down with `terraform destroy`

## Notes

- Runs as a single EC2 instance with SQLite. Data persists across restarts but not instance replacement. RDS would be the next step for production.
- Served over HTTP. HTTPS needs a load balancer or custom domain with an ACM certificate.
