## Bud Day - Elderly-first Social & Essentials Web App

Bud Day is an accessibility-focused web application designed for older adults to reduce isolation and simplify everyday tasks.

### Tech stack

- Frontend: React 18, Vite, TypeScript, React Router, Zustand, PWA manifest.
- Backend: Node.js, TypeScript, Express, Prisma, Socket.IO, JWT auth.
- Database: SQLite by default (`server/prisma/dev.db`) for local setup.

### Core features

- Phone + OTP sign in (passwordless).
- Activity matching with consent flow.
- 1:1 messaging with server-backed persistence.
- Scheduling for accepted matches using preset slots.
- Guided essentials ordering with delivery mock integration.
- Global voice assistant button with speech intent detection.
- Help & emergency check-ins and one-tap call actions.
- Profile/settings page for accessibility and communication preferences.

### Run locally

1. Install dependencies from repo root:

```bash
npm install
```

2. Configure backend environment (`server/.env`):

```bash
JWT_SECRET="change-me"
WEB_ORIGIN="http://localhost:5173"
DATABASE_URL="file:./dev.db"
```

3. Set up Prisma database:

```bash
cd server
npm run prisma:migrate
npm run prisma:generate
```

4. Start backend and frontend (separate terminals from repo root):

```bash
npm run dev:server
npm run dev:web
```

App runs on [http://localhost:5173](http://localhost:5173). API runs on [http://localhost:4000](http://localhost:4000).

### Notes

- OTP test code is `123456` in local development.
- The app uses real API calls first and falls back to mock data when backend is unavailable.
- ESLint scripts exist but no ESLint config is included yet in this repository.
