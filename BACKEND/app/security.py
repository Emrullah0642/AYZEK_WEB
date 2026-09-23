# app/security.py
from datetime import datetime, timedelta
from typing import Optional, Dict, Any

# !!! Cookie Okumak İçin Request Eklendi !!!
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import os

from .database import get_db
from .models import Admin

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- ENV ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY bulunamadı. .env dosyanızı kontrol edin — "
        "bu değişken olmadan uygulama, tahmin edilebilir bir secret ile admin token'ları imzalamaz."
    )
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Swagger UI için Bearer şeması (Görsel amaçlı kalabilir)
security = HTTPBearer(auto_error=False)

# --- PASSWORD ---
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# --- JWT ---
def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# --- YENİ BAĞIMLILIK (DEPENDENCY) ---
# Token'ı önce Cookie'den, yoksa Header'dan okur.
def require_admin(
    request: Request,
    db: Session = Depends(get_db),
) -> Admin:
    token = None
    
    # 1. Önce güvenli Cookie'ye bak (admin_token)
    if "admin_token" in request.cookies:
        token = request.cookies.get("admin_token")
    
    # 2. Cookie yoksa Authorization Header'a bak (Postman/Swagger testi için)
    elif "Authorization" in request.headers:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    # Token bulunamadıysa hata ver
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )

    # Token'ı çöz
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    email = payload.get("sub")
    
    # DB kontrolü
    admin = db.query(Admin).filter(Admin.email == email).first()

    if not admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")

    return admin

# Router'ların beklediği isim:
def get_current_admin(admin: Admin = Depends(require_admin)) -> Admin:
    return admin