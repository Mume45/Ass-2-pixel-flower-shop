# models.py
# Author: Shiying Gu, Yuhan Sun
# Purpose: Defines data schemas and validation models using Pydantic
# Tech: Python, Pydantic

from pydantic import BaseModel, EmailStr, Field
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


# ---- User / Auth Models ----


class UserRegister(BaseModel):
    """Payload sent by the frontend when a new user signs up."""
    username: str = Field(..., min_length=2, max_length=30)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    """Payload sent by the frontend when a user logs in (email only)."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Partial update — only the fields the user provides will be changed."""
    username: Optional[str] = Field(None, min_length=2, max_length=30)
    password: Optional[str] = Field(None, min_length=6, max_length=128)


class UserResponse(BaseModel):
    """Public user data returned to the frontend (never includes password)."""
    id: str
    username: str
    email: EmailStr
    role: str


class Token(BaseModel):
    """JWT response returned after successful register/login."""
    access_token: str
    token_type: str = "bearer"

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


class AdminUserCreate(BaseModel):
    username: str
    email: str
    password: str = "password123"
    role: str = "user"


class AdminUserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None