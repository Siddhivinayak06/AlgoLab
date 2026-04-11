# Algorithm Performance Analyzer Backend Blueprint

## Stack
- Node.js + Express.js
- MongoDB + Mongoose
- JWT authentication (access + refresh)
- PDFKit report generation
- Zod request validation

## Implemented Module Skeleton
- `src/modules/auth`: signup, login, refresh, logout, me
- `src/modules/experiments`: create/list/get/delete/summary
- `src/modules/analytics`: performance aggregation + benchmark placeholder
- `src/modules/reports`: generate/list/download/delete PDF reports
- `src/modules/admin`: list users + role update (admin only)

## Data Models

### User
- name: string
- email: string (unique)
- passwordHash: string
- role: `student | admin`
- refreshToken: string | null
- timestamps

### Experiment
- userId: ObjectId(User)
- algorithm: string
- mode: string
- arraySize: number
- executionTime: number
- comparisons: number
- operations: number
- dataType: string
- metadata: object | null
- timestamps

### Report
- userId: ObjectId(User)
- experimentId: ObjectId(Experiment)
- fileName: string
- mimeType: string
- size: number
- pdfData: Buffer
- timestamps

## API Contract (v1)

### Auth
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

### Experiments
- `POST /api/v1/experiments`
- `GET /api/v1/experiments`
- `GET /api/v1/experiments/summary`
- `GET /api/v1/experiments/:id`
- `DELETE /api/v1/experiments/:id`

### Analytics
- `GET /api/v1/analytics/performance`
- `POST /api/v1/analytics/benchmark` (stub: 501 for now)

### Reports
- `POST /api/v1/reports/experiments/:experimentId/pdf`
- `GET /api/v1/reports`
- `GET /api/v1/reports/:reportId/download`
- `DELETE /api/v1/reports/:reportId`

### Admin (RBAC)
- `GET /api/v1/admin/users`
- `PATCH /api/v1/admin/users/:id/role`

## DTO Validation
All module entry points use Zod schemas via `validate(...)` middleware for:
- request body
- route params
- query params

## Security Pattern
- Access token required on protected endpoints (`Authorization: Bearer <token>`)
- Refresh token rotation supported via `/auth/refresh`
- Role checks enforced using `requireRole("admin")`
- Centralized error middleware with consistent error payload

## Frontend Integration Notes
1. Replace frontend mock auth handlers with calls to `/api/v1/auth/*`.
2. On experiment completion, POST metrics to `/api/v1/experiments`.
3. Populate history page from `GET /api/v1/experiments`.
4. Build analysis charts from `GET /api/v1/analytics/performance`.
5. Generate downloadable PDF reports through reports endpoints.

## Next Implementation Steps
1. Add automated tests (unit + integration) for auth and experiments first.
2. Add token revocation strategy beyond single refresh token per user.
3. Add rate limiting and request logging correlation IDs.
4. Add OpenAPI spec generation for frontend contract typing.
5. Add server-side benchmark runner implementation for `/analytics/benchmark`.
