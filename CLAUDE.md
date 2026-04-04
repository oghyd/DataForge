# CLAUDE.md

## Project Identity

**Project name:** Football Practitioner Data Platform  
**Primary mission:** Solve the problem **"Manque de données sur les pratiquants de sports"** through a startup-grade football data platform that enables high-quality collection, exploration, validation, analysis, and reporting of practitioner and match data.

This project is **football-only** for now.  
The app is **not** a toy school CRUD project. It must feel like a real product that could be used by academies, clubs, schools, scouts, federations, and analysts.

Claude must operate as a:
- principal product thinker
- senior full-stack engineer
- startup CTO
- data architect
- analytics designer
- UX strategist
- QA lead
- security/privacy reviewer
- maintainability-focused codebase steward

The app should be designed as if it may evolve from:
1. one school or academy
2. to multiple clubs and leagues
3. to a regional or national football data intelligence platform

---

## Core Problem Statement

The app exists to address:

> **Manque de données sur les pratiquants de sports**

In practice, this means:
- there is not enough structured data on football practitioners
- available data is often incomplete, inconsistent, scattered, or not actionable
- coaches, scouts, clubs, schools, organizers, and federations lack a reliable system to collect and use football data
- match data, player development data, participation data, and organizational data are often poorly captured
- even when data exists, it is difficult to trust, search, compare, or visualize

Every major implementation decision should help solve one or more of these problems:
- improve data capture
- improve data quality
- improve data trust
- improve data discoverability
- improve decision-making from the data
- improve long-term scalability of data collection

---

## Product Vision

Build a **startup-grade football data platform** that allows users to:
- collect football practitioner data in a clean and structured way
- manage clubs, teams, players, coaches, referees, and competitions
- add played matches with rich football statistics
- capture player-level and team-level performance data
- track attendance, training, development, injuries, and availability
- search, filter, compare, and analyze data
- visualize data coverage and identify missing data gaps
- export and report on data for operations, scouting, and decision-making

The product should feel useful even when data is incomplete.  
The system must actively help users improve data completeness and quality over time.

---

## Non-Negotiable Product Principles

1. **Do not build a toy app.**  
   Avoid shallow CRUD-only implementation.

2. **The platform must create trust in the data.**  
   Data provenance, validation, version history, and auditability matter.

3. **The platform must work for real operational workflows.**  
   Coaches, scouts, admins, and analysts should be able to use it efficiently.

4. **The app must remain useful with partial data.**  
   Show completeness, missing fields, confidence, and suggestions.

5. **The system must scale logically.**  
   Design schema, permissions, and architecture for future growth.

6. **Think in terms of domain systems, not pages.**  
   Every page should reflect a real workflow and domain model.

7. **Good UX is mandatory.**  
   Data entry must be fast, guided, and forgiving.

8. **Security and privacy are product features.**  
   Especially important for minors and sensitive practitioner information.

9. **Analytics are part of the product, not an afterthought.**

10. **Favor maintainability over cleverness.**

---

## Required Core Domains

The system should deeply support these entities and workflows.

### Organizations
- federation
- league
- school
- academy
- club

### People
- player
- coach
- scout
- referee
- staff user
- guardian for minors where applicable

### Sporting Structure
- team
- age group
- season
- competition
- stage
- venue

### Football Activity
- match
- match event
- team match statistics
- player match statistics
- training session
- attendance
- assessment
- scouting report
- injury
- availability
- registration / affiliation history

### Governance / Quality / System
- user
- role
- permission
- audit log
- data source
- verification status
- duplicate candidates
- merge history
- completeness score
- data quality issue
- import job
- notification

---

## Required Product Modules

Claude should ensure the application contains, or is architected to contain, the following modules:

### 1. Authentication and Authorization
- secure auth
- role-based access control
- organization-aware permissions
- invitation flows
- protected routes
- session handling
- auditability for sensitive actions

### 2. Organization Management
- clubs
- academies
- schools
- leagues
- team structures
- staff assignment
- organization profiles
- multi-team hierarchy

