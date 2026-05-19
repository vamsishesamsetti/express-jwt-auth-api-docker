# express-jwt-auth-api-docker

Production-shaped JWT authentication API. Express + Prisma + PostgreSQL, fully Dockerized, with rate limiting, refresh-token rotation, and CI on every push.

## Features

- Signup / login / refresh / logout / me endpoints
- Password hashing with bcrypt (cost 12)
- Access tokens (15m) + rotating refresh tokens (7d) stored in DB
- Zod request validation
- Helmet security headers, CORS, rate limiting on `/api/auth/*`
- Prisma migrations against PostgreSQL
- Multi-stage Dockerfile + Compose for one-command local stack
- GitHub Actions CI: install → migrate → test → build image

## Quick start

```bash
cp .env.example .env
docker compose up --build
# API on http://localhost:4000
```

Manual (without Docker):

```bash
npm install
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16
npx prisma migrate dev --name init
npm run dev
```

## API

| Method | Path                | Auth | Description                          |
|--------|---------------------|------|--------------------------------------|
| POST   | `/api/auth/signup`  | -    | Create user, returns access+refresh  |
| POST   | `/api/auth/login`   | -    | Returns access+refresh               |
| POST   | `/api/auth/refresh` | -    | Rotate tokens (old refresh revoked)  |
| POST   | `/api/auth/logout`  | yes  | Revoke a refresh token               |
| GET    | `/api/auth/me`      | yes  | Current user profile                 |
| GET    | `/health`           | -    | Liveness probe                       |

Use `Authorization: Bearer <accessToken>` for protected routes.

## Roadmap / TODO

Tick these off as separate commits to build a clean history.

- [ ] Add Supertest integration tests for signup happy/sad paths
- [ ] Add Supertest tests for login (wrong pw, missing user)
- [ ] Add Supertest tests for refresh rotation + reuse detection
- [ ] Add email verification flow (token sent via Nodemailer console transport)
- [ ] Add password reset endpoint with hashed reset tokens
- [ ] Add `/api/users/:id` admin endpoint guarded by `requireRole('ADMIN')`
- [ ] Add request-id middleware + pino structured logger
- [ ] Add OpenAPI spec (`docs/openapi.yaml`) and serve Swagger UI at `/docs`
- [ ] Add Postman collection in `docs/postman.json`
- [ ] Push image to GHCR from the workflow on `main`
- [ ] Add a `terraform/` folder that deploys this to AWS ECS Fargate (links to Project 4)
- [ ] Wire CodeQL + Trivy image scan jobs into CI
- [ ] Add k6 load test script that hits `/api/auth/login` at 100 RPS
- [ ] Write a `SECURITY.md` describing the threat model

## Architecture

```
client ── HTTPS ──> Express (helmet, cors, rate limit)
                     │
                     ├── zod validates body
                     ├── bcrypt hashes / compares passwords
                     ├── jsonwebtoken signs access (15m) + refresh (7d)
                     │
                     └──> Prisma ──> PostgreSQL
                                       │
                                       └── RefreshToken table (rotation + revoke)
```

## License

MIT


---

## Author

**Vamsi Shesamsetti** — Full-Stack Developer · Cloud Engineer · M.S. CS @ FAU (May 2026)

🌐 [vamsishesamsetti.dev](https://vamsishesamsetti.dev) · 💼 [LinkedIn](https://linkedin.com/in/vamsishesamsetti) · 🐙 [GitHub](https://github.com/vamsishesamsetti) · ✉️ shesamsettivamsi11@gmail.com
