import os
import pyotp
import qrcode
import io
import base64
from datetime import timedelta
from typing import Optional

# !!! Response IMPORTU EKLENDİ !!!
from fastapi import APIRouter, Depends, HTTPException, status, Body, Request, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Admin as AdminModel
from ..schemas.admin_login import AdminLogin
from ..security import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    require_admin,
    verify_password,
)

# Trafik Polisi (Rate Limiter)
from ..limiter import limiter

router = APIRouter(prefix="/admin", tags=["admin"])

# Varsayılan "production": sadece ENVIRONMENT=development açıkça set edilmişse cookie'yi HTTP üzerinden de kabul et.
IS_PRODUCTION = os.getenv("ENVIRONMENT", "production").lower() != "development"

# --- LOGIN FONKSİYONU (HTTPONLY COOKIE GÜNCELLEMESİ) ---
@router.post("/login")
@limiter.limit("5/minute")
def login_admin(response: Response, request: Request, credentials: AdminLogin, db: Session = Depends(get_db)):
    """
    Admin girişi yapar.
    Token'ı JSON olarak dönmek yerine HttpOnly Cookie olarak tarayıcıya set eder.
    """
    admin_user = db.query(AdminModel).filter(AdminModel.email == credentials.email).first()
    
    # 1. Klasik Şifre Kontrolü
    if not admin_user or not verify_password(credentials.password, admin_user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz e-posta veya şifre",
        )

    # 2. 2FA (Authenticator) Kontrolü
    if admin_user.totp_secret:
        if not credentials.totp_code:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="2FA_REQUIRED",
            )
        
        totp = pyotp.TOTP(admin_user.totp_secret)
        if not totp.verify(credentials.totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz doğrulama kodu",
            )

    # 3. Token Oluştur
    token = create_access_token(
        data={"sub": admin_user.email},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    
    # 4. TOKEN'I COOKIE OLARAK GÖM (EN ÖNEMLİ KISIM)
    # Bu cookie'ye JavaScript erişemez, XSS saldırılarına karşı korur.
    response.set_cookie(
        key="admin_token",           # Cookie adı
        value=token,                 # Token değeri
        httponly=True,               # JS erişimini kapat (Güvenlik)
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60, # Saniye cinsinden ömür
        expires=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",              # CSRF koruması için
        secure=IS_PRODUCTION,        # Prod'da (HTTPS) True; sadece ENVIRONMENT=development ile localhost'ta False.
    )
    
    # Frontend'e sadece bilgi dönüyoruz, token yok!
    return {
        "message": "Giriş başarılı",
        "admin_info": {
            "id": admin_user.id, 
            "email": admin_user.email,
            "is_2fa_enabled": bool(admin_user.totp_secret) 
        },
    }

@router.get("/me")
def get_me(current_admin: AdminModel = Depends(require_admin)):
    return {
        "id": current_admin.id, 
        "email": current_admin.email,
        "is_2fa_enabled": bool(current_admin.totp_secret)
    }

# --- LOGOUT (COOKIE SİLME) ---
@router.post("/logout")
def logout(response: Response, current_admin: AdminModel = Depends(require_admin)):
    # Çıkış yaparken cookie'yi siliyoruz — set_cookie ile aynı samesite/secure ile, aksi halde bazı tarayıcılar silmez
    response.delete_cookie(key="admin_token", samesite="lax", secure=IS_PRODUCTION)
    return {"message": "Başarıyla çıkış yapıldı"}

@router.get("/dashboard")
def dashboard(current_admin: AdminModel = Depends(require_admin)):
    return {
        "message": f"Hoşgeldiniz {current_admin.email}",
        "dashboard_data": {"total_users": 150, "total_events": 25, "total_posts": 78}
    }

# --- 2FA KURULUM FONKSİYONLARI ---

@router.post("/2fa/setup")
def setup_2fa(current_admin: AdminModel = Depends(require_admin)):
    if current_admin.totp_secret:
        raise HTTPException(status_code=400, detail="2FA zaten aktif")

    secret = pyotp.random_base32()
    
    uri = pyotp.totp.TOTP(secret).provisioning_uri(
        name=current_admin.email,
        issuer_name="AYZEK Admin Panel"
    )

    img = qrcode.make(uri)
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    qr_base64 = base64.b64encode(buffered.getvalue()).decode("utf-8")

    return {
        "secret": secret,
        "qr_code": f"data:image/png;base64,{qr_base64}"
    }

@router.post("/2fa/enable")
def enable_2fa(
    secret: str = Body(..., embed=True),
    code: str = Body(..., embed=True),
    current_admin: AdminModel = Depends(require_admin),
    db: Session = Depends(get_db)
):
    totp = pyotp.TOTP(secret)
    if not totp.verify(code):
        raise HTTPException(status_code=400, detail="Kod hatalı, lütfen tekrar deneyin.")

    current_admin.totp_secret = secret
    db.commit()
    
    return {"message": "2FA başarıyla aktifleştirildi."}

@router.post("/2fa/disable")
def disable_2fa(
    current_admin: AdminModel = Depends(require_admin), 
    db: Session = Depends(get_db)
):
    current_admin.totp_secret = None
    db.commit()
    return {"message": "2FA devre dışı bırakıldı."}