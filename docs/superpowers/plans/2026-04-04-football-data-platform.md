# Football Practitioner Data Platform - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a startup-grade football data intelligence platform that solves "Manque de donnees sur les pratiquants de sports" through structured collection, validation, analysis, and exploration of football practitioner and match data.

**Architecture:** Next.js 14 App Router with TypeScript, server components, and server actions for a full-stack monolith. Prisma ORM with SQLite (dev) / PostgreSQL (prod). Domain-driven folder structure with clear separation between UI, services, validation, and data layers. Role-based access control with organization-scoped permissions.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Prisma, NextAuth.js v5, Zod, React Hook Form, Recharts, TanStack Table, bcryptjs, SQLite (dev) / PostgreSQL (prod)

---

## 1. Mission Restatement

**Core problem:** Sports organizations (clubs, academies, schools, federations) lack structured, reliable, and usable data on football practitioners. Available data is scattered, incomplete, inconsistent, and not actionable.

**Solution:** A centralized football data platform enabling:
- Structured collection of practitioner profiles, team data, match statistics, training records, and scouting observations
- Validation and quality scoring to build trust in the data
- Search, filtering, and analytics to make data actionable
- Role-based workflows for coaches, scouts, admins, analysts, and federation staff
- Progressive data completeness tracking to close data gaps over time

**Success criteria:**
1. A real user can register an organization, add players/teams, record matches with rich statistics, and see analytics - all in under 30 minutes
2. Data completeness is visible everywhere - the system actively reveals and helps close data gaps
3. The architecture supports evolution from single-academy to national-scale deployment
4. The UX feels like a funded startup product, not a school project

---

## 2. Product Assumptions

1. **Primary users are football staff** - coaches, club admins, academy directors, scouts, data analysts at organizations
2. **Data entry happens on laptops and tablets** - pitch-side mobile entry is secondary but must be supported
3. **Multi-organization from day one** - each organization sees only its own data; federation/league roles see across organizations
4. **French-speaking market first** - UI architecture supports i18n; default implementation in English with French-ready string architecture
5. **Youth and senior football** - age groups from U6 to senior; youth players need guardian/privacy handling
6. **No real-time match tracking** - matches are recorded post-game; real-time is a future feature
7. **SQLite for development** - PostgreSQL for production; Prisma abstracts the difference
8. **Single deployment** - not SaaS multi-tenant yet, but organization isolation is built in

---

## 3. User Personas and Role Permissions

| Role | Goals | Key Actions | Data Access |
|------|-------|-------------|-------------|
| **Super Admin** | Platform governance | Manage all orgs, users, system settings | Full |
| **Org Admin** | Run their organization | Manage org structure, invite users, configure | Own org |
| **Club Manager** | Manage club operations | Teams, rosters, staff, registrations | Own club |
| **Coach** | Track team and player development | Record matches, training, assessments | Own teams |
| **Scout** | Evaluate talent | Create scout reports, watchlists, comparisons | Read across orgs (if permitted) |
| **Data Analyst** | Analyze and report | Run queries, build reports, export data | Own org or cross-org (if permitted) |
| **Referee** | (Future) Submit match reports | Match officiating data | Match-scoped |
| **Player** | (Future) View own profile | View stats, profile, history | Own data |
| **Parent/Guardian** | (Future) Monitor youth player | View child's profile, consent management | Child's data |
| **Public Viewer** | Browse public stats | View published data only | Public only |

---

## 4. Full Feature Map

### Phase 1 (MVP Core)
- Authentication (login/register/logout)
- Organization and club management
- Team management with season rosters
- Player profile management with completeness scoring
- Match creation with team stats and player stats
- Main dashboard with KPIs
- Basic search and filtering
- Seed data for demo

### Phase 2 (Data Depth)
- Advanced match events timeline
- Training session and attendance tracking
- Scouting reports and watchlists
- Advanced analytics dashboards
- Data quality scoring and governance
- CSV import/export
- Audit logging

### Phase 3 (Intelligence)
- Duplicate detection and merge workflows
- Historical versioning for key records
- Player comparison tools
- Advanced search with saved filters
- Notification system
- Report generation (PDF)
- Competition and season management

### Phase 4 (Scale)
- Multi-tenant SaaS readiness
- API for external integrations
- Mobile-optimized data entry
- Geographic talent mapping
- Advanced permission configurations
- Performance optimization
- Deployment hardening

---

## 5. Domain Model

### Entity Relationship Summary

```
Organization (1) --< Club (1) --< Team (1) --< PlayerTeamAssignment >-- Player
                                      |                                    |
                                      |                              PlayerProfile
                                      |                                    |
                                 Season --< Competition                    |
                                      |         |                          |
                                      |    Match (home/away teams)         |
                                      |      |        |                    |
                                      | MatchEvent  TeamMatchStats         |
                                      |              |                     |
                                      |         PlayerMatchStats --------- +
                                      |
                                 TrainingSession --< TrainingAttendance
                                      |
                                 ScoutReport
```

### Core Entities (30+)

