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

## Quick Start Setup (Under 10 Steps)

Follow these steps to run the complete WorkHive platform locally and connect a Vercel-deployed frontend.

### 1. Copy Environment File
Copy the example environment file to create your active configurations:
```bash
cp .env.example .env
```

### 2. Launch Docker Services
Build and start the PostgreSQL database and Express backend API container:
```bash
docker compose up -d --build
```

### 3. Run Database Migrations
Initialize the PostgreSQL schema by applying the Prisma migration inside the backend container:
```bash
docker compose exec backend npx prisma migrate dev --name init
```

### 4. Seed the Database
Populate the database with realistic test users, jobs, and applications:
```bash
docker compose exec backend npm run prisma:seed
```

### 5. Expose Your Local Backend via ngrok
Create a secure HTTPS tunnel to expose your local Express backend (port 5000) to the public internet:
```bash
ngrok http 5000
```
*Note down the secure forwarding URL (e.g. `https://abc-123.ngrok-free.app`).*

### 6. Update Environment Whitelists
Open your `.env` file and set the backend API variable to your ngrok tunnel:
```text
NEXT_PUBLIC_API_URL=https://[YOUR_NGROK_SUBDOMAIN].ngrok-free.app/api/v1
```
*Restart Docker Compose to pick up variables: `docker compose down && docker compose up -d`.*

### 7. Run Frontend Locally (Optional)
Install dependencies and run the Next.js development server:
```bash
cd frontend
npm install --legacy-peer-deps
npm run dev
```
Open `http://localhost:3000` to browse.

### 8. Deploy to Vercel
Deploy the `/frontend` subdirectory to Vercel. Set the following environment variables in Vercel settings:
- `NEXT_PUBLIC_API_URL`: Your ngrok tunnel URL + `/api/v1` (e.g., `https://abc-123.ngrok-free.app/api/v1`)
- `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://workhive-frontend.vercel.app`)
- `NEXTAUTH_SECRET`: Any random security string

---

## Seeded Test Accounts
All seeded accounts use the password: `password123`

| Role | Email Address | Description |
|---|---|---|
| **Admin** | `admin@workhive.com` | Moderation panel (Flag/Remove jobs) |
| **Employer** | `employer1@workhive.com` to `employer5@workhive.com` | Post jobs and accept/reject applicants |
| **Seeker** | `seeker1@workhive.com` to `seeker15@workhive.com` | Browse, upload resume, apply for jobs |

---

## Technical Highlights

### 1. Worker Threads
To keep the Node.js main event loop responsive, heavy tasks are offloaded to background threads:
- **Email Worker** (`backend/src/workers/emailWorker.ts`): Spawns a thread using `nodemailer` to dispatch confirmation emails asynchronously on application submissions.
- **Resume Parser Worker** (`backend/src/workers/resumeParserWorker.ts`): Spawns a thread using `pdf-parse` to extract text content from PDF resumes, writing `.txt` copies to disk and updating the database application records.

### 2. Next.js Server Actions
Next.js Server Actions execute on the server for write operations, hiding internal keys and APIs from client bundles:
- `applyAction`: Handles resume upload and application submission.
- `postJobAction`: Handles job posting.
- `updateApplicantAction`: Handles employer applicant status changes.

### 3. Repository Pattern
Strict separation of concerns. The Express backend uses:
- **Controllers**: Zod schema request validation.
- **Services**: Enforces business logic and spawns worker threads.
- **Repositories**: Direct Prisma commands. Prisma is never imported or called outside the repository layer.
