# routes/cart.py
# Description: Handles Shopping Cart CRUD operations
# Technology: FastAPI, MongoDB

from fastapi import APIRouter, HTTPException
from database import get_cart_collection, get_products_collection
from models import CartItemCreate, CartItemUpdate
from bson import ObjectId

# Initialize the API Router
router = APIRouter()

# ---- CREATE: Add product to shopping cart ----


@router.post("")
async def add_to_cart(item: CartItemCreate):
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()

    # Database connection validation
    if cart_collection is None or products_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        # Check if the product exists in the product catalog
        product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid product ID format")

    if not product:
        return {"error": "Product not found"}

    # Check if the item is already in the cart
    existing = await cart_collection.find_one({"product_id": item.product_id})

    if existing:
        # If exists, update the quantity
        new_qty = existing["quantity"] + item.quantity
        await cart_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_qty}}
        )
        return {"message": "Quantity updated", "quantity": new_qty}
    else:
        # If not, create a new cart entry
        cart_item = {
            "product_id": item.product_id,
            "name": product["name"],
            "price": product["price"],
            "image": product.get("image", ""),
            "quantity": item.quantity
        }
        result = await cart_collection.insert_one(cart_item)
        return {"message": "Added to cart", "id": str(result.inserted_id)}


# ---- READ: Retrieve all cart items ----
@router.get("")
async def get_cart():
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    items = []
    # Fetch all items from the cart collection
    async for item in cart_collection.find():
        items.append({
            "id": str(item["_id"]),
            "product_id": item["product_id"],
            "name": item["name"],
            "price": item["price"],
            "image": item.get("image", ""),
            "quantity": item["quantity"]
        })

    # Calculate total price
    total = sum(item["price"] * item["quantity"] for item in items)
    return {"items": items, "total": round(total, 2)}


# ---- UPDATE: Modify cart item quantity ----
@router.put("/{item_id}")
async def update_cart_item(item_id: str, item: CartItemUpdate):
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item ID")

    # If quantity is less than 1, remove the item
    if item.quantity < 1:
        await cart_collection.delete_one({"_id": obj_id})
        return {"message": "Item removed (quantity < 1)"}

    # Perform update operation
    await cart_collection.update_one(
        {"_id": obj_id},
        {"$set": {"quantity": item.quantity}}
    )
    return {"message": "Quantity updated", "quantity": item.quantity}


# ---- DELETE: Remove a specific item from cart ----
@router.delete("/{item_id}")
async def remove_from_cart(item_id: str):
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        result = await cart_collection.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    if result.deleted_count == 1:
        return {"message": "Item removed from cart"}
    return {"error": "Item not found"}


# ---- DELETE: Clear the entire cart ----
@router.delete("")
async def clear_cart():
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Remove all documents from the collection
    result = await cart_collection.delete_many({})
    return {"message": f"Removed {result.deleted_count} items from cart"}
