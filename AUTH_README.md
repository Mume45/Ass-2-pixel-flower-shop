# Authentication Module — Registration / Login

> **Author:** `<your name>`
> **Branch:** `Registration/login`
> **Scope:** This document describes ONLY the authentication feature
> (registration, login, JWT, role-based access control, user CRUD).
> Other features (products, cart, live search, admin cart view) are
> documented in the project root README and were written by other group members.

> **作者：** `<你的名字>`
> **分支：** `Registration/login`
> **范围：** 本文件仅说明**注册/登入**这个 feature（注册、登入、JWT、角色权限、用户 CRUD）。
> 其他功能（产品、购物车、即时搜寻、admin 查看购物车）由其他组员负责，写在专案根目录的 README。

---

## 1. Overview / 功能概述

### English
A REST API module that lets users sign up, log in, view and manage their own
account, and (when promoted to `admin`) manage other users. Passwords are stored
as **bcrypt hashes**, sessions are issued as **JWT bearer tokens**, and
admin-only routes are protected by a **role-based access control (RBAC)**
dependency.

### 中文
一组让用户注册、登入、管理自己帐号的 REST API；当用户被升级为 `admin` 时还可以
管理其他用户。密码以 **bcrypt 哈希**储存，会话以 **JWT bearer token** 发放，
admin 专属端点透过 **role-based access control (RBAC)** 依赖保护。

---

## 2. Files I Wrote / 我写的档案

| File / 档案 | Purpose / 作用 |
|---|---|
| `backend/auth_utils.py` | Password hashing, JWT helpers, `get_current_user`, `get_current_admin` / 密码哈希、JWT、当前用户与 admin 依赖 |
| `backend/routes/auth.py` | `/api/auth` endpoints: register, login, me (CRUD on self) / `/api/auth` 端点：注册、登入、自我读写删 |
| `backend/routes/admin.py` | `/api/admin` user management (admin only) / admin 专用的用户管理端点 |
| `backend/seed_users.py` | Seed three default test users (alice, bob, admin) / 种入三个默认测试用户 |
| `backend/.env.example` | Template showing required env variables / 必要环境变数的范本 |

Modifications to shared files (only the User-related parts are mine):
共用档案的修改（**只有 User 相关的部分**是我的）：

- `backend/database.py` — added `users_collection` and unique email index / 加入 users collection 与 email 唯一索引
- `backend/models.py` — added `UserRegister`, `UserLogin`, `UserUpdate`, `UserResponse`, `Token` / 加入 User 与 Token 的 Pydantic schemas
- `backend/main.py` — registered `auth_router` and `admin_router` / 注册 auth 与 admin router
- `backend/requirements.txt` — added `passlib[bcrypt]`, `bcrypt<4.1`, `python-jose[cryptography]`, `email-validator`

---

## 3. Tech Choices / 技术选择

| Concern / 项目 | Choice / 选择 | Reason / 理由 |
|---|---|---|
| Password hashing / 密码哈希 | `bcrypt` (cost 12) | Industry standard, salt built-in, intentional slowness defeats brute force / 业界标准，内建 salt，刻意慢速以防暴力破解 |
| Session / 会话 | JWT (`python-jose`, HS256) | Stateless, no server-side session store needed / 无状态，不需要 server-side session 储存 |
| Token transport / Token 传输 | `Authorization: Bearer <token>` header | Standard, easy to test in Swagger / 标准做法，Swagger 容易测试 |
| RBAC / 角色权限 | `role` string field on user document | Simple, easy to extend (e.g. `"editor"`) / 简单且可扩充 |
| Email uniqueness / Email 唯一性 | MongoDB unique index | Enforced at DB level, defends against race conditions / DB 层强制，能挡住 race condition |
| Input validation / 输入验证 | Pydantic + `EmailStr` + `Field(min_length=...)` | Declarative, returns clear 422 errors / 宣告式，自动回 422 |

