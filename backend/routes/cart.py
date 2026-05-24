# routes/cart.py
# Author: Yuhan Sun, Shiying Gu
# Purpose: Handle shopping cart CRUD operations for authenticated users.
#
# Each user has an independent shopping cart.
# All endpoints below require a valid JWT token.
#
# Endpoints:
#   POST   /api/cart              add a product to the current user's cart
#   GET    /api/cart              get the current user's cart
#   PUT    /api/cart/{item_id}     update quantity of a cart item
#   DELETE /api/cart/{item_id}     remove one cart item
#   DELETE /api/cart              clear the current user's cart

from fastapi import APIRouter, Depends, HTTPException
from database import get_cart_collection, get_products_collection
from models import CartItemCreate, CartItemUpdate
from auth_utils import get_current_user
from bson import ObjectId


# Create router for cart APIs
router = APIRouter()


# Add a product to the current user's cart
@router.post("")
async def add_to_cart(item: CartItemCreate, current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()

    # Check database connection
    if cart_collection is None or products_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Extract current user ID from JWT token
    user_id = str(current_user["_id"])

    # Check whether the product exists in the product collection
    try:
        product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    except Exception:
        raise HTTPException(
            status_code=400, detail="Invalid product ID format")

    if not product:
        return {"error": "Product not found"}

    # Check whether this product already exists in the current user's cart
    existing = await cart_collection.find_one({
        "user_id": user_id,
        "product_id": item.product_id
    })

    if existing:
        # If the product already exists, increase the quantity
        new_qty = existing["quantity"] + item.quantity
        await cart_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_qty}}
        )
        return {"message": "Quantity updated", "quantity": new_qty}
    else:
        # If the product does not exist in the cart, create a new cart item
        cart_item = {
            "user_id": user_id,
            "product_id": item.product_id,
            "name": product["name"],
            "price": product["price"],
            "image": product.get("image", ""),
            "quantity": item.quantity
        }

        # Insert the new cart item into the database
        result = await cart_collection.insert_one(cart_item)

        return {"message": "Added to cart", "id": str(result.inserted_id)}


# Get the current user's cart
@router.get("")
async def get_cart(current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    # Check database connection
    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Extract current user ID from JWT token
    user_id = str(current_user["_id"])

    items = []

    # Retrieve only the cart items that belong to the current user
    async for item in cart_collection.find({"user_id": user_id}):
        items.append({
            "id": str(item["_id"]),
            "product_id": item["product_id"],
            "name": item["name"],
            "price": item["price"],
            "image": item.get("image", ""),
            "quantity": item["quantity"]
        })

    # Calculate the total price of the current user's cart
    total = sum(item["price"] * item["quantity"] for item in items)

    return {"items": items, "total": round(total, 2)}


# Update the quantity of a cart item
@router.put("/{item_id}")
async def update_cart_item(item_id: str, item: CartItemUpdate, current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    # Check database connection
    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Extract current user ID from JWT token
    user_id = str(current_user["_id"])

    # Convert string ID to MongoDB ObjectId
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item ID")

    # Remove the item automatically if the quantity is less than 1
    if item.quantity < 1:
        await cart_collection.delete_one({"_id": obj_id, "user_id": user_id})
        return {"message": "Item removed (quantity < 1)"}

    # Update quantity and ensure users can only update their own cart items
    await cart_collection.update_one(
        {"_id": obj_id, "user_id": user_id},
        {"$set": {"quantity": item.quantity}}
    )

    return {"message": "Quantity updated", "quantity": item.quantity}


# Remove one item from the current user's cart
@router.delete("/{item_id}")
async def remove_from_cart(item_id: str, current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    # Check database connection
    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Extract current user ID from JWT token
    user_id = str(current_user["_id"])

    try:
        # Match both item ID and user ID to prevent deleting another user's cart item
        result = await cart_collection.delete_one({
            "_id": ObjectId(item_id),
            "user_id": user_id
        })
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    # Check whether the cart item was successfully deleted
    if result.deleted_count == 1:
        return {"message": "Item removed from cart"}

    return {"error": "Item not found"}


# Clear all items from the current user's cart
@router.delete("")
async def clear_cart(current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    # Check database connection
    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Extract current user ID from JWT token
    user_id = str(current_user["_id"])

    # Delete all cart items that belong to the current user
    result = await cart_collection.delete_many({"user_id": user_id})

    return {"message": f"Removed {result.deleted_count} items from cart"}
