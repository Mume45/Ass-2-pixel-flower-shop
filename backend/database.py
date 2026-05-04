# database.py
# Purpose: MongoDB Atlas connection setup and collection accessors
# Tech: Motor (Async MongoDB Driver), Python-dotenv

import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ---- Global Variables ----
# These variables will be assigned after connect_db() is executed
client = None
db = None
products_collection = None
cart_collection = None
users_collection = None


async def connect_db():
    """Initializes the MongoDB connection"""
    global client, db, products_collection, cart_collection, users_collection

    # Get connection string from .env
    mongodb_url = os.getenv("MONGODB_URL")

    # Create the Async MongoDB client
    client = AsyncIOMotorClient(mongodb_url)

    # Select the database instance
    db = client.pixel_flower_shop

    # Assign collections to global variables
    products_collection = db.products
    cart_collection = db.cart_items
    users_collection = db.users

    # Ensure email is unique at the database level
    await users_collection.create_index("email", unique=True)

    print("Connected to MongoDB!")


async def close_db():
    """Closes the database connection"""
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")


def get_products_collection():
    """Returns the products collection dynamically to ensure it is not None"""
    if db is None:
        return None
    return db.products


def get_cart_collection():
    """Returns the cart collection dynamically"""
    if db is None:
        return None
    return db.cart_items


def get_users_collection():
    """Returns the users collection dynamically"""
    if db is None:
        return None
    return db.users
