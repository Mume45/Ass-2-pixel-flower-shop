# main.py
# Purpose: Backend entry point that initializes FastAPI, manages DB lifecycle, and loads routers.
# Technical Stack: FastAPI, MongoDB (Motor), CORS Middleware

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import connect_db, close_db
from routes.admin import router as admin_router
from routes.auth import router as auth_router
from routes.cart import router as cart_router
from routes.products import router as products_router

# Initialize FastAPI application instance
app = FastAPI(title="Pixel Flower Shop API")

# ---- CORS Configurations ----
# Allows the React frontend (localhost:3000) to communicate with this backend API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Lifecycle Events ----
# Handles database connection startup and graceful shutdown
@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()

# ---- Route Registration ----
# Mounting modular routers for products and shopping cart functionality
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(admin_router, prefix="/api/admin", tags=["admin"])
app.include_router(products_router, prefix="/api/products", tags=["products"])
app.include_router(cart_router, prefix="/api/cart", tags=["cart"])

# ---- System Health Check ----
# Simple endpoint to verify if the server is running correctly


@app.get("/")
async def root():
    return {"message": "Welcome to Vivian's Flowers!"}
