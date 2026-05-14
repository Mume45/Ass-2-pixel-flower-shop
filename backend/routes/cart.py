# routes/cart.py
# Description: Handles Shopping Cart CRUD operations
# Technology: FastAPI, MongoDB

from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId

from auth_utils import get_current_user
from database import get_cart_collection, get_products_collection
from models import CartItemCreate, CartItemUpdate

router = APIRouter()


@router.post("")
async def add_to_cart(item: CartItemCreate, current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()
    products_collection = get_products_collection()

    if cart_collection is None or products_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        product = await products_collection.find_one({"_id": ObjectId(item.product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format")

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    user_id = str(current_user["_id"])

    existing = await cart_collection.find_one({
        "user_id": user_id,
        "product_id": item.product_id
    })

    if existing:
        new_qty = existing["quantity"] + item.quantity
        await cart_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"quantity": new_qty}}
        )
        return {"message": "Quantity updated", "quantity": new_qty}

    cart_item = {
        "user_id": user_id,
        "username": current_user.get("username", ""),
        "user_email": current_user.get("email", ""),
        "product_id": item.product_id,
        "name": product["name"],
        "price": product["price"],
        "image": product.get("image", ""),
        "quantity": item.quantity
    }

    result = await cart_collection.insert_one(cart_item)
    return {"message": "Added to cart", "id": str(result.inserted_id)}


@router.get("")
async def get_cart(current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    user_id = str(current_user["_id"])
    items = []

    async for item in cart_collection.find({"user_id": user_id}):
        items.append({
            "id": str(item["_id"]),
            "user_id": item.get("user_id", ""),
            "username": item.get("username", ""),
            "user_email": item.get("user_email", ""),
            "product_id": item.get("product_id", ""),
            "name": item.get("name", ""),
            "price": item.get("price", 0),
            "image": item.get("image", ""),
            "quantity": item.get("quantity", 0)
        })

    total = sum(item["price"] * item["quantity"] for item in items)
    return {"items": items, "total": round(total, 2)}


@router.put("/{item_id}")
async def update_cart_item(
    item_id: str,
    item: CartItemUpdate,
    current_user=Depends(get_current_user)
):
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item ID")

    user_id = str(current_user["_id"])

    if item.quantity < 1:
        await cart_collection.delete_one({"_id": obj_id, "user_id": user_id})
        return {"message": "Item removed"}

    result = await cart_collection.update_one(
        {"_id": obj_id, "user_id": user_id},
        {"$set": {"quantity": item.quantity}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return {"message": "Quantity updated", "quantity": item.quantity}


@router.delete("/{item_id}")
async def remove_from_cart(item_id: str, current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID format")

    user_id = str(current_user["_id"])

    result = await cart_collection.delete_one({
        "_id": obj_id,
        "user_id": user_id
    })

    if result.deleted_count == 1:
        return {"message": "Item removed from cart"}

    raise HTTPException(status_code=404, detail="Item not found")


@router.delete("")
async def clear_cart(current_user=Depends(get_current_user)):
    cart_collection = get_cart_collection()

    if cart_collection is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    user_id = str(current_user["_id"])

    result = await cart_collection.delete_many({"user_id": user_id})
    return {"message": f"Removed {result.deleted_count} items from cart"}