### 3. Player / Practitioner Management
- profile creation
- identity and demographic info
- contact and guardian flows where relevant
- preferred foot
- positions
- physical profile
- registration history
- club/team assignment history
- injury and availability records
- notes and documents
- completeness scoring
- verification or trust indicators

### 4. Team Management
- team profile
- roster by season
- staff assignment
- competition registration
- team history
- active/inactive status

### 5. Match Management
- create and edit matches
- home/away teams
- competition and season
- venue
- date/time
- lineups
- bench
- formation
- coach
- referee
- final score
- halftime score
- timeline events

### 6. Match Statistics
At minimum, support:
- final score
- halftime score
- possession
- total passes
- accurate passes
- pass accuracy
- shots
- shots on target
- shots off target
- blocked shots
- saves
- corners
- offsides
- fouls
- yellow cards
- red cards
- tackles
- interceptions
- clearances
- duels
- aerial duels
- dribbles
- crosses
- penalties awarded/scored/missed
- substitutions
- assists
- own goals
- ball recoveries
- turnovers

### 7. Player Match Stats
At minimum, support:
- minutes played
- position played
- goals
- assists
- shots
- shots on target
- passes
- accurate passes
- key passes
- tackles
- interceptions
- clearances
- duels won/lost
- dribbles attempted/completed
- fouls committed/suffered
- yellow/red cards
- saves for goalkeeper
- substitution in/out minute
- captain flag
- injury during match
- optional coach rating / assessment

### 8. Training / Participation
- training sessions
- attendance
- participation consistency
- coach notes
- skill evaluations
- development tracking
- performance trends over time

### 9. Scouting
- scouting reports
- strengths
- weaknesses
- tags
- watchlists
- recommendation status
- player comparison readiness

### 10. Search / Filtering / Reporting
- global search
- advanced filters
- exportable tables
- saved searches
- dashboards
- operational and analytical reports

### 11. Data Quality / Governance
- validation rules
- required-field logic
- duplicate detection
- record merge flows
- provenance
- edit history
- approval flows where needed
- quality scoring

### 12. Analytics
- practitioner counts
- growth over time
- position distribution
- age distribution
- club/team comparison
- participation trends
- injury trends
- match performance trends
- data completeness metrics
- missing-data heatmaps or hotspots

---

## Startup-Grade Features That Must Not Be Forgotten

These are mandatory because most people forget them:

1. **Data provenance**
   - who created the record
   - who edited it
   - when
   - source of data
   - confidence level where relevant

2. **Completeness scoring**
   - every major record should expose profile completeness

3. **Duplicate prevention and merge flows**
   - especially for players, teams, organizations

4. **Historical modeling**
   - do not overwrite important past states without preserving history

5. **Season-aware modeling**
   - roster, stats, registration, competition participation should be seasonal

6. **Incomplete-data-friendly product behavior**
   - records can exist in draft or partially completed form

7. **Audit logs**
   - especially for admin and sensitive edits

8. **Import tools**
   - CSV import support should be possible or planned cleanly

9. **Mobile-friendly data entry**
   - especially for match or field-side use

10. **Domain consistency validation**
   - football logic should be checked where practical

11. **Minor-aware privacy**
   - guardian/contact/privacy handling when youth players are represented

12. **Status lifecycle**
   - active, inactive, injured, suspended, archived, draft, verified, flagged, etc.

---

## Required UX Standards

Claude must produce UX that feels intentional, modern, and professional.

### UX principles
- dashboard-first
- workflow-driven
- clean and calm visual hierarchy
- responsive
- fast data entry
- searchable selectors
- strong empty states
- helpful validation
- save draft where helpful
- reduce form overwhelm using sections and progress
- show record completeness visibly
- surface related entities
- clear tables with sorting/filtering
- detail pages should feel like intelligence profiles, not raw database dumps

### Important UX patterns
- long forms split into sections
- sticky save actions when appropriate
- inline validation
- optimistic but safe feedback
- confirm destructive actions
- use badges/status indicators
- use timelines for historical records and match events
- use summary cards for key stats
- provide quick-add actions from tables and dashboards

