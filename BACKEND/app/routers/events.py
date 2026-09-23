from utils.r2_service import upload_file_to_r2
import os
import shutil
import uuid
import re
from typing import List, Optional
from datetime import datetime
import logging

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.events import Event, EventCreate, EventUpdate
from app.crud import events as crud_events

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin
from app.models import Admin

router = APIRouter(prefix="/events", tags=["events"])
logger = logging.getLogger("uvicorn.error")

# Resimlerin kaydedileceği klasör
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- YARDIMCI FONKSİYON: SLUGIFY ---
def slugify(text: str) -> str:
    # Türkçe karakterleri değiştir
    text = text.replace("ı", "i").replace("ğ", "g").replace("ü", "u").replace("ş", "s").replace("ö", "o").replace("ç", "c")
    text = text.replace("İ", "i").replace("Ğ", "g").replace("Ü", "u").replace("Ş", "s").replace("Ö", "o").replace("Ç", "c")
    # Alfanümerik olmayanları sil ve tirele
    text = re.sub(r'[^a-zA-Z0-9\s-]', '', text).lower().strip()
    text = re.sub(r'[\s-]+', '-', text)
    return text

# --- GET (HERKESE AÇIK) ---
@router.get("", response_model=List[Event])
def get_events(skip: int = 0, limit: int = Query(100, le=200), db: Session = Depends(get_db)):
    return crud_events.get_events(db, skip, limit)

@router.get("/upcoming", response_model=List[Event])
def get_upcoming_events(limit: int = Query(100, le=200), db: Session = Depends(get_db)):
    return crud_events.get_upcoming_events(db, limit)

@router.get("/slug/{slug}", response_model=Event)
def get_event_by_slug(slug: str, db: Session = Depends(get_db)):
    event = crud_events.get_event_by_slug(db, slug)
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event

@router.get("/{event_id}", response_model=Event)
def get_event(event_id: int, db: Session = Depends(get_db)):
    event = crud_events.get_event(db, event_id)
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event

# --- CREATE (KİLİTLİ - SADECE ADMIN) ---
@router.post("", response_model=Event, status_code=status.HTTP_201_CREATED)
def create_event(
    title: str = Form(...),
    description: str = Form(...),
    date: str = Form(...),      # YYYY-MM-DD
    time: str = Form(...),      # HH:MM
    location: str = Form(...),
    max_attendees: int = Form(...),
    category: str = Form(...),  # Kategori zorunlu hale getirildi
    tags: Optional[str] = Form(None), 
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    try:
        final_image_url = image_url

        # Dosya yüklendiyse kaydet
        if file:
            file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            unique_filename = f"{uuid.uuid4()}.{file_ext}"
            
            uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
            if not uploaded_url:
                raise HTTPException(status_code=500, detail="Resim yüklenemedi")

            final_image_url = uploaded_url

        # 1. Tarih ve Saati birleştir (ISO Formatı)
        # Örnek: "2025-12-24" + "08:30" -> "2025-12-24T08:30:00"
        start_at_iso = f"{date}T{time}:00"

        # 2. Slug Oluştur
        base_slug = slugify(title)
        # Benzersiz olması için sonuna rastgele kısa kod ekleyelim
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:6]}"

        # 3. Tagleri düzenle (DB string olarak saklıyorsa string bırak, yoksa listeye çevir)
        # Senin şemanda tags: Optional[str] olduğu için string olarak saklıyoruz.
        final_tags = tags if tags else ""

        # Pydantic şemasını oluştur
        payload = EventCreate(
            title=title,
            description=description,
            start_at=start_at_iso, # Backend bunu datetime'a çevirir
            location=location,
            capacity=max_attendees,
            category=category,
            tags=final_tags,
            cover_image_url=final_image_url,
            slug=unique_slug,
            whatsapp_link="" # Formda yoksa boş string
        )

        return crud_events.create_event(db, payload)

    except HTTPException:
        raise
    except Exception:
        logger.exception("Etkinlik oluşturulurken beklenmeyen hata")
        raise HTTPException(status_code=500, detail="Etkinlik oluşturulurken bir hata oluştu.")

# --- UPDATE (KİLİTLİ - SADECE ADMIN) ---
@router.put("/{event_id}", response_model=Event)
def update_event(
    event_id: int, 
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    date: Optional[str] = Form(None),
    time: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    max_attendees: Optional[int] = Form(None),
    category: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    existing_event = crud_events.get_event(db, event_id)
    if not existing_event:
        raise HTTPException(status_code=404, detail="Event not found")

    final_image_url = image_url

    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url

    # Güncelleme verilerini hazırla
    update_data = {}
    if title is not None: update_data["title"] = title
    if description is not None: update_data["description"] = description
    
    # Tarih/Saat güncellemesi varsa birleştir — sadece biri gelirse diğerini mevcut kayıttan al
    if date is not None or time is not None:
        existing_date, existing_time = existing_event.start_at.date(), existing_event.start_at.time()
        new_date = date if date is not None else existing_date.isoformat()
        new_time = time if time is not None else existing_time.strftime("%H:%M")
        update_data["start_at"] = f"{new_date}T{new_time}:00"

    if location is not None: update_data["location"] = location
    if max_attendees is not None: update_data["capacity"] = max_attendees # Şemada capacity olarak geçiyor olabilir dikkat
    if category is not None: update_data["category"] = category
    if tags is not None: update_data["tags"] = tags
    if final_image_url is not None: update_data["cover_image_url"] = final_image_url

    # Slug güncellemek istenirse:
    if title is not None:
         base_slug = slugify(title)
         update_data["slug"] = f"{base_slug}-{uuid.uuid4().hex[:6]}"

    payload = EventUpdate(**update_data)

    event = crud_events.update_event(db, event_id, payload)
    return event

# --- DELETE (KİLİTLİ - SADECE ADMIN) ---
@router.delete("/{event_id}", response_model=Event)
def delete_event(
    event_id: int, 
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin)
):
    event = crud_events.delete_event(db, event_id)
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found"
        )
    return event