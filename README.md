# Ecommerce API

Express + MongoDB REST API powering the Ecommerce ecosystem.

## Stack

- Node.js + Express 5
- MongoDB via Mongoose
- Zod for request/response validation
- JWT (httpOnly cookies) for auth
- Multer for image uploads
- Vitest for testing

## Domains

| Domain | Description |
|---|---|
| `user-auth` | User registration, login, logout, profile, billing address |
| `admin-auth` | Admin login/logout |
| `catalog` | Products CRUD, image upload, discounts, best-sellers |
| `categories` | Category management, category-level discounts |
| `orders` | Place orders, status transitions, order history |
| `dashboard` | Revenue, profit and order stats by period |
| `suggestions` | User-submitted suggestions (read/delete by admin) |

## Getting started

```bash
cp .env.example .env
# fill in MONGO_URI, JWT_USER_SECRET, JWT_ADMIN_SECRET
pnpm install
node server.js
```

Server runs on `http://localhost:4000`.

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_USER_SECRET` | Secret for user JWT tokens |
| `JWT_ADMIN_SECRET` | Secret for admin JWT tokens |
| `PORT` | Port to listen on (default 4000) |

## API conventions

All responses use the standard envelope:

```json
{ "success": true, "data": { } }
{ "success": false, "code": 404, "message": "Not found" }
```

Authentication is cookie-based — no Authorization header needed.

## Running tests

```bash
pnpm test
```

Tests use an in-memory MongoDB instance (no external database required).
