from utils.r2_service import upload_file_to_r2
import os
import shutil
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Form, Request, status, File, UploadFile
from sqlalchemy.orm import Session

from app.schemas.timeline import TimelineEventOut, TimelineEventCreate, TimelineEventUpdate
from app.crud.timeline import list_events, get_event, create_event, update_event, delete_event
from app.database import get_db

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin

from app.models import Admin
router = APIRouter(prefix="/timeline", tags=["timeline"])

# Klasör Ayarı
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- GET İŞLEMLERİ (HERKESE AÇIK) ---
@router.get("", response_model=List[TimelineEventOut])
def list_timeline(db: Session = Depends(get_db)):
    return list_events(db)

@router.get("/{event_id}", response_model=TimelineEventOut)
def get_timeline_item(event_id: int, db: Session = Depends(get_db)):
    obj = get_event(db, event_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Timeline event not found")
    return obj

# --- CREATE İŞLEMİ (KİLİTLİ - SADECE ADMIN) ---
@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    response_model=TimelineEventOut,
)
async def create_timeline_item(
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form(...),
    date_label: str = Form(...),
    image_url: Optional[str] = Form(None), # Manuel link girilirse
    file: Optional[UploadFile] = File(None), # Dosya seçilirse
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    final_image_url = image_url

    # Dosya Kaydetme
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url

    payload = TimelineEventCreate(
        title=title,
        description=description,
        category=category,
        date_label=date_label,
        image_url=final_image_url
    )
    
    # create_event fonksiyonun yapısına göre image_url'i payload içinde gönderiyoruz
    # Eğer crud fonksiyonun ayrıca image_url parametresi almıyorsa sadece payload yeterli.
    # Burada crud fonksiyonunun esnek olduğunu varsayarak devam ediyoruz.
    return create_event(db, payload, image_url=final_image_url)


# --- UPDATE İŞLEMİ (KİLİTLİ - SADECE ADMIN) ---
@router.put(
    "/{event_id}",
    response_model=TimelineEventOut,
)
async def update_timeline_item(
    event_id: int,
    request: Request,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    date_label: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    obj = get_event(db, event_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Timeline event not found")

    # Dosya varsa işle
    final_image_url = image_url
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url

    ct = (request.headers.get("content-type") or "").lower()

    # JSON body ile güncelleme (Eski yöntem - Postman vb için)
    if ct.startswith("application/json"):
        data = await request.json()
        updates = TimelineEventUpdate(**data)
        return update_event(db, obj, updates, image_url=None)

    # Form Data ile güncelleme
    updates = TimelineEventUpdate(
        title=title,
        description=description,
        category=category,
        date_label=date_label,
        image_url=final_image_url, 
    )
    return update_event(db, obj, updates, image_url=None)


# --- DELETE İŞLEMİ (KİLİTLİ - SADECE ADMIN) ---
@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_timeline_item(
    event_id: int, 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    obj = get_event(db, event_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Timeline event not found")
    delete_event(db, obj)
    return None