---

## 4. Endpoints / API 端点

### Public endpoints / 公开端点

| Method | URL | Body | Returns |
|---|---|---|---|
| POST | `/api/auth/register` | `{username, email, password}` | `201 {access_token, token_type}` |
| POST | `/api/auth/login` | `{email, password}` | `200 {access_token, token_type}` |

### Authenticated user endpoints / 需要登入的端点

> Requires header: `Authorization: Bearer <token>` / 必须带这个 header

| Method | URL | Body | Returns |
|---|---|---|---|
| GET | `/api/auth/me` | — | `200 {id, username, email, role}` |
| PUT | `/api/auth/me` | `{username?, password?}` | `200` updated user |
| DELETE | `/api/auth/me` | — | `204 No Content` |

### Admin-only endpoints / 仅 admin 可用

> Requires JWT belonging to a user whose `role == "admin"`. Otherwise returns `403`.
> 必须用 `role == "admin"` 用户的 JWT，否则回 `403`。

| Method | URL | Body | Returns |
|---|---|---|---|
| GET | `/api/admin/users` | — | `200` list of all users |
| DELETE | `/api/admin/users/{user_id}` | — | `204 No Content` |

### Error responses / 错误回应

| Status | Meaning / 意义 |
|---|---|
| `400` | Validation problem (e.g. duplicate email) / 验证错误，如重复 email |
| `401` | Invalid or missing token / Token 无效或没带 |
| `403` | Authenticated but not authorized (admin required) / 有登入但权限不足 |
| `404` | Target user not found (admin delete) / 目标用户不存在 |
| `422` | Pydantic schema validation failed / Pydantic 输入格式错误 |

---

## 5. Default Test Users / 默认测试用户

After running `python3 seed_users.py` you have:
执行 `python3 seed_users.py` 后会得到：

| Role / 角色 | Email | Password |
|---|---|---|
| user | `alice@test.com` | `password123` |
| user | `bob@test.com` | `password123` |
| admin | `admin@test.com` | `admin123` |

> Test-only credentials. Change before any production deployment.
> 仅供测试，正式部署前必须更换。

---

## 6. How to Run / 执行方式

### Prerequisites / 前置需求

- Python 3.8+
- MongoDB Atlas (or local MongoDB) — connection string in `.env`
- Run from `backend/` directory / 从 `backend/` 目录执行

### Steps / 步骤

```bash
cd backend

# 1. Install dependencies / 安装依赖
pip3 install -r requirements.txt

# 2. Create .env from template, fill in values / 从范本建立 .env 并填值
cp .env.example .env
# Edit .env: MONGODB_URL and JWT_SECRET (use: openssl rand -hex 32)
# 编辑 .env：填入 MONGODB_URL 与 JWT_SECRET（用 openssl rand -hex 32 生成）

# 3. Seed default test users / 种入默认测试用户
python3 seed_users.py

# 4. Start the API server / 启动 API server
python3 -m uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Swagger UI: `http://localhost:8000/docs`.
API 跑在 `http://localhost:8000`，Swagger UI 在 `/docs`。

### macOS SSL note / macOS SSL 提醒

If you see `SSL: CERTIFICATE_VERIFY_FAILED` when connecting to MongoDB Atlas,
run once:
若连 MongoDB Atlas 时出现 SSL 凭证错误，**只需要做一次**：

```bash
sudo /Applications/Python\ 3.12/Install\ Certificates.command
```

---

## 7. Testing the Endpoints (Swagger) / 用 Swagger 测试

1. Start the server (step 4 above).
   启动 server。
2. Open `http://localhost:8000/docs`.
   打开 `http://localhost:8000/docs`。
3. **Login** as alice → copy the `access_token`.
   用 alice 登入，复制 `access_token`。
4. Click 🔓 **Authorize** (top right) → paste the token → Close.
   点右上角 🔓 **Authorize**，贴上 token，Close。
