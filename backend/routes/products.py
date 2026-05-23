# routes/products.py
# Author: Shiying Gu, Yuhan Sun
# Purpose: Handles product catalog API requests
# Tech: FastAPI, MongoDB

from fastapi import APIRouter, HTTPException
from database import get_products_collection
from bson import ObjectId

# Initialize the API Router
router = APIRouter()

# ---- READ: Get all products ----


@router.get("")
async def get_products():
    # Dynamically retrieve the collection instance
    products_collection = get_products_collection()
    if products_collection is None:
        raise HTTPException(
            status_code=500, detail="Database connection not ready")

    products = []
    async for product in products_collection.find():
        products.append(
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "description": product.get("description", ""),
                "image": product.get("image", ""),
                "category": product.get("category", "")
            }
        )
    return products


# ---- READ: Get products by category ----
@router.get("/category/{category}")
async def get_products_by_category(category: str):
    products_collection = get_products_collection()
    if products_collection is None:
        raise HTTPException(
            status_code=500, detail="Database connection not ready")

    products = []
    async for product in products_collection.find({"category": category}):
        products.append(
            {
                "id": str(product["_id"]),
                "name": product["name"],
                "price": product["price"],
                "description": product.get("description", ""),
                "image": product.get("image", ""),
                "category": product.get("category", "")
            }
        )
    return products


# ---- READ: Get single product details ----
@router.get("/{product_id}")
async def get_product(product_id: str):
    products_collection = get_products_collection()
    if products_collection is None:
        raise HTTPException(
            status_code=500, detail="Database connection not ready")

    try:
        product = await products_collection.find_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid product ID format")

    if product:
        return {
            "id": str(product["_id"]),
            "name": product["name"],
            "price": product["price"],
            "description": product.get("description", ""),
            "image": product.get("image", ""),
            "category": product.get("category", "")
        }

    raise HTTPException(status_code=404, detail="Product not found")
