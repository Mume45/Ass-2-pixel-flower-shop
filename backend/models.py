# models.py
# Purpose: Defines data schemas and validation models using Pydantic
# Tech: Python, Pydantic

from pydantic import BaseModel
from typing import Optional

# ---- Product (Flower) Models ----


class Product(BaseModel):
    """Represents the data structure of a flower product"""
    name: str
    price: float
    description: str
    image: str
    category: str

# ---- Shopping Cart Models ----


class CartItemCreate(BaseModel):
    """Schema for adding an item to the cart (sent by frontend)"""
    product_id: str     # Reference to the MongoDB product _id
    quantity: int = 1   # Default quantity is 1


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity"""
    quantity: int


class CartItemResponse(BaseModel):
    """Schema for cart data sent back to the frontend"""
    id: str             # The unique ID of the cart record
    product_id: str
    name: str
    price: float
    description: str
    image: str
    category: str

class ProductCreate(BaseModel):
    name: str
    price: float
    description: str
    image: str
    category: str


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    category: Optional[str] = None


class UserCreate(BaseModel):
    username: str
    email: str
    role: str = "customer"
    status: str = "active"


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None