# WorkHive - Premium Job Board Platform

WorkHive is a full-stack job board platform where **job seekers** browse and apply for jobs, **employers** publish jobs and manage applications, and **admins** moderate the postings. 

This project demonstrates Next.js 15 (SSR + Server Actions), Node.js/Express, PostgreSQL, Prisma ORM, Docker Compose, worker_threads, and NextAuth.js.

---

## Repository Structure

```text
├── backend/                  # Express API Server
│   ├── prisma/               # Database Schema & Seeds
│   ├── src/
│   │   ├── controllers/      # Route logic & Zod validation
│   │   ├── errors/           # Custom AppError handling
│   │   ├── middlewares/      # CORS, RBAC, Helmet, Multer
│   │   ├── repositories/     # Prisma direct database access
│   │   ├── services/         # Core business logic
│   │   ├── workers/          # Background worker threads
│   │   └── types/            # TypeScript type typings
│   └── Dockerfile            # Backend container definition
├── frontend/                 # Next.js 15 App Router Project
│   ├── src/
│   │   ├── app/              # SSR Pages, Auth & Server Actions
│   │   ├── components/       # UI (FilterBar, Navbar, Toasts)
│   │   └── redux/            # Redux Toolkit Slices & Store
├── docker-compose.yml        # Orchestrates backend API + Postgres DB
├── workhive.postman_collection.json # API endpoints Postman Collection
├── .env.example              # Env configuration template
└── README.md                 # Setup and run guide
```

---

## Quick Start Setup

### Common Setup (Backend & Database)

Follow these steps first, regardless of how you plan to run the frontend.

#### 1. Copy Environment File
Copy the example environment file to create your active configurations:
```bash
cp .env.example .env
```

#### 2. Launch Docker Services
Build and start the PostgreSQL database and Express backend API container:
```bash
docker compose up -d --build
```

#### 3. Run Database Migrations
Initialize the PostgreSQL schema by applying the Prisma migration inside the backend container:
```bash
docker compose exec backend npx prisma migrate dev --name init
```

#### 4. Seed the Database
Populate the database with realistic test users, jobs, and applications:
```bash
docker compose exec backend npm run prisma:seed
```

---

### Option 1: Entirely Local Development (Backend, DB, Frontend)

Use this method if you want to run everything locally on your machine.

#### 1. Configure Environment for Local Development
Ensure your `.env` file has the following defaults (they should be there by default from `.env.example`):
```text
CORS_ORIGIN=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

#### 2. Run Frontend Locally
Install dependencies and run the Next.js development server:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000` to browse.

---

### Option 2: Connecting a Vercel-Deployed Frontend

Use this method if your frontend is deployed to Vercel but you want it to connect to your local backend and database.

#### 1. Expose Your Local Backend via ngrok
Create a secure HTTPS tunnel to expose your local Express backend (port 5000) to the public internet:
```bash
ngrok http 5000
```
*Note down the secure forwarding URL (e.g. `https://abc-123.ngrok-free.app`).*

#### 2. Update Environment Variables
Open your `.env` file locally and set the CORS origin to your Vercel domain so the backend accepts requests from it:
```text
CORS_ORIGIN=https://[YOUR_VERCEL_APP_DOMAIN]
```
*Restart Docker Compose to pick up variables: `docker compose down && docker compose up -d`.*

In your **Vercel Project Settings**, set the following environment variables:
```text
NEXT_PUBLIC_API_URL=https://[YOUR_NGROK_SUBDOMAIN].ngrok-free.app/api/v1
NEXTAUTH_URL=https://[YOUR_VERCEL_APP_DOMAIN]
```

## Seeded Test Accounts
All seeded accounts use the password: `password123`

| Role | Email Address | Description |
|---|---|---|
| **Admin** | `admin@workhive.com` | Moderation panel (Flag/Remove jobs) |
| **Employer** | `employer1@workhive.com` to `employer5@workhive.com` | Post jobs and accept/reject applicants |
| **Seeker** | `seeker1@workhive.com` to `seeker15@workhive.com` | Browse, upload resume, apply for jobs |

---
