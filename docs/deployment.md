# DataForge — Deployment Guide

This document covers production deployment for three targets: **Vercel**, **Docker**, and **VPS/self-hosted**.

---

## Pre-deployment checklist

- [ ] PostgreSQL database provisioned and connection string ready
- [ ] `NEXTAUTH_SECRET` generated (`openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to your production domain
- [ ] `DATABASE_URL` pointing at PostgreSQL (not SQLite)
- [ ] Prisma schema `provider` changed to `postgresql` if still on SQLite
- [ ] `npm run build` passes locally with production env vars

---

## Option 1: Vercel

Vercel is the recommended deployment target for Next.js. The filesystem is ephemeral — use PostgreSQL, not SQLite.

### Recommended PostgreSQL providers

| Provider | Free tier | Notes |
|---|---|---|
| [Neon](https://neon.tech) | 0.5 GB | Serverless, auto-suspend |
| [Supabase](https://supabase.com) | 500 MB | Postgres + storage |
| [Railway](https://railway.app) | $5 credit | Simple provisioning |
| [PlanetScale](https://planetscale.com) | 5 GB | MySQL, not Postgres |

### Steps

1. **Provision a PostgreSQL database** (e.g., Neon — create project, copy connection string)

2. **Update `prisma/schema.prisma`** if still using SQLite:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Push to GitHub**

4. **Import in Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repo
   - Framework preset: Next.js (auto-detected)

5. **Set environment variables** in Vercel dashboard → Settings → Environment Variables:
   ```
   DATABASE_URL        postgresql://user:pass@host/dataforge?sslmode=require
   NEXTAUTH_SECRET     <your generated secret>
   NEXTAUTH_URL        https://your-project.vercel.app
   ```

6. **Override the build command** (Settings → Build & Output):
   ```bash
   npx prisma generate && npx prisma migrate deploy && next build
   ```
   This runs migrations on every deploy before the build.

7. **Deploy** — Vercel will build and deploy automatically on every push to `main`.

### Post-deploy

Seed demo data (run once from your local machine against the production database):
```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## Option 2: Docker

### Dockerfile

Create a `Dockerfile` at the project root:

```dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

# Dependencies
FROM base AS deps
RUN npm ci

# Build
FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

# Runtime
FROM base AS runner
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Add to `next.config.mjs`:
```js
const nextConfig = {
  output: "standalone",
};
export default nextConfig;
```

### Build and run

```bash
docker build -t dataforge .

docker run -d \
  --name dataforge \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/dataforge" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  dataforge
```

### Docker Compose (with PostgreSQL)

```yaml
# docker-compose.yml
version: "3.9"

services:
  db:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: dataforge
      POSTGRES_USER: dataforge
      POSTGRES_PASSWORD: changeme
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    restart: unless-stopped
    depends_on:
      - db
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://dataforge:changeme@db:5432/dataforge
      NEXTAUTH_SECRET: your-generated-secret
      NEXTAUTH_URL: http://localhost:3000

volumes:
  postgres_data:
```

```bash
# Start everything
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy

# Seed (optional)
docker compose exec app node prisma/seed.mjs
```

---

## Option 3: VPS / Self-hosted

Tested on Ubuntu 22.04 LTS with Node.js 20.

### Server setup

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql <<EOF
CREATE USER dataforge WITH PASSWORD 'your-password';
CREATE DATABASE dataforge OWNER dataforge;
GRANT ALL PRIVILEGES ON DATABASE dataforge TO dataforge;
EOF
```

### Application deployment

```bash
# Clone and install
git clone <your-repo> /var/www/dataforge
cd /var/www/dataforge
npm ci

# Configure environment
cp .env.example .env
nano .env  # Fill in DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

# Database
npx prisma generate
npx prisma migrate deploy

# Build
npm run build

# (Optional) seed
node prisma/seed.mjs
```

### PM2 process management

```bash
npm install -g pm2

# Start
pm2 start npm --name dataforge -- start

# Enable startup on reboot
pm2 save
pm2 startup

# Useful commands
pm2 status
pm2 logs dataforge
pm2 restart dataforge
```

### Nginx reverse proxy

```nginx
# /etc/nginx/sites-available/dataforge
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/dataforge /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot automatically updates your Nginx config and sets up auto-renewal.

### Updating the application

```bash
cd /var/www/dataforge
git pull
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart dataforge
```

---

## Database migrations in production

Always use `migrate deploy` (not `migrate dev`) in production:

```bash
# Safe: applies pending migrations without interactive prompts
npx prisma migrate deploy

# Never use in production (interactive, creates migration history entries)
# npx prisma migrate dev
```

### Rollback strategy

Prisma does not support automatic rollbacks. If a migration causes issues:

1. Restore from your database backup
2. Fix the migration file
3. Re-deploy

Always take a database backup before deploying migrations:
```bash
# PostgreSQL backup
pg_dump -U dataforge dataforge > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql -U dataforge dataforge < backup_YYYYMMDD_HHMMSS.sql
```

---

## Monitoring & health

The app exposes no dedicated `/health` endpoint by default. Add one via a route handler if needed:

```typescript
// src/app/api/health/route.ts
export async function GET() {
  return Response.json({ status: "ok", timestamp: new Date().toISOString() });
}
```

For production monitoring consider: **Sentry** (errors), **Axiom** or **Logtail** (logs), **UptimeRobot** (uptime).

---

## Security hardening

- Set `NEXTAUTH_SECRET` to at least 32 random bytes
- Use HTTPS in production (Let's Encrypt or Vercel's built-in TLS)
- Keep `DATABASE_URL` out of version control (`.env` is gitignored)
- Rotate `NEXTAUTH_SECRET` if compromised (invalidates all sessions)
- Set up PostgreSQL connection pooling (PgBouncer or Neon's built-in) for high traffic
- Rate-limit the auth endpoints if exposed publicly
