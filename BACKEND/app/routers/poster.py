from utils.r2_service import upload_file_to_r2
import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.poster import PosterCreate, PosterUpdate, PosterOut
from app.crud import poster

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin

from app.models import Admin
router = APIRouter(prefix="/posters", tags=["posters"])

# Resimlerin kaydedileceği klasör
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- GET İŞLEMLERİ (HERKESE AÇIK) ---
@router.get("", response_model=List[PosterOut])
def list_posters(
    skip: int = 0,
    limit: int = 100,
    active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
):
    return poster.get_multi(db, skip=skip, limit=limit, active=active)

@router.get("/{poster_id}", response_model=PosterOut)
def get_poster(poster_id: int, db: Session = Depends(get_db)):
    obj = poster.get(db, poster_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Poster bulunamadı")
    return obj

# --- YENİ EKLENEN POST (KİLİTLİ - SADECE ADMIN) ---
@router.post("", response_model=PosterOut, status_code=status.HTTP_201_CREATED)
def create_poster(
    title: str = Form(..., max_length=200),
    subtitle: Optional[str] = Form(None, max_length=250),
    content: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None), # Manuel link girilirse
    is_active: bool = Form(True),
    order_index: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None), # Dosya seçilirse
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    final_image_url = image_url

    # Dosya varsa kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url

    poster_in = PosterCreate(
        title=title,
        subtitle=subtitle,
        content=content,
        image_url=final_image_url,
        is_active=is_active,
        order_index=order_index
    )

    return poster.create(db, obj_in=poster_in)

# --- GÜNCELLENEN PUT (KİLİTLİ - SADECE ADMIN) ---
@router.put("/{poster_id}", response_model=PosterOut)
def update_poster(
    poster_id: int,
    # JSON body yerine Form kullanıyoruz
    title: Optional[str] = Form(None),
    subtitle: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    image_url: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    order_index: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None), # Yeni dosya yüklenirse
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    db_obj = poster.get(db, poster_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Poster bulunamadı")

    final_image_url = image_url

    # Eğer yeni dosya yüklendiyse
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url
    
    # Güncelleme objesini hazırla (Eğer final_image_url None ise eskisini korur crud tarafında)
    update_data = PosterUpdate(
        title=title,
        subtitle=subtitle,
        content=content,
        image_url=final_image_url,
        is_active=is_active,
        order_index=order_index
    )
    
    return poster.update(db, db_obj=db_obj, obj_in=update_data)

# --- DELETE (KİLİTLİ - SADECE ADMIN) ---
@router.delete("/{poster_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_poster(
    poster_id: int, 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    db_obj = poster.get(db, poster_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Poster bulunamadı")
    poster.remove(db, poster_id)
    return

# --- REORDER (KİLİTLİ - SADECE ADMIN) ---
@router.post("/reorder", response_model=List[PosterOut])
def reorder_posters(
    ids_in_order: List[int], 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    posters = poster.get_multi(db, limit=10000)
    id_to_obj = {p.id: p for p in posters}
    for idx, pid in enumerate(ids_in_order):
        if pid in id_to_obj:
            id_to_obj[pid].order_index = idx
    db.commit()
    return poster.get_multi(db, limit=10000)