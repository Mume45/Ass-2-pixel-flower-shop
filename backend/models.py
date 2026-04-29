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