5. **GET `/api/auth/me`** → returns alice's info.
   测 `GET /api/auth/me`，应回传 alice 的资料。
6. **GET `/api/admin/users`** with alice's token → expect `403`.
   用 alice 的 token 测 `GET /api/admin/users`，应回 `403`。
7. Logout / re-Authorize with admin's token → `GET /api/admin/users` returns `200` + list.
   换成 admin token，再测同一支端点，应回 `200` 加用户清单。

---

## 8. Security Notes / 安全说明

- Passwords are **never** stored in plain text — only as bcrypt hashes (`$2b$12$...`).
  密码**绝不**以明文储存，只存 bcrypt 哈希（`$2b$12$...`）。
- `JWT_SECRET` must be long and random. Generate with `openssl rand -hex 32`.
  `JWT_SECRET` 必须长且随机，用 `openssl rand -hex 32` 生成。
- `.env` is `.gitignore`d — credentials never enter the repo.
  `.env` 已被 `.gitignore`，凭证不会进入 repo。
- Tokens expire after `JWT_EXPIRE_MINUTES` minutes (default 60).
  Token 过期时间为 `JWT_EXPIRE_MINUTES` 分钟（预设 60）。
- In production: serve over HTTPS so JWTs are encrypted in transit.
  正式部署时必须走 HTTPS，让 JWT 在传输中加密。
- Promoting a user to admin is a manual DB action (Atlas / Compass /
  shell), not exposed as a public API — prevents privilege escalation
  via a leaked token.
  把用户升级为 admin 是 DB 层手动操作（Atlas / Compass / shell），
  不开放为公开 API，防止 token 外洩造成权限升级。

To promote a user to admin / 升级用户为 admin：

```js
// In MongoDB shell or Compass / 在 MongoDB shell 或 Compass 里执行
db.users.updateOne({email: "alice@test.com"}, {$set: {role: "admin"}})
```

---

## 9. Assignment Mapping / 对应作业评分项

| Marking criterion / 评分项目 | How this module satisfies it / 本模组如何满足 |
|---|---|
| Password hashing & JWT | bcrypt + python-jose; verified by inspecting the `password_hash` field starting with `$2b$12$` |
| Role-based access control | `get_current_admin` dependency rejects non-admin tokens with `403` |
| All CRUD on user entity | `register` (C), `me` (R), `PUT /me` (U), `DELETE /me` (D), plus admin list and delete |
| No hardcoded credentials | All secrets read from `.env`; `.env` is git-ignored |
| Meaningful commits | Feature split into 10 commits with descriptive messages on `Registration/login` branch |
| Code structure & readability | Modular split: `auth_utils.py` (helpers) / `routes/auth.py` (own account) / `routes/admin.py` (admin) |
| Input validation / error handling | Pydantic schemas with `min_length`, `EmailStr`; explicit `400`/`401`/`403`/`404` responses |

| 评分项目 | 本模组的满足方式 |
|---|---|
| 密码哈希 + JWT | 用 bcrypt 加 python-jose；可从 DB 看 `password_hash` 是 `$2b$12$` 开头确认 |
| Role-based access control | `get_current_admin` 依赖会用 `403` 挡掉非 admin |
| User entity 完整 CRUD | `register`(C) / `me`(R) / `PUT /me`(U) / `DELETE /me`(D)，admin 还能列与删别人 |
| 无 hardcoded 凭证 | 全部 secret 从 `.env` 读；`.env` 已被 git-ignore |
| 有意义的 commit | feature 切成 10 个 commit，每个有具体描述，放在 `Registration/login` 分支 |
| 代码结构与可读性 | 模组化拆分：`auth_utils.py`（工具）/ `routes/auth.py`（自己）/ `routes/admin.py`（admin） |
| 输入验证与错误处理 | Pydantic + `min_length`、`EmailStr`；明确回 `400`/`401`/`403`/`404` |