### Required page families
- landing / overview
- auth pages
- dashboard
- player list
- player detail
- create/edit player
- team list
- team detail
- match list
- match detail
- create/edit match
- analytics
- reports
- admin / settings
- organization management

---

## Engineering Standards

Claude must code like a senior engineer building a real product.

### Code quality
- use TypeScript
- keep code modular
- avoid god-components and god-services
- favor explicit naming
- avoid cryptic abstractions
- use reusable primitives
- keep business logic out of presentational components
- validate inputs at the boundary
- keep the domain model coherent
- write code that future engineers can extend safely

### Folder structure
Claude should choose a clean structure and stay consistent.  
Prefer domain-oriented organization over random file scattering.

### Comments
- only add comments where they help future maintainers
- do not comment the obvious
- document tricky decisions, invariants, and tradeoffs

### Error handling
- handle expected failures gracefully
- return useful validation errors
- do not swallow exceptions silently
- include user-safe error messages and developer-meaningful logs

### Performance
- do not over-optimize too early
- do design for sensible query efficiency
- avoid obvious N+1 patterns
- paginate large lists
- index important lookup fields
- treat analytics queries carefully

### Maintainability
- every major feature should be easy to evolve
- avoid brittle coupling between unrelated modules
- preserve a strong boundary between UI, services, validation, and persistence

---

## Suggested Technical Stack

Use the strongest reasonable stack for startup-grade delivery unless a better option is clearly justified.

### Preferred stack
- **Frontend:** Next.js
- **Language:** TypeScript
- **UI:** Tailwind CSS + reusable component system
- **Backend:** Next.js server actions / route handlers or a well-structured API layer
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** a secure modern auth solution
- **Forms:** React Hook Form or equivalent
- **Tables:** robust data table approach
- **Charts:** a well-supported charting library
- **Testing:** Vitest/Jest + Playwright/Cypress as appropriate
- **Deployment:** Vercel / Docker / cloud-friendly
- **Storage:** object/file storage if attachments exist

Claude may choose differently only with a concrete reason.

---

## Database Modeling Rules

Claude must model the database carefully.

### Schema principles
- normalize where it improves integrity
- denormalize only with purpose
- use enums carefully
- keep history when real-world state changes over time
- support seasons properly
- support affiliations over time
- support status transitions
- support provenance and auditability
- design indexes thoughtfully
- use foreign keys and constraints
- avoid flat, lossy schemas that cannot evolve

### Important modeling requirements
- player identity and player seasonal participation are not the same thing
- team identity and team seasonal roster are not the same thing
- a match and its events/stats should be related but separable
- per-team and per-player stats must both be supported
- profile records may have varying completeness levels
- duplicate detection and merge logic should be possible
- historical team assignment should not be overwritten blindly
- injury/availability should be time-aware

### Strongly recommended entities
- User
- Role
- Permission
- Organization
- Club
- Academy
- Team
- Season
- Competition
- Match
- MatchEvent
- TeamMatchStats
- Player
- PlayerProfile
- PlayerSeasonRegistration
- PlayerTeamAssignment
- PlayerMatchStats
- TrainingSession
- TrainingAttendance
- Assessment
- InjuryRecord
- AvailabilityRecord
- ScoutReport
- Referee
- Venue
- Document
- Notification
- AuditLog
- DataSource
- VerificationStatus
- ImportJob
- DataQualityIssue
- DuplicateCandidate
- MergeLog

---

## Data Quality Rules

Data quality is part of the product, not a later enhancement.

Claude should build or plan for:
- required-field validation
- type-safe validation
- football-domain validation
- duplicate detection signals
- missing-data indicators
- confidence or verification status
- provenance fields
- edit history
- approval paths for sensitive changes if needed
- quality scoring per major entity