**Identity & Auth:** User, Role, UserOrganization
**Organization:** Organization, Club, Team, Season, Venue
**People:** Player, PlayerProfile, Coach (via User role)
**Sporting:** Competition, Match, MatchEvent, TeamMatchStats, PlayerMatchStats
**Roster:** PlayerTeamAssignment, PlayerSeasonRegistration
**Development:** TrainingSession, TrainingAttendance, Assessment, InjuryRecord
**Scouting:** ScoutReport, ScoutWatchlist
**Governance:** AuditLog, DataQualityIssue
**System:** Notification

---

## 6. Database Schema (Prisma)

See `prisma/schema.prisma` for the complete schema. Key design decisions:

1. **Organization-scoped isolation:** All major entities have an `organizationId` FK
2. **Season-aware:** Rosters, registrations, competitions are season-scoped
3. **Temporal history:** PlayerTeamAssignment has start/end dates; player profiles are versioned by updates
4. **Completeness scoring:** Players, teams, matches have computed completeness percentages
5. **Soft deletes:** `archivedAt` on major entities instead of hard delete
6. **Provenance:** `createdById`, `updatedById`, timestamps on all records
7. **Enums as strings:** SQLite-compatible; maps cleanly to PostgreSQL enums

---

## 7. Main User Journeys

### Journey 1: Onboarding
1. Register account -> Create organization -> Invite staff
2. Create first season -> Create teams -> Add players
3. Record first match -> See dashboard come alive

### Journey 2: Match Day Recording
1. Navigate to Matches -> Create Match
2. Select teams, competition, venue, date
3. Set lineups (starting XI + bench)
4. After match: enter score, team stats
5. Enter player-level stats
6. Add match events (goals, cards, subs)
7. Submit -> dashboard/analytics update

### Journey 3: Player Scouting
1. Scout browses players across allowed scope
2. Views player profile with stats, history, completeness
3. Creates scout report with evaluation
4. Adds to watchlist
5. Generates comparison report

### Journey 4: Data Quality Improvement
1. Admin views data coverage dashboard
2. Sees organizations/teams with low completeness
3. Identifies missing player profiles, incomplete match records
4. Assigns data collection tasks
5. Tracks completeness improvement over time

---

## 8. UX / Information Architecture

```
/                           -> Landing / marketing
/login                      -> Login
/register                   -> Register + create org
/dashboard                  -> Main dashboard (post-login home)
/players                    -> Player list (search, filter, paginate)
/players/new                -> Create player form
/players/[id]               -> Player detail profile
/players/[id]/edit          -> Edit player form
/teams                      -> Team list
/teams/new                  -> Create team
/teams/[id]                 -> Team detail (roster, stats, matches)
/teams/[id]/edit            -> Edit team
/matches                    -> Match list
/matches/new                -> Create match (multi-step form)
/matches/[id]               -> Match detail (stats, events, lineups)
/matches/[id]/edit          -> Edit match
/organizations              -> Organization management
/organizations/[id]         -> Organization detail
/clubs                      -> Club list
/clubs/new                  -> Create club
/clubs/[id]                 -> Club detail
/analytics                  -> Analytics hub
/analytics/players          -> Player analytics
/analytics/matches          -> Match analytics
/analytics/data-quality     -> Data completeness dashboard
/scouting                   -> Scouting hub
/scouting/reports           -> Scout reports
/scouting/watchlist         -> Watchlist
/settings                   -> User/org settings
/admin                      -> Super admin panel
```

---

## 9. API Design

Using Next.js Server Actions and API Routes:

**Server Actions (for mutations):**
- `createPlayer`, `updatePlayer`, `deletePlayer`
- `createTeam`, `updateTeam`, `deleteTeam`
- `createMatch`, `updateMatch`, `deleteMatch`
- `createMatchEvent`, `updateTeamMatchStats`, `updatePlayerMatchStats`
- `createOrganization`, `updateOrganization`
- `inviteUser`, `updateUserRole`

**API Routes (for data fetching and external access):**
- `GET /api/players` - list with filters
- `GET /api/players/[id]` - player detail
- `GET /api/teams` - list with filters
- `GET /api/matches` - list with filters
- `GET /api/analytics/dashboard` - dashboard KPIs
- `GET /api/analytics/completeness` - data quality metrics

---

## 10. Security and Privacy Model

1. **Auth:** NextAuth.js with credentials provider + bcrypt password hashing
2. **Sessions:** JWT-based server-side sessions
3. **RBAC:** Role checked on every server action and API route
4. **Org isolation:** All queries scoped to user's organization
5. **Input validation:** Zod schemas on all boundaries
6. **CSRF:** Built into Next.js server actions
7. **Audit:** Sensitive actions logged to AuditLog
8. **Youth privacy:** Guardian fields, restricted visibility for minor data
9. **Soft delete:** No hard deletes on important records
10. **Secrets:** Environment variables only, never in code

---

## 11. Data Quality and Governance Model

1. **Completeness scoring:** Each player/team/match has a computed `completenessScore` (0-100) based on filled fields
2. **Required vs optional fields:** Progressive - minimal required for creation, completeness incentivized
3. **Validation layers:**
   - Type validation (Zod schemas)
   - Business rules (football logic - e.g., 11 starters, valid minutes)
   - Cross-record consistency (team goals = sum of scorer events)
