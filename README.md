# CloudPortfolio

CloudPortfolio is a cloud-native student project portfolio platform for browsing, submitting, editing, deleting, and managing academic software projects.

Repository: https://github.com/Nischal270/cloudportfolio

## Coursework Context

- Module: COM682 Cloud Native Development
- Student: Nischal Shrestha
- Student ID: B00976199

## Features

- Browse all projects
- Search and filter by technology
- Submit new project
- Edit project
- Delete project
- My Portfolio page for projects owned by the simulated user
- Simulated Microsoft Entra ID sign-in
- Azure Architecture mapping page
- Dashboard summary cards
- Local REST API using json-server
- GitHub Actions CI workflow

## Tech Stack

- React
- Vite
- JavaScript
- React Router
- json-server
- GitHub Actions

## Azure Architecture Mapping

| Local Prototype Component | Azure Cloud Service | Purpose |
| --- | --- | --- |
| Vite React frontend | Azure Static Web Apps | SPA hosting with HTTPS/CDN |
| json-server API | Azure Functions | REST CRUD endpoints |
| db.json | Azure Cosmos DB | Project metadata storage |
| File name simulation | Azure Blob Storage | Multimedia file storage |
| Simulated sign-in state | Microsoft Entra ID | Authentication and identity claims |
| Dashboard/API status | Application Insights | Monitoring and telemetry |
| GitHub workflow | GitHub Actions | CI/CD automation |

## Run Locally

Install dependencies:

```bash
npm install
```

Start the local REST API:

```bash
npm run api
```

Start the Vite frontend in a second terminal:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

API URL:

```text
http://localhost:5000/projects
```

## Simulated CRUD Endpoints

The local prototype uses json-server to simulate REST API behaviour:

- `GET /projects`
- `POST /projects`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`

## CI/CD

The repository includes a GitHub Actions workflow at `.github/workflows/frontend-ci.yml`.

The workflow runs on push and pull request events targeting the `main` branch. It checks out the repository, installs dependencies with `npm ci`, and builds the Vite app with `npm run build`.

## Future Azure Deployment

Planned deployment improvements:

- Replace json-server with Azure Functions
- Replace db.json with Azure Cosmos DB
- Store uploaded files in Azure Blob Storage
- Use Microsoft Entra ID for real login
- Enable Application Insights telemetry

## Academic Integrity Note

This repository represents a coursework prototype and should be adapted responsibly.
