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
- JWT access token (15 min) + refresh token (7 days) with automatic rotation
- Codeforces API sync for auto-verifying solved problems
- Analytics with bar charts and calendar heatmaps

### Browser Extension (Chrome)
- One-click sync of solved problems from LeetCode and GeeksforGeeks
- Reads your existing platform session — no credentials stored
- Uses a dedicated sync token (separate from your JWT) for secure extension auth
- Sync token generated from your student dashboard, can be rotated independently

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
- JWT (access + refresh tokens), bcrypt, CORS, cookie-parser

**Browser Extension**
- Chrome Manifest v3
- Service worker (`background.js`) for LeetCode GraphQL + GFG scripting
- Popup UI for setup (backend URL, sync token, GFG handle)

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
├── extension/              # Chrome MV3 extension
│   ├── manifest.json       # Permissions, service worker declaration
│   ├── background.js       # Sync logic (LeetCode + GFG)
│   ├── popup.html          # Setup form UI
│   └── popup.js            # Popup event handlers, chrome.storage
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

### 4. Browser Extension setup

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the `extension/` folder
4. Log in to your student account on the platform
5. Go to your **Student Dashboard → Settings → Generate Sync Token**
6. Click the extension icon in Chrome and fill in:
   - **Backend URL** — e.g. `http://localhost:3000` or your deployed URL
   - **Sync Token** — the token from step 5
   - **GFG Handle** — your GeeksForGeeks username (for GFG sync)
7. Make sure you're logged in to LeetCode / GFG in Chrome, then click **Sync LeetCode** or **Sync GFG**

---

## Authentication & Token Flow

CodeLytics uses two separate token systems:

### JWT Access & Refresh Tokens (session auth)

| Token | Storage | Expiry | Purpose |
|-------|---------|--------|---------|
| `token` (access token) | HTTP-only cookie | 15 minutes | Authenticates API requests |
| `refreshToken` | HTTP-only cookie | 7 days | Issues a new access token silently |

**How it works:**
1. `POST /api/auth/login` — sets both cookies on successful login
2. Every protected request reads the `token` cookie; if valid, proceeds
3. On 401 (token expired), the Axios interceptor on the frontend automatically calls `POST /api/auth/refresh`
4. The refresh endpoint validates `refreshToken`, issues **new** access + refresh tokens (rotation), and retries the original request
5. If the refresh token is also expired or invalid, the user is redirected to login

Token payload:
```json
{ "id": "...", "emailId": "...", "role": "COLLEGE | TEACHER | STUDENT" }
```

Env vars required:
```env
JWT_SECRET=...        # signs access tokens
REFRESH_SECRET=...    # signs refresh tokens (different secret for rotation security)
```

### Sync Token (extension auth)

The browser extension cannot access HTTP-only cookies, so it uses a **separate sync token**:

- Generated via `POST /api/student/generate-sync-token` (requires JWT auth)
- Stored in the database against the student's record
- Passed as `Authorization: Bearer <syncToken>` in extension requests
- **Read-only** — only allows syncing solved problem IDs, nothing else
- Can be regenerated at any time from the student dashboard (old token is immediately invalidated)

```
Extension → POST /api/student/ext-sync
  Header: Authorization: Bearer <syncToken>
  Body:   { platform: "leetcode", solvedIds: ["two-sum", "..."] }
  ↓
Backend validates syncToken → looks up student → upserts ProblemStatus records
```

---

## API Overview

| Route | Auth | Description |
|---|---|---|
| `POST /api/auth/login` | — | Login (college / teacher / student) |
| `POST /api/auth/refresh` | refreshToken cookie | Issue new access + refresh tokens |
| `GET /api/auth/check` | access token | Verify current session |
| `POST /api/auth/logout` | access token | Clear cookies |
| `GET/POST /api/college` | — / college | College management |
| `GET/POST /api/batch` | college | Batch CRUD |
| `GET/POST /api/teacher` | college | Teacher management |
| `GET/POST /api/student` | college / student | Student management, platform handles |
| `POST /api/student/generate-sync-token` | student JWT | Generate extension sync token |
| `POST /api/student/ext-sync` | Bearer syncToken | Browser extension problem sync |
| `POST /api/student/sync/codeforces` | student JWT | Sync Codeforces via backend |
| `GET /api/assignment/batch-outline/:batchId` | teacher/college | Topic/problem outline for a batch |
| `POST /api/assignment/assign-homework` | teacher | Assign problems to a batch |
| `GET/POST /api/platform` | — | Platform list |

Protected routes require a valid access token cookie. The extension sync endpoint (`/ext-sync`) uses a Bearer sync token instead.

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