4. **Provenance:** Every record tracks creator, updater, timestamps
5. **Data quality dashboard:** Shows completeness by org/team/entity type

---

## 12. Analytics and Dashboard Plan

### Main Dashboard
- Total practitioners count with growth trend
- Matches recorded this season
- Data completeness score (org-wide)
- Recent activity feed
- Quick actions (add player, record match)
- Top performers preview

### Analytics Pages
- **Player Analytics:** Distribution by position, age group, club; top scorers/assisters
- **Match Analytics:** Results distribution, goals per match trends, team comparisons
- **Data Quality:** Completeness heatmap by entity type, missing data hotspots, improvement trends

---

## 13. Technical Stack with Rationale

| Choice | Rationale |
|--------|-----------|
| Next.js 14 App Router | Server components for performance; server actions for type-safe mutations; single deployment unit |
| TypeScript | Type safety across full stack; Prisma generates typed client |
| Tailwind + shadcn/ui | Professional component system; accessible; highly customizable; no external CSS dependencies |
| Prisma | Type-safe database access; excellent migration system; supports SQLite and PostgreSQL |
| NextAuth.js v5 | Battle-tested auth; supports multiple providers; integrates natively with Next.js |
| Zod | Runtime validation that generates TypeScript types; integrates with React Hook Form |
| React Hook Form | Performant forms with excellent validation integration |
| Recharts | React-native charting; composable; good for dashboards |
| TanStack Table | Headless table with sorting, filtering, pagination |
| bcryptjs | Pure JS bcrypt for password hashing (no native dependencies) |
| SQLite (dev) | Zero-config local development; Prisma makes PostgreSQL migration trivial |

---

## 14. Implementation Phases

### Phase 1: MVP Foundation (This implementation)
- [x] Project initialization
- [ ] Full Prisma schema
- [ ] Auth system
- [ ] Design system + layout
- [ ] Dashboard
- [ ] Player CRUD + profiles
- [ ] Team CRUD + rosters
- [ ] Match CRUD + stats
- [ ] Seed data
- [ ] Basic analytics

### Phase 2: Data Depth (Future)
- Training sessions + attendance
- Scouting reports + watchlists
- CSV import/export
- Advanced analytics
- Audit logging

### Phase 3: Intelligence (Future)
- Duplicate detection + merge
- Player comparison
- Notification system
- Report generation
- Competition management

### Phase 4: Scale (Future)
- Multi-tenant SaaS
- External API
- Mobile optimization
- Geographic mapping
- Performance hardening

---

## 15. Risks, Edge Cases, and Mitigation

| Risk | Mitigation |
|------|------------|
| SQLite limitations (no enums, arrays) | Use string types; Prisma abstraction; documented PostgreSQL migration path |
| Form complexity for match entry | Multi-step form with auto-save; progressive disclosure |
| Data inconsistency (stats don't add up) | Validation rules for football logic |
| Orphaned records on deletion | Soft deletes only; cascade rules in schema |
| Performance with large datasets | Pagination everywhere; indexed queries; server components |
| Youth player privacy | Guardian fields; role-based field visibility |

---

## 16. What Was Added Beyond Original Request

1. **Completeness scoring algorithm** - not just tracking but actively computing and displaying data gaps
2. **Server Actions architecture** - modern Next.js pattern for type-safe mutations (not traditional REST)
3. **Progressive form design** - long forms split into sections with draft saving capability
4. **Organization-scoped multi-tenancy** - even in MVP, data isolation is built in
5. **Seed data with realistic football data** - Moroccan/French league teams, realistic player names, match statistics
6. **Football-specific validation** - lineup size, minutes consistency, score alignment with events
7. **Audit trail on sensitive operations** - not just logging but queryable history
8. **Data quality dashboard** - dedicated analytics for the meta-problem (how complete is our data?)

---

## Business Maturity Deliverables

### Monetization Strategy
1. **Freemium:** Free for single club (1 team, 25 players); paid for multi-team, analytics, exports
2. **Federation licensing:** Per-region or per-league annual license for cross-organization analytics
3. **API access:** Paid API for data integrations (scouting platforms, media)
4. **Premium features:** Advanced analytics, PDF reports, scouting network access

### KPIs to Track
- Number of registered organizations
- Active users per week
- Players with >80% profile completeness
- Matches recorded per month
- Data quality score trend (org-level and platform-level)
- User retention at 30/60/90 days

### Data Moat Strategy
- Every match recorded adds to the platform's unique dataset
- Player history accumulates over seasons - switching platforms means losing history
- Cross-organization analytics (for federations) create network effects
- Completeness scoring incentivizes more data entry, creating a virtuous cycle

### Differentiation
- **Not a match tracker** - it's a practitioner data platform (broader scope)
- **Data quality as a feature** - no competitor shows you what data you're missing
- **Football-specific validation** - catches errors that generic platforms miss
- **Designed for emerging markets** - French-speaking Africa, North Africa, where data gaps are largest
