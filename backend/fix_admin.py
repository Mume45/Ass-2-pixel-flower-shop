import asyncio
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from auth_utils import hash_password

load_dotenv()


async def fix_admin():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client.pixel_flower_shop

    await db.users.delete_many({"username": "admin"})

    await db.users.insert_one({
        "username": "admin",
        "email": "admin@test.com",
        "password_hash": hash_password("admin"),
        "role": "admin"
    })

    client.close()
    print("admin fixed: username=admin, password=admin")


if __name__ == "__main__":
    asyncio.run(fix_admin())