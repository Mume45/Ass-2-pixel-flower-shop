# 🌸 Vivian's Flowers — Pixel-Art Flower Shop with Backend Auth

## Project Summary
A Single-Page Application (SPA) built with the **FARM Stack**, simulating a cozy **in-game flower shop**. The frontend lets users browse pixelated floral assets, view item stats, and manage a shopping cart. The backend additionally exposes registration / login endpoints with bcrypt password hashing and JWT-based authentication.

> **Frontend UI is unchanged** from the original project. Auth is backend-only — test it via Swagger UI or curl.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Functional Components & Hooks) |
| Styling | CSS3 — Custom Pixel-Art theme |
| Backend | FastAPI (Python 3.x) |
| Database | MongoDB Atlas + Motor (Async driver) |
| Auth | bcrypt (password hashing) + JWT (python-jose) |
| Communication | RESTful API with CORS middleware |

---

## Features

- **Backend Auth Endpoints** — Register, login, and "who am I" endpoints with bcrypt + JWT
- **Full CRUD Cart** — Add, update quantity, remove, clear all
- **Dynamic Filtering** — Single, Bouquet, Basket, Gift Box categories
- **SPA Architecture** — Seamless transitions, no full reloads
- **Interactive Modals** — Product detail popups

---

## Folder Structure

```
pixel-flower-shop-with-auth/
├── backend/                       # FastAPI server
│   ├── routes/
│   │   ├── auth.py                # NEW: user CRUD (register/login/me/update/delete)
│   │   ├── admin.py               # NEW: admin-only user management
│   │   ├── cart.py
│   │   └── products.py
│   ├── .env                       # MongoDB URL + JWT secret (gitignored)
│   ├── .env.example               # Template for .env
│   ├── auth_utils.py              # NEW: bcrypt, JWT, get_current_user, get_current_admin
│   ├── database.py                # MODIFIED: + users collection (with unique email index)
│   ├── main.py                    # MODIFIED: + auth + admin routers
│   ├── models.py                  # MODIFIED: + User/Token schemas (with role)
│   ├── requirements.txt           # MODIFIED: + auth packages (passlib, jose, bcrypt<4.1)
│   └── seed.py                    # Initial product data
│
├── frontend/                      # React app (UNCHANGED from original)
│
└── database_export/
    └── products.json              # Reference dump of seed data
```

### Files written by the auth/user member

The following files implement the **Registration/login + user CRUD + RBAC** part of
the assignment and were written by the same group member:

- `backend/auth_utils.py`
- `backend/routes/auth.py`
- `backend/routes/admin.py`
- `backend/seed_users.py`
- `backend/models.py` — only the `User*` and `Token` classes
- `backend/database.py` — only the `users_collection` additions
- `backend/main.py` — only the `auth_router` and `admin_router` lines

---

## How to Run

> **Prerequisites:** Python 3.8+ and Node.js (LTS)

### Step 1 — Configure `.env`

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=<paste output of: openssl rand -hex 32>
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=60
```

> **MongoDB Atlas:** add your IP (or `0.0.0.0/0`) under Network Access, and make sure the database user has `readWrite` role.

### Step 2 — Seed product data

```bash
cd backend
pip3 install -r requirements.txt
python3 seed.py
```

You should see `Successfully inserted 31 flowers!`

#### Optional: seed three default test users

```bash
python3 seed_users.py
```

Creates two regular users and one admin so the auth/admin endpoints can be tested
without manual signup. Re-running is safe — existing users are skipped.

| Role  | Email             | Password      |
|-------|-------------------|---------------|
| user  | alice@test.com    | password123   |
| user  | bob@test.com      | password123   |
| admin | admin@test.com    | admin123      |

> These are **test-only credentials** — change them before production.

### Step 3 — Start the backend

```bash
cd backend
python3 -m uvicorn main:app --reload
```

API runs at `http://localhost:8000` — open `http://localhost:8000/docs` for Swagger UI to test auth endpoints.

### Step 4 — Start the frontend (optional, original UI)

```bash
cd frontend
npm install
npm start
```

App opens at `http://localhost:3000`. The frontend does not call the auth endpoints — it works exactly like the original.

---

## API Endpoints

### Auth — user CRUD (NEW, written by <your name>)
| Method | URL | Auth | Body / Result |
|---|---|---|---|
| POST | `/api/auth/register` | — | `{username, email, password}` → `{access_token}` |
| POST | `/api/auth/login` | — | `{email, password}` → `{access_token}` |
| GET | `/api/auth/me` | Bearer | → `{id, username, email, role}` |
| PUT | `/api/auth/me` | Bearer | `{username?, password?}` → updated user |
| DELETE | `/api/auth/me` | Bearer | delete own account → `204` |

### Admin — user management (NEW, admin role required)
| Method | URL | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Bearer (admin) | List every user (no password hashes) |
| DELETE | `/api/admin/users/{id}` | Bearer (admin) | Remove a user by id |

> **How to make a user an admin:** in MongoDB Atlas (or Compass), edit the user document and set `role: "admin"`. Equivalent shell command:
> ```js
> db.users.updateOne({email: "alice@test.com"}, {$set: {role: "admin"}})
> ```

### Existing
| Method | URL | Description |
|---|---|---|
| GET | `/api/products` | List all products |
| GET | `/api/products/category/{cat}` | Filter by category |
| POST | `/api/cart` | Add to cart |
| GET | `/api/cart` | Get cart with totals |
| PUT | `/api/cart/{id}` | Update quantity |
| DELETE | `/api/cart/{id}` | Remove single item |
| DELETE | `/api/cart` | Clear cart |

---

## Testing the Auth Endpoints (Swagger)

1. Start backend: `python3 -m uvicorn main:app --reload`
2. Open `http://localhost:8000/docs`
3. **Register** — `POST /api/auth/register` → Try it out → fill JSON → Execute → copy `access_token`
4. **Login** — `POST /api/auth/login` → use same email + password → get a fresh token
5. Click 🔓 `Authorize` (top-right) → paste the token → Close. Now bearer endpoints will use it.
6. **Read** — `GET /api/auth/me` → Execute → returns `{id, username, email, role}`
7. **Update** — `PUT /api/auth/me` → body `{"username":"alice2"}` → Execute → returns updated user
8. **Delete** — `DELETE /api/auth/me` → Execute → `204` (account is gone)
9. **RBAC** — call `GET /api/admin/users` with a normal user's token → expect `403`. Promote the user to admin in Atlas (set `role:"admin"`), grab a fresh token, and try again → expect `200` with the user list.
5. **/me** — Click 🔓 `Authorize` (top-right) → paste token → Close → `GET /api/auth/me` → Execute

---

## Security Notes

- Passwords are **never** stored in plain text — only as bcrypt hashes (`$2b$12$...`).
- `JWT_SECRET` must be long and random (use `openssl rand -hex 32`).
- `.env` is gitignored — never commit credentials.
- In production, serve the API over HTTPS so JWTs are encrypted in transit.

---

## Common Issues

| Issue | Fix |
|---|---|
| `SSL: CERTIFICATE_VERIFY_FAILED` on macOS | Run `sudo /Applications/Python\ 3.12/Install\ Certificates.command` |
| `module 'bcrypt' has no attribute '__about__'` | Already pinned in requirements.txt (`bcrypt<4.1`) |
| `IP not whitelisted` | Add `0.0.0.0/0` in MongoDB Atlas → Network Access |
| `Authentication failed` | Check Database User exists in Atlas → Database Access |
