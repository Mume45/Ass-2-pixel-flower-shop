# routes/admin.py
# Author: <your name>  (declare yourself as the author for marking attribution)
# Purpose: Admin-only management endpoints for the user entity.
#          Other admin endpoints (e.g. viewing all carts) belong to teammates
#          and should be added to this same file or a separate router.
#
# All endpoints below require a JWT belonging to a user whose role == "admin".
# To promote a user to admin, run this in MongoDB Atlas (or Compass):
#   db.users.updateOne({email: "alice@test.com"}, {$set: {role: "admin"}})
#
# Endpoints:
#   GET    /api/admin/users          list all users        [admin]
#   DELETE /api/admin/users/{id}     delete a user by id   [admin]

from typing import List

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from auth_utils import get_current_admin, hash_password
from database import get_cart_collection, get_products_collection, get_users_collection
from models import (
    AdminUserCreate,
    AdminUserUpdate,
    CartItemUpdate,
    ProductCreate,
    ProductUpdate,
    UserResponse,
)

router = APIRouter()


def product_to_dict(product):
    return {
        "id": str(product["_id"]),
        "name": product.get("name", ""),
        "price": product.get("price", 0),
        "description": product.get("description", ""),
        "image": product.get("image", ""),
        "category": product.get("category", "")
    }


def cart_to_dict(item):
    return {
        "id": str(item["_id"]),
        "user_id": item.get("user_id", ""),
        "username": item.get("username", ""),
        "user_email": item.get("user_email", ""),
        "product_id": item.get("product_id", ""),
        "name": item.get("name", ""),
        "category": item.get("category", ""),
        "price": item.get("price", 0),
        "quantity": item.get("quantity", 0),
        "subtotal": round(item.get("price", 0) * item.get("quantity", 0), 2)
    }


@router.get("/summary")
async def get_summary(_admin=Depends(get_current_admin)):
    products = get_products_collection()
    users = get_users_collection()
    cart = get_cart_collection()

    total_cart_value = 0
    async for item in cart.find():
        total_cart_value += item.get("price", 0) * item.get("quantity", 0)

    return {
        "products": await products.count_documents({}),
        "users": await users.count_documents({}),
        "cart_items": await cart.count_documents({}),
        "cart_total": round(total_cart_value, 2)
    }


@router.get("/products")
async def admin_get_products(_admin=Depends(get_current_admin)):
    products = get_products_collection()
    result = []

    async for product in products.find():
        result.append(product_to_dict(product))

    return result


@router.post("/products")
async def admin_create_product(product: ProductCreate, _admin=Depends(get_current_admin)):
    products = get_products_collection()
    result = await products.insert_one(product.dict())
    return {"message": "Product created", "id": str(result.inserted_id)}


@router.put("/products/{product_id}")
async def admin_update_product(
    product_id: str,
    product: ProductUpdate,
    _admin=Depends(get_current_admin)
):
    products = get_products_collection()
    update_data = {k: v for k, v in product.dict().items() if v is not None}

    try:
        result = await products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product id")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product updated"}


@router.delete("/products/{product_id}")
async def admin_delete_product(product_id: str, _admin=Depends(get_current_admin)):
    products = get_products_collection()

    try:
        result = await products.delete_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product id")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted"}


@router.get("/users", response_model=List[UserResponse])
async def list_users(_admin=Depends(get_current_admin)):
    users = get_users_collection()
    out = []

    async for user in users.find():
        out.append(
            UserResponse(
                id=str(user["_id"]),
                username=user["username"],
                email=user["email"],
                role=user.get("role", "user"),
            )
        )

    return out


@router.post("/users")
async def admin_create_user(payload: AdminUserCreate, _admin=Depends(get_current_admin)):
    users = get_users_collection()

    existing = await users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = {
        "username": payload.username,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role,
    }

    result = await users.insert_one(new_user)
    return {"message": "User created", "id": str(result.inserted_id)}


@router.put("/users/{user_id}")
async def admin_update_user(
    user_id: str,
    payload: AdminUserUpdate,
    _admin=Depends(get_current_admin)
):
    users = get_users_collection()

    updates = {}

    if payload.username is not None:
        updates["username"] = payload.username
    if payload.email is not None:
        updates["email"] = payload.email
    if payload.role is not None:
        updates["role"] = payload.role
    if payload.password is not None:
        updates["password_hash"] = hash_password(payload.password)

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        result = await users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated"}


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin=Depends(get_current_admin)):
    users = get_users_collection()
    cart = get_cart_collection()

    try:
        target_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if target_id == admin["_id"]:
        raise HTTPException(
            status_code=400, detail="Admin cannot delete self here")

    result = await users.delete_one({"_id": target_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    await cart.delete_many({"user_id": user_id})
    return None


@router.get("/cart")
async def admin_get_all_cart(_admin=Depends(get_current_admin)):
    cart = get_cart_collection()
    result = []

    async for item in cart.find():
        result.append(cart_to_dict(item))

    return result


@router.put("/cart/{item_id}")
async def admin_update_cart_item(
    item_id: str,
    payload: CartItemUpdate,
    _admin=Depends(get_current_admin)
):
    cart = get_cart_collection()

    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item id")

    if payload.quantity < 1:
        await cart.delete_one({"_id": obj_id})
        return {"message": "Cart item removed"}

    result = await cart.update_one(
        {"_id": obj_id},
        {"$set": {"quantity": payload.quantity}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return {"message": "Cart item updated"}


@router.delete("/cart/{item_id}")
async def admin_delete_cart_item(item_id: str, _admin=Depends(get_current_admin)):
    cart = get_cart_collection()

    try:
        result = await cart.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item id")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return {"message": "Cart item deleted"}
