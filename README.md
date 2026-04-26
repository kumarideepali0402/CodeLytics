# CodeLytics

A full-stack platform for colleges to track student performance on competitive programming problems across LeetCode, Codeforces, and GeeksforGeeks. Teachers assign topic-wise problems, students track their progress, and institutions get a unified leaderboard and analytics view.

---

## Features

### For Students
- View assigned problems organized by topic and subtopic
- Track progress: Pending / In Progress / Completed / Skipped
- Sync solved problems from Codeforces automatically
- Connect platform handles (LeetCode, Codeforces, GFG)
- Personal problem sheet with search and difficulty filters

### For Teachers
- Create and manage problem assignments by topic/subtopic
- View per-problem class standings (how many students solved each problem)
- Class-wide standings board per subtopic
- Batch leaderboard and analytics with charts

### For Colleges
- Create and manage batches (cohorts)
- Add teachers and students to batches
- Institution-level dashboard and settings

### Platform
- Role-based authentication: College / Teacher / Student
- JWT with refresh token rotation
- Codeforces API sync for auto-verifying solved problems
- Submission sync token for browser extension integration
- Analytics with bar charts and calendar heatmaps

---

## Tech Stack

**Frontend**
- React 19, Vite, React Router
- Redux Toolkit (auth state)
- Tailwind CSS + DaisyUI
- Recharts, react-calendar-heatmap
- React Hook Form + Zod
- Axios, Framer Motion, Lucide Icons

**Backend**
- Node.js, Express 5
- Prisma ORM with PostgreSQL (Neon)
- JWT (access + refresh tokens)
- bcrypt, CORS, cookie-parser

**Database**
- PostgreSQL via Neon (serverless, connection pooling)

---

## Project Structure

```
CodeLytics/
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── Pages/          # Route-level page components
│   │   ├── Components/     # Reusable UI components
│   │   ├── store/          # Redux store & slices
│   │   └── utils/          # Axios client, helpers
│   └── public/             # Static assets
│
├── backend/                # Express REST API
│   ├── src/
│   │   ├── routes/         # Route definitions
│   │   ├── controllers/    # Request handlers
│   │   ├── middlewares/    # Auth middleware (RBAC)
│   │   └── utils/          # CF checker, platform helpers
│   └── prisma/
│       └── schema.prisma   # Database schema
│
├── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A PostgreSQL database (e.g. [Neon](https://neon.tech))

### 1. Clone the repo

```bash
git clone https://github.com/kumarideepali0402/CodeLytics.git
cd CodeLytics
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=your_jwt_secret_here
REFRESH_SECRET=your_refresh_secret_here
ORIGIN=http://localhost:5173
NODE_ENV=development
```

Run database migrations and start the server:

```bash
npx prisma migrate deploy
npm run dev
```

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BASE_URL=http://localhost:3000
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Overview

| Prefix | Description |
|---|---|
| `POST /api/auth/login` | Login (college / teacher / student) |
| `GET /api/auth/check` | Verify current session |
| `POST /api/auth/logout` | Logout |
| `GET/POST /api/college` | College management |
| `GET/POST /api/batch` | Batch CRUD |
| `GET/POST /api/teacher` | Teacher management |
| `GET/POST /api/student` | Student management, platform handles |
| `POST /api/student/sync/codeforces` | Sync Codeforces submissions |
| `GET /api/assignment/batch-outline/:batchId` | Fetch topic/problem outline for a batch |
| `POST /api/assignment/assign-homework` | Assign problems to a batch |
| `GET/POST /api/platform` | Platform list |

All protected routes require a valid JWT in the `Authorization` header or via an HTTP-only cookie.

---

## Database Schema (Key Models)

```
College ──< Batch ──< StudentBatch ──> User (STUDENT)
                 └──< TeacherBatch ──> User (TEACHER)
                 └──< ProblemAssignment ──< ProblemStatus ──> User
                                       └──> Problem ──> Platform

User ──< StudentPlatformAccount ──> Platform
```

- **Batch** — a cohort/class within a college
- **ProblemAssignment** — a problem assigned to a batch under a topic/subtopic
- **ProblemStatus** — a student's solve status for an assigned problem
- **StudentPlatformAccount** — stores the student's handle and cached solved problems per platform

---

## Deployment

The app is deployed on [Render](https://codelyticsfrontend.onrender.com):

- **Backend** — Web Service running `tsx src/index.js`
- **Frontend** — Static Site built with `npm run build` (Vite outputs to `dist/`)
- **Database** — Neon PostgreSQL (serverless)

Set the same environment variables from the setup section in your Render service dashboard.

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes with clear commit messages
3. Open a pull request describing what you changed and why


