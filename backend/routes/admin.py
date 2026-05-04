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

from auth_utils import get_current_admin
from database import get_users_collection
from models import UserResponse

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def list_users(_admin=Depends(get_current_admin)):
    """Return every user in the database (without password hashes)."""
    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    out: List[UserResponse] = []
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


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, admin=Depends(get_current_admin)):
    """Delete any user by id. Admins cannot delete their own account here
    (they should use DELETE /api/auth/me instead)."""
    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        target_id = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user id")

    if target_id == admin["_id"]:
        raise HTTPException(
            status_code=400,
            detail="Use DELETE /api/auth/me to delete your own account",
        )

    result = await users.delete_one({"_id": target_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return None
