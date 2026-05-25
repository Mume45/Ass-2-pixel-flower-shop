# routes/auth.py
# Author: Zhonghe Wang，Shiying Gu
# Purpose: Registration, login, and CRUD on the authenticated user's own account.
#
# Endpoints:
#   POST   /api/auth/register   create user, return JWT          [public]
#   POST   /api/auth/login      verify credentials, return JWT   [public]
#   GET    /api/auth/me         return current user              [bearer]
#   PUT    /api/auth/me         update own username / password   [bearer]
#   DELETE /api/auth/me         delete own account               [bearer]

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from auth_utils import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from database import get_users_collection
from models import Token, UserLogin, UserRegister, UserResponse, UserUpdate

router = APIRouter()


# ---- CREATE: register a new user ----
@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    """Create a user (bcrypt-hashed password) and return a JWT.

    Email is the unique login identifier; username is stored as a display
    name only and is never used to authenticate.
    """
    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Email must be unique (a DB unique index enforces this as a second guard).
    if await users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = {
        "username": payload.username,  # display name only
        "email": payload.email,        # the login identifier
        "password_hash": hash_password(payload.password),
        "role": "user",  # default role; promote to "admin" manually in the DB
    }
    result = await users.insert_one(new_user)

    token = create_access_token(str(result.inserted_id))
    return Token(access_token=token)


# ---- LOGIN (email only) ----
@router.post("/login", response_model=Token)
async def login(payload: UserLogin):
    """Authenticate by email + password and return a JWT.

    Login is email-only: the account is matched strictly on the email
    field. Usernames are never accepted as a login credential.
    """
    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Find the account by email, then check the password against its bcrypt hash.
    user = await users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        # One generic message so attackers can't tell which part was wrong.
        raise HTTPException(
            status_code=401, detail="Invalid email or password")

    token = create_access_token(str(user["_id"]))
    return Token(access_token=token)


# ---- READ: who am I ----
@router.get("/me", response_model=UserResponse)
async def me(current_user=Depends(get_current_user)):
    """Return the currently logged-in user's public info."""
    return UserResponse(
        id=str(current_user["_id"]),
        username=current_user["username"],
        email=current_user["email"],
        role=current_user.get("role", "user"),
    )


# ---- UPDATE: change own username / password ----
@router.put("/me", response_model=UserResponse)
async def update_me(payload: UserUpdate, current_user=Depends(get_current_user)):
    """
    Update the logged-in user's own username and/or password.
    Only the fields actually provided in the request body will be changed.
    """
    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    updates = {}
    if payload.username is not None:
        updates["username"] = payload.username
    if payload.password is not None:
        updates["password_hash"] = hash_password(payload.password)

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    await users.update_one({"_id": current_user["_id"]}, {"$set": updates})

    # Re-read to send back the freshest copy
    updated = await users.find_one({"_id": current_user["_id"]})
    return UserResponse(
        id=str(updated["_id"]),
        username=updated["username"],
        email=updated["email"],
        role=updated.get("role", "user"),
    )


# ---- DELETE: remove own account ----
@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_me(current_user=Depends(get_current_user)):
    """Permanently delete the logged-in user's own account."""
    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    await users.delete_one({"_id": current_user["_id"]})
    return None
