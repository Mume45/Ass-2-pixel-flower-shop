# auth_utils.py
# Author: Shiying Gu, Zhonghe Wang
# Purpose: Password hashing (bcrypt) + JWT creation/verification utilities.
# Tech: passlib[bcrypt], python-jose

import os
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from database import get_users_collection

# ---- Configuration loaded from environment variables ----
SECRET_KEY = os.getenv("JWT_SECRET", "change_me_please")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

# bcrypt is the industry standard for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Simple Bearer token scheme: Swagger Authorize dialog will just ask for the JWT
bearer_scheme = HTTPBearer()


# ---- Password Helpers ----
def hash_password(plain_password: str) -> str:
    """Turn a plain password into a bcrypt hash for safe storage."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


# ---- JWT Helpers ----
def create_access_token(user_id: str) -> str:
    """Create a signed JWT containing the user's id as the subject."""
    expire = datetime.now(timezone.utc) + \
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
):
    """
    FastAPI dependency that decodes the JWT, looks up the user in MongoDB,
    and returns the user document. Raises 401 if anything is wrong.
    Use it on protected routes:  user = Depends(get_current_user)
    """
    credentials_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise credentials_exc
    except JWTError:
        raise credentials_exc

    users = get_users_collection()
    if users is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    try:
        user = await users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise credentials_exc

    if not user:
        raise credentials_exc
    return user


async def get_current_admin(current_user=Depends(get_current_user)):
    """
    Dependency that only lets through users whose role is 'admin'.
    Used to gate admin-only endpoints (e.g. listing all users).
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user