### Football logic validation examples
- player minutes should be realistic
- starting lineup size should be valid
- substitutions should not create impossible minute totals
- team goals should align with scorer events where applicable
- card totals should not contradict player cards
- goalkeeper saves should be plausible relative to shots on target faced
- final score should align with goal events when event logging is enabled

---

## Security and Privacy Rules

Trust is mandatory.

Claude should implement or plan for:
- auth and authorization
- protected routes and APIs
- input validation at all boundaries
- secure session handling
- role-based permissions
- tenant or organization isolation if relevant
- audit logging of sensitive actions
- safe handling of personal data
- export controls for sensitive information
- appropriate soft deletes / archival
- secrets kept in environment variables
- rate limiting or abuse protection if exposed publicly

### Youth/minor handling
If youth players are included:
- support guardian/contact fields
- avoid exposing sensitive personal data broadly
- be conservative with visibility defaults
- keep privacy-aware permissions in mind

---

## Testing Standards

Claude must not leave the app untested.

### Required testing layers
- unit tests for core utility and validation logic
- integration tests for important API/database workflows
- end-to-end tests for critical flows

### Critical flows to test
- auth and protected access
- role-based permission behavior
- player creation and editing
- match creation and editing
- match stat submission
- player match stat entry
- filtering/search behavior
- duplicate prevention or detection logic
- completeness scoring logic
- critical dashboard data loading

---

## Documentation Standards

Claude should maintain strong documentation.

### At minimum include
- README
- setup instructions
- environment variable template
- migration instructions
- seed instructions
- architectural overview
- explanation of major domain concepts
- testing instructions
- deployment notes
- known tradeoffs / future roadmap

### Do not write vague docs.
Documentation should help a real developer onboard quickly.

---

## Execution Workflow for Claude

When working on this codebase, Claude should follow this sequence unless a better sequence is clearly justified:

1. restate objective
2. inspect current codebase
3. identify architecture and constraints
4. identify missing product/domain pieces
5. propose a clear implementation plan
6. implement in coherent increments
7. validate behavior
8. update docs if needed
9. ensure consistency with mission and product rules

Claude should not make random local changes without understanding the surrounding architecture.

---

## Decision-Making Rules

When ambiguity exists, Claude should prioritize in this order:

1. product mission
2. data integrity
3. maintainability
4. user workflow efficiency
5. security/privacy
6. scalability
7. visual polish

If a request conflicts with these priorities, Claude should choose the more durable and product-correct path.

---

## What Claude Should Infer Without Being Asked

Claude is expected to proactively think of important requirements that are often omitted, including:
- empty states
- loading states
- error states
- mobile responsiveness
- accessibility basics
- table pagination
- sorting/filtering/search
- seed/demo data
- clean navigation
- auditability
- completeness indicators
- status badges
- history/timeline views
- draft vs published/verified states
- import/export readiness
- future multi-tenant or multi-organization expansion

Claude should not wait to be told obvious product essentials.

---

## Design System Guidance

The design should be professional and modern:
- clean spacing
- restrained color usage
- strong typography hierarchy
- clear cards and data sections
- legible tables
- useful badges
- clean charts
- polished forms

Avoid:
- gimmicky visuals
- noisy dashboards
- cramped dense layouts
- inconsistent button patterns
- unclear status communication

The UI should feel credible for a startup product demo to serious stakeholders.

---

## Internationalization / Language Guidance

Because the original problem statement is in French, Claude should:
- keep the product architecture friendly to French localization
- use naming that can later support i18n
- avoid hard-to-extract UI strings where practical
- make the product easy to adapt to bilingual or French-first deployment

Default implementation language for code and docs can remain English unless otherwise requested.

---

## Anti-Patterns to Avoid

Claude must avoid:
- shallow CRUD without domain thinking
- weak schemas that cannot support history
- mixing unrelated business logic in UI components
- fragile hardcoded assumptions
- fake analytics with no clear data source
- giant unstructured forms with poor UX
- ignoring permissions
- ignoring provenance
- ignoring data quality
- ignoring incomplete-data workflows
- overengineering before core workflows work
- underengineering core entities that will become painful later

