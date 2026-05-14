from fastapi import APIRouter, HTTPException
from bson import ObjectId

from database import get_products_collection, get_cart_collection, get_users_collection
from models import ProductCreate, ProductUpdate, UserCreate, UserUpdate, CartItemUpdate

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


def user_to_dict(user):
    return {
        "id": str(user["_id"]),
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "customer"),
        "status": user.get("status", "active")
    }


@router.get("/summary")
async def get_admin_summary():
    products = get_products_collection()
    users = get_users_collection()
    cart = get_cart_collection()

    return {
        "product_count": await products.count_documents({}),
        "user_count": await users.count_documents({}),
        "cart_count": await cart.count_documents({})
    }


@router.post("/products")
async def create_product(product: ProductCreate):
    products = get_products_collection()
    result = await products.insert_one(product.dict())
    return {"message": "Product created", "id": str(result.inserted_id)}


@router.put("/products/{product_id}")
async def update_product(product_id: str, product: ProductUpdate):
    products = get_products_collection()
    update_data = {k: v for k, v in product.dict().items() if v is not None}

    try:
        result = await products.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product updated"}


@router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    products = get_products_collection()

    try:
        result = await products.delete_one({"_id": ObjectId(product_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return {"message": "Product deleted"}


@router.get("/users")
async def get_users():
    users = get_users_collection()
    result = []

    async for user in users.find():
        result.append(user_to_dict(user))

    return result


@router.post("/users")
async def create_user(user: UserCreate):
    users = get_users_collection()
    result = await users.insert_one(user.dict())
    return {"message": "User created", "id": str(result.inserted_id)}


@router.put("/users/{user_id}")
async def update_user(user_id: str, user: UserUpdate):
    users = get_users_collection()
    update_data = {k: v for k, v in user.dict().items() if v is not None}

    try:
        result = await users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User updated"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    users = get_users_collection()

    try:
        result = await users.delete_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"message": "User deleted"}


@router.get("/cart")
async def get_all_cart_items():
    cart = get_cart_collection()
    result = []

    async for item in cart.find():
        result.append({
            "id": str(item["_id"]),
            "product_id": item.get("product_id", ""),
            "name": item.get("name", ""),
            "price": item.get("price", 0),
            "image": item.get("image", ""),
            "quantity": item.get("quantity", 0),
            "subtotal": round(item.get("price", 0) * item.get("quantity", 0), 2)
        })

    return result


@router.put("/cart/{item_id}")
async def admin_update_cart_item(item_id: str, item: CartItemUpdate):
    cart = get_cart_collection()

    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item ID")

    if item.quantity < 1:
        await cart.delete_one({"_id": obj_id})
        return {"message": "Cart item removed"}

    await cart.update_one(
        {"_id": obj_id},
        {"$set": {"quantity": item.quantity}}
    )

    return {"message": "Cart item updated"}


@router.delete("/cart/{item_id}")
async def admin_delete_cart_item(item_id: str):
    cart = get_cart_collection()

    try:
        result = await cart.delete_one({"_id": ObjectId(item_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid cart item ID")

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cart item not found")

    return {"message": "Cart item deleted"}