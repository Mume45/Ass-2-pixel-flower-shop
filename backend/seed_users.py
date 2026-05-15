# seed_users.py
# Author: <your name>  (declare yourself as the author for marking attribution)
# Purpose: Seed three default test users into the database so the
#          auth/admin endpoints can be exercised without manual setup.
#
# Run from the backend directory:
#     python3 seed_users.py
#
# Idempotent: existing users (matched by email) are skipped, not overwritten.

import asyncio
import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from auth_utils import hash_password

load_dotenv()

# ---- Default Test Accounts ----
# Two regular users + one admin so RBAC can be demonstrated end-to-end.
DEFAULT_USERS = [
    {
        "username": "alice",
        "email": "alice@test.com",
        "password": "password123",
        "role": "user",
    },
    {
        "username": "bob",
        "email": "bob@test.com",
        "password": "password123",
        "role": "user",
    },
{
    "username": "admin",
    "email": "admin@test.com",
    "password": "admin",
    "role": "admin",
},
]


async def seed_users():
    """Insert default test users, skipping any whose email already exists."""
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client.pixel_flower_shop

    # Make sure email uniqueness is enforced even if connect_db() never ran
    await db.users.create_index("email", unique=True)

    inserted, skipped = 0, 0
    for u in DEFAULT_USERS:
        if await db.users.find_one({"email": u["email"]}):
            skipped += 1
            print(f"  - skipped (already exists): {u['email']}")
            continue
        await db.users.insert_one({
            "username": u["username"],
            "email": u["email"],
            "password_hash": hash_password(u["password"]),
            "role": u["role"],
        })
        inserted += 1
        print(f"  + inserted: {u['email']} (role={u['role']})")

    print()
    print(f"Done. Inserted {inserted}, skipped {skipped}.")
    print()
    print("Default credentials (for testing only):")
    for u in DEFAULT_USERS:
        print(f"  {u['role']:5}  {u['email']:20}  {u['password']}")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_users())
