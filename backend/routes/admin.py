# routes/admin.py
# Author: Shiying Gu
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

# Create router for admin APIs
router = APIRouter()


# Convert product object to dictionary format
def product_to_dict(product):
    return {
        "id": str(product["_id"]),
        "name": product.get("name", ""),
        "price": product.get("price", 0),
        "description": product.get("description", ""),
        "image": product.get("image", ""),
        "category": product.get("category", "")
    }


# Convert cart item object to dictionary format
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
        # Calculate subtotal price
        "subtotal": round(item.get("price", 0) * item.get("quantity", 0), 2)
    }


# Get admin dashboard summary data
@router.get("/summary")
async def get_summary(_admin=Depends(get_current_admin)):
    products = get_products_collection()
    users = get_users_collection()
    cart = get_cart_collection()

    total_cart_value = 0

    # Calculate total cart value
    async for item in cart.find():
        total_cart_value += item.get("price", 0) * item.get("quantity", 0)

    return {
        "products": await products.count_documents({}),
        "users": await users.count_documents({}),
        "cart_items": await cart.count_documents({}),
        "cart_total": round(total_cart_value, 2)
    }


# Get all products for admin
@router.get("/products")
async def admin_get_products(_admin=Depends(get_current_admin)):
    products = get_products_collection()
    result = []

    # Retrieve all products
    async for product in products.find():
        result.append(product_to_dict(product))

    return result


# Create a new product
@router.post("/products")
async def admin_create_product(product: ProductCreate, _admin=Depends(get_current_admin)):
    products = get_products_collection()

    # Insert new product into database
    result = await products.insert_one(product.dict())

    return {"message": "Product created", "id": str(result.inserted_id)}


# Update product information
@router.put("/products/{product_id}")
async def admin_update_product(
    product_id: str,
    product: ProductUpdate,
    _admin=Depends(get_current_admin)
):
    products = get_products_collection()

    # Only update fields with values
    update_data = {k: v for k, v in product.dict().items() if v is not None}

    try:
        result = await products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product id")

    # Check if product exists
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product updated"}


# Delete a product
@router.delete("/products/{product_id}")
async def admin_delete_product(product_id: str, _admin=Depends(get_current_admin)):
    products = get_products_collection()

    try:
        result = await products.delete_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product id")

    # Check if product exists
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted"}


# Get all users
@router.get("/users", response_model=List[UserResponse])
async def list_users(_admin=Depends(get_current_admin)):
    users = get_users_collection()
    out = []

    # Retrieve all users
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


# Create a new user
@router.post("/users")
async def admin_create_user(payload: AdminUserCreate, _admin=Depends(get_current_admin)):
    users = get_users_collection()

    # Check if email already exists
    existing = await users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    # Create new user object
    new_user = {
        "username": payload.username,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role,
    }

    # Insert user into database
    result = await users.insert_one(new_user)

    return {"message": "User created", "id": str(result.inserted_id)}


# Update user information
@router.put("/users/{user_id}")
async def admin_update_user(
    user_id: str,
    payload: AdminUserUpdate,
    _admin=Depends(get_current_admin)
):
    users = get_users_collection()

    updates = {}

    # Update username if provided
    if payload.username is not None:
        updates["username"] = payload.username

    # Update email if provided
    if payload.email is not None:
        updates["email"] = payload.email

    # Update role if provided
    if payload.role is not None:
        updates["role"] = payload.role

    # Update password if provided
    if payload.password is not None:
        updates["password_hash"] = hash_password(payload.password)

    # Prevent empty updates
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        result = await users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": updates}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    # Check if user exists
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated"}


# Delete a user
@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin=Depends(get_current_admin)):
    users = get_users_collection()
    cart = get_cart_collection()

    try:
        target_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    # Prevent admin from deleting themselves
    if target_id == admin["_id"]:
        raise HTTPException(
            status_code=400, detail="Admin cannot delete self here")

    # Delete user from database
    result = await users.delete_one({"_id": target_id})

    # Check if user exists
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    # Remove related cart items
    await cart.delete_many({"user_id": user_id})

    return None


# Get all cart items
@router.get("/cart")
async def admin_get_all_cart(_admin=Depends(get_current_admin)):
    cart = get_cart_collection()
    result = []

    # Retrieve all cart items
    async for item in cart.find():
        result.append(cart_to_dict(item))

    return result


# Update cart item quantity
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

    # Remove item if quantity is less than 1
    if payload.quantity < 1:
        await cart.delete_one({"_id": obj_id})
        return {"message": "Cart item removed"}

    # Update quantity
    result = await cart.update_one(
        {"_id": obj_id},
        {"$set": {"quantity": payload.quantity}}
    )

    # Check if cart item exists
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return {"message": "Cart item updated"}


# Delete a cart item
@router.delete("/cart/{item_id}")
async def admin_delete_cart_item(item_id: str, _admin=Depends(get_current_admin)):
    cart = get_cart_collection()

    try:
        result = await cart.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item id")

    # Check if cart item exists
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return {"message": "Cart item deleted"}