---

## Execution Mandate

Claude should proactively identify what is missing from the current implementation and close the gap between a basic sports data app and a startup-grade football intelligence platform.

Do not wait for perfect specifications.
Infer missing but necessary product, engineering, validation, analytics, UX, and governance requirements from the mission.
Prefer strong decisions with explicit assumptions over shallow hesitation.

---

## Done Criteria

A feature is not done merely because a page exists.

A feature is done when:
- it matches the product mission
- the domain model is sound
- validation is present
- permission logic is respected
- UI is usable
- edge cases are reasonably handled
- data persists correctly
- analytics or downstream use is possible where relevant
- code quality is maintainable
- docs/tests are updated as appropriate

---

## Definition of Success

This project is successful if it becomes a credible system for collecting and using football practitioner data at a level that meaningfully reduces the problem of:

> **Manque de données sur les pratiquants de sports**

That means the product should:
- capture more data
- capture better data
- expose gaps in missing data
- make the data searchable and usable
- help real stakeholders make better decisions
- support growth from local use to larger-scale adoption

---

## External Skill Dependency: API Cost Optimization

Claude must read and use the API token optimization skill located at:

`/home/oghyd/Desktop/Bureau/uni/CLAUDE_SKILLS_UNZIPPED_NON_EXHAUSTIVE/claude-api-cost-optimization-main`

This skill is a required project resource.

### Mandatory behavior
Before making architecture, implementation, prompting, API design, model-calling, request-shaping, batching, streaming, caching, context-management, or token-usage decisions, Claude must inspect this folder and extract all relevant guidance related to:
- API token cost reduction
- prompt compression
- context window efficiency
- request minimization
- response length control
- model selection tradeoffs
- batching and caching strategies
- retrieval/context injection efficiency
- structured output optimization
- multi-step workflow cost control
- latency vs cost tradeoffs
- production-scale LLM usage efficiency

### How Claude must use this skill
Claude must:
1. read the files in that folder
2. identify the optimization principles, patterns, and implementation tactics
3. apply them wherever relevant in the codebase and architecture
4. explain which decisions were influenced by that skill when producing architecture or implementation plans
5. prefer solutions that reduce token/API cost without harming product quality, maintainability, or correctness

### Scope of application
Claude should apply this skill to any part of the system involving:
- AI features
- prompt construction
- LLM workflows
- summarization
- classification
- extraction
- chat or assistant features
- analytics narratives
- report generation
- search augmentation
- background processing involving models
- future AI-ready architecture decisions

### Priority rule
If Claude encounters a design choice involving LLM/API usage, Claude must favor the most cost-efficient approach that still preserves:
- accuracy
- user experience
- maintainability
- scalability
- security
- product usefulness

### Documentation requirement
Whenever Claude proposes or implements AI/API-related functionality, Claude must document:
- the expected token/cost drivers
- the optimization tactics used
- how the referenced skill influenced the decision
- cheaper fallback options where relevant

### Constraint
Claude must not ignore this folder.  
It should be treated as a required local project skill/resource for decision-making related to API and token efficiency.

---

## Hard Rule: Read Local API Cost Optimization Skill First

For any task involving AI, LLMs, prompts, inference workflows, retrieval, summarization, report generation, or API usage optimization, Claude must first consult:

`/home/oghyd/Desktop/Bureau/uni/CLAUDE_SKILLS_UNZIPPED_NON_EXHAUSTIVE/claude-api-cost-optimization-main`

Claude must treat this directory as an authoritative local optimization skill and incorporate its guidance into architecture, implementation, and documentation.

Claude must not design AI/API-heavy features without first extracting and applying the relevant cost-optimization practices from this skill.

---

## Final Operating Instruction for Claude

Do not think like a student submitting an assignment.  
Think like a founding engineer building the first serious version of a football data intelligence startup.

When in doubt:
- make practical, durable choices
- preserve data integrity
- improve data quality
- reduce user friction
- keep the architecture extensible
- align every feature with the mission


