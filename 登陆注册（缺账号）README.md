# Authentication — Registration & Login

REST API endpoints that let a user **register** an account and **log in**.
Passwords are stored as bcrypt hashes, and a successful register or login
returns a **JWT bearer token** used to authenticate later requests.

> **Scope:** this document covers **registration and login only**. Other
> features (cart, products, admin tools, and the rest of the user CRUD) are
> documented in the project root `README.md`.

---

## Tech Choices

| Concern | Choice |
|---|---|
| Framework | FastAPI |
| Database | MongoDB Atlas (Motor async driver) |
| Password hashing | bcrypt via passlib (cost 12) |
| Session token | JWT (python-jose, HS256) |
| Input validation | Pydantic (`EmailStr`, `min_length`) |

---

## Key Rule: Email-Only Login

- **Email is the unique login identifier.** Login matches strictly on the
  `email` field.
- `username` is collected at registration and stored as a **display name
  only** — it is never accepted as a login credential.
- Email uniqueness is enforced twice: a Pydantic/route check, plus a MongoDB
  unique index on the `email` field.

---

## Endpoints

### `POST /api/auth/register`

Create a new account.

Request body:

```json
{ "username": "alice", "email": "alice@test.com", "password": "password123" }
```

- `username` — 2–30 characters
- `email` — valid email address, must be unique
- `password` — 6–128 characters (only the bcrypt hash is stored, never the raw value)

Responses:

| Status | Meaning |
|---|---|
| `201` | Created → `{ "access_token": "...", "token_type": "bearer" }` |
| `400` | Email already registered |
| `422` | Validation failed (invalid email format, password too short, etc.) |

### `POST /api/auth/login`

Authenticate with email + password.

Request body:

```json
{ "email": "alice@test.com", "password": "password123" }
```

Responses:

| Status | Meaning |
|---|---|
| `200` | `{ "access_token": "...", "token_type": "bearer" }` |
| `401` | Invalid email or password (one generic message — no user enumeration) |
| `422` | Validation failed (e.g. the `email` field is not a valid email address) |

Send the returned token on protected routes via the header:

```
Authorization: Bearer <access_token>
```

---

## Files Involved

| File | Role in register / login |
|---|---|
| `backend/routes/auth.py` | `/register` and `/login` route handlers |
| `backend/auth_utils.py` | bcrypt hashing + JWT creation |
| `backend/models.py` | `UserRegister`, `UserLogin`, `Token` schemas |
| `backend/database.py` | users collection + unique email index |

---

## Configuration (`.env`)

```
MONGODB_URL=<your MongoDB Atlas connection string>
JWT_SECRET=<output of: openssl rand -hex 32>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

---

## Run & Test

```bash
cd backend
pip3 install -r requirements.txt
python3 seed_users.py            # optional: seed default test users
python3 -m uvicorn main:app --reload
```

Open Swagger UI at `http://localhost:8000/docs`.

Default test users (created by `seed_users.py`):

| Role | Email | Password |
|---|---|---|
| user | `待补充` | `待补充` |
| admin | `待补充` | `待补充` |

> Test-only credentials. Change them before any production deployment.

Quick check:

1. `POST /api/auth/register` with a new email → `201` + token.
2. `POST /api/auth/login` with the same email + password → `200` + token.
3. Login with a wrong password → `401`.
4. Login with a username instead of an email → `422` (the `email` field
   requires a valid email address; usernames are not accepted).

---

## Security Notes

- Passwords are **never** stored in plain text — only as bcrypt hashes (`$2b$12$...`).
- `JWT_SECRET` must be long and random (use `openssl rand -hex 32`); never commit `.env`.
- Tokens expire after `JWT_EXPIRE_MINUTES` minutes (default 60).
- Serve the API over HTTPS in production so tokens are encrypted in transit.
