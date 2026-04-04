# DataForge — Football Practitioner Data Platform

> **Solving the problem:** *"Manque de données sur les pratiquants de sports"*

DataForge is a startup-grade football intelligence platform that enables structured collection, exploration, validation, analysis, and reporting of practitioner and match data across clubs, academies, schools, and leagues.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Domain Model](#domain-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Seed Data](#seed-data)
- [Architecture](#architecture)
- [Deployment](#deployment)
- [Known Tradeoffs & Roadmap](#known-tradeoffs--roadmap)

---

## Overview

Football organizations — academies, clubs, schools, federations — lack reliable systems for collecting and using practitioner data. Player development, match performance, training attendance, scouting findings, and organizational structure are often scattered, incomplete, or not captured at all.

DataForge provides a single platform to:

- Capture **player profiles** with full identity, physical, and career data
- Record **matches** with 30+ team and per-player statistics
- Track **training sessions** and player attendance
- Write **scouting reports** with ratings and recommendations
- Manage **organizations**, clubs, teams, and competitions
- Monitor **data quality** — completeness scores, missing data, duplicates
- Run **analytics** — participation trends, position distribution, performance metrics

---

## Features

| Module | Status |
|---|---|
| Authentication (credentials + session) | ✅ |
| Role-based access control | ✅ |
| Player profiles + completeness scoring | ✅ |
| Team management | ✅ |
| Match management + statistics (30+ fields) | ✅ |
| Per-player match statistics | ✅ |
| Training sessions + attendance | ✅ |
| Scouting reports | ✅ |
| Organization + club hierarchy | ✅ |
| Analytics dashboard | ✅ |
| Data quality dashboard | ✅ |
| Global search | ✅ |
| Dark mode | ✅ |
| Animated landing page (Framer Motion) | ✅ |
| CSV import | 🔜 |
| Email notifications | 🔜 |
| Multi-tenant federation mode | 🔜 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui patterns |
| Database | SQLite (dev) / PostgreSQL (prod) |
| ORM | Prisma 6 |
| Auth | NextAuth.js v5 (credentials provider) |
| Charts | Recharts |
| Animations | Framer Motion |
| Validation | Zod v4 |
| Forms | Native FormData + server actions |
| Icons | Lucide React |
| Theme | next-themes (dark/light/system) |

---

## Domain Model

The schema contains 24 models across 5 domain groups:

```
Auth & Access
  User · UserOrganization

Organizational Structure
  Organization · Club · Team · Season · Competition · CompetitionEntry · Venue

People
  Player · PlayerSeasonRegistration · PlayerTeamAssignment

Football Activity
  Match · MatchEvent · TeamMatchStats · PlayerMatchStats
  TrainingSession · TrainingAttendance
  Assessment · InjuryRecord · ScoutReport

Governance & Quality
  AuditLog · Notification · DataQualityIssue
```

Key modeling decisions:
- **Player identity vs. participation** — `Player` is permanent; `PlayerTeamAssignment` and `PlayerSeasonRegistration` are seasonal
- **Match data is separable** — `Match`, `TeamMatchStats`, `PlayerMatchStats`, and `MatchEvent` are independent tables
- **Provenance on every major record** — `createdById`, `updatedById`, `createdAt`, `updatedAt`
- **Soft deletes** — `archivedAt` on Player, Club, Organization (data is never destroyed)
- **Season-aware** — rosters, registrations, and stats are all scoped to a `Season`

---

## Project Structure

```
src/
├── app/
│   ├── (app)/              # Authenticated app routes
│   │   ├── dashboard/
│   │   ├── players/        # List, detail, new
│   │   ├── teams/          # List, detail, new
│   │   ├── matches/        # List, detail, new
│   │   ├── training/       # List, detail ([id]), new
│   │   ├── scouting/       # List, new
│   │   ├── organizations/  # List, new
│   │   ├── analytics/
│   │   ├── data-quality/
│   │   ├── search/
│   │   └── settings/
│   ├── (auth)/             # Public auth routes
│   │   ├── login/
│   │   └── register/
│   ├── api/auth/           # NextAuth route handler
│   ├── globals.css         # CSS variables (light + dark)
│   ├── layout.tsx
│   └── page.tsx            # Landing page
├── components/
│   ├── layout/             # Header, Sidebar, Providers
│   └── ui/                 # shadcn-style primitives + custom components
│       ├── shape-landing-hero.tsx
│       ├── theme-toggle.tsx
│       └── ...
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma singleton
│   └── utils.ts            # cn(), formatDate(), getInitials()
└── services/               # Server actions (data layer)
    ├── player-actions.ts
    ├── team-actions.ts
    ├── match-actions.ts
    ├── training-actions.ts
    ├── scouting-actions.ts
    ├── organization-actions.ts
    ├── search-actions.ts
    └── auth-actions.ts

prisma/
├── schema.prisma
└── seed.mjs                # Moroccan football demo data
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repo
git clone <your-repo-url>
cd dataforge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed with demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo credentials (after seeding)

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@dataforge.com | password123 |
| Coach | coach@dataforge.com | password123 |
| Scout | scout@dataforge.com | password123 |
| Analyst | analyst@dataforge.com | password123 |

---

## Environment Variables

Create a `.env` file from the template below:

```env
# Database
# SQLite (development)
DATABASE_URL="file:./dev.db"

# PostgreSQL (production)
# DATABASE_URL="postgresql://user:password@host:5432/dataforge"

# NextAuth
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
# In production: NEXTAUTH_URL="https://yourdomain.com"
```

Generate a strong `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

---

## Database

### Scripts

```bash
npm run db:migrate     # Apply pending migrations (creates DB if needed)
npm run db:generate    # Regenerate Prisma client after schema changes
npm run db:seed        # Seed demo data (Moroccan football clubs + players)
npm run db:reset       # Drop and recreate database + re-run migrations
npm run db:studio      # Open Prisma Studio (visual DB browser) at localhost:5555
```

### Switching to PostgreSQL

1. Install the PostgreSQL driver:
   ```bash
   npm install pg
   ```

2. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. Update `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/dataforge"
   ```

4. Re-run migrations:
   ```bash
   npm run db:migrate
   ```

---

## Seed Data

The seed script (`prisma/seed.mjs`) populates the database with realistic Moroccan football data:

- 4 user accounts (admin, coach, scout, analyst)
- 1 organization (Fédération Royale Marocaine de Football)
- 3 clubs (Raja Club Athletic, Wydad Athletic Club, AS FAR)
- 6 teams across age groups
- 20+ players with full profiles
- 3 training sessions with attendance records
- 2 scouting reports
- 2 matches with team statistics

```bash
npm run db:seed
```

To reset and re-seed from scratch:

```bash
npm run db:reset && npm run db:seed
```

---

## Architecture

### Request flow

```
Browser → Next.js Middleware (auth check)
       → App Router (RSC page component)
       → Service layer (server action)
       → Prisma → SQLite / PostgreSQL
```

### Server Actions pattern

All data mutations go through server actions in `src/services/`:

```typescript
// services/player-actions.ts
"use server";

export async function createPlayer(data: Record<string, unknown>) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  // validate → persist → revalidatePath → return { success } | { error }
}
```

Client forms call these directly — no API routes needed for mutations. Read-heavy pages use async RSC components that call Prisma directly.

### Auth flow

- NextAuth v5 with credentials provider
- Session stored in JWT (stateless)
- Middleware at `src/middleware.ts` protects all `/(app)/*` routes
- Role is embedded in the JWT token and accessible via `session.user.role`

### Dark mode

- `next-themes` with `attribute="class"` strategy
- CSS variables in `globals.css` under `:root` (light) and `.dark` (dark)
- All colors reference `hsl(var(--...))` tokens — no hardcoded hex in components
- Toggle button in app header (sun/moon icon)

---

## Deployment

### Option 1: Vercel (recommended for SQLite-free / PostgreSQL)

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Set environment variables in the Vercel dashboard:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=https://yourdomain.vercel.app
   ```
4. Add a build command override if needed:
   ```
   npx prisma generate && npx prisma migrate deploy && next build
   ```
5. Deploy

> **Note:** Vercel's filesystem is read-only — SQLite will not persist between deployments. Use PostgreSQL (Vercel Postgres, Neon, Supabase, Railway, or PlanetScale) for production.

### Option 2: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS builder
COPY . .
RUN npm ci
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t dataforge .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="http://localhost:3000" \
  dataforge
```

### Option 3: VPS / Self-hosted

```bash
# On your server
git clone <repo> && cd dataforge
npm ci
cp .env.production .env
npm run db:generate
npm run db:migrate
npm run build
npm start
```

Use **PM2** to keep the process alive:

```bash
npm install -g pm2
pm2 start npm --name dataforge -- start
pm2 save && pm2 startup
```

Use **Nginx** as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Testing

```bash
# Run unit tests (Vitest)
npm run test

# Run once (CI mode)
npm run test:run
```

Test files live alongside the code they test or in `__tests__/`. Core logic to test: validation functions, completeness scoring, search normalization.

---

## Known Tradeoffs & Roadmap

### Current tradeoffs

| Decision | Rationale |
|---|---|
| SQLite in dev | Zero-config local setup; swap to PostgreSQL for production |
| Prisma v6 (not v7) | v7 ESM-only output broke the seed script path resolution on Linux with special characters in the path |
| No email verification | Simplicity for MVP; can add Resend/Nodemailer later |
| No RBAC middleware per-route | Role check happens inside server actions; middleware only enforces auth |
| FormData + server actions (no react-hook-form on all forms) | Keeps bundle small; complex forms can opt into RHF |

### Roadmap

- [ ] CSV/Excel import for bulk player registration
- [ ] Email notifications (invite, report alerts)
- [ ] Full RBAC with per-organization permission scopes
- [ ] Player comparison view
- [ ] Match event timeline (goals, cards, substitutions)
- [ ] PDF export for scouting reports and match summaries
- [ ] Multi-language support (French primary)
- [ ] Mobile-first field-side data entry mode
- [ ] Public federation stats portal
- [ ] API layer for third-party integrations

---

## License

Private — all rights reserved. Built as part of a startup entrepreneurship project to address the structural lack of football practitioner data in Morocco and the MENA region.
