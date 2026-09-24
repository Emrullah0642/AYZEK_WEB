from typing import Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.site_content import SiteContentUpdate
from app.crud import site_content as crud_site_content

from app.security import get_current_admin
from app.models import Admin

router = APIRouter(prefix="/site-content", tags=["site-content"])


# --- GET (HERKESE AÇIK) ---
@router.get("", response_model=Dict[str, str])
def get_site_content(db: Session = Depends(get_db)):
    return crud_site_content.get_all(db)


# --- UPSERT (KİLİTLİ - SADECE ADMIN) ---
@router.put("", response_model=Dict[str, str])
def update_site_content(
    payload: SiteContentUpdate,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    return crud_site_content.upsert_many(db, payload.root)
