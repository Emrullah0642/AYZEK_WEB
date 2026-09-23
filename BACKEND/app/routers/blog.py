from utils.r2_service import upload_file_to_r2
import os
import shutil
import uuid
from typing import List, Optional, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.blog import BlogOut, BlogCreate, BlogUpdate
from app.crud.blog import list_blogs, get_blog, create_blog, update_blog, delete_blog

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin

from app.models import Admin
router = APIRouter(prefix="/blogs", tags=["blogs"])

# Resimlerin kaydedileceği klasör
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- GET İŞLEMLERİ (HERKESE AÇIK) ---
@router.get("", response_model=Dict[str, Any])
def api_list_blogs(
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100),
    db: Session = Depends(get_db),
):
    items, total = list_blogs(db, q=q, category=category, page=page, page_size=page_size)
    return {"items": [BlogOut.model_validate(i) for i in items], "total": total, "page": page, "page_size": page_size}

@router.get("/{blog_id}", response_model=BlogOut)
def api_get_blog(blog_id: int, db: Session = Depends(get_db)):
    obj = get_blog(db, blog_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Blog bulunamadı")
    return BlogOut.model_validate(obj)

# --- CREATE İŞLEMİ (SADECE ADMİN) ---
@router.post("", response_model=BlogOut, status_code=201)
def api_create_blog(
    title: str = Form(...),
    content: str = Form(...),
    preview_text: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    published_date: Optional[str] = Form(None),
    is_published: bool = Form(True),
    cover_image: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None), 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    final_cover_image = cover_image

    # Dosya yüklendiyse kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_cover_image = uploaded_url

    # Boş string gelirse None yap (DB hatasını önler)
    if not published_date:
        published_date = None

    payload = BlogCreate(
        title=title,
        content=content,
        preview_text=preview_text,
        author=author,
        category=category,
        date=published_date,
        is_published=is_published,
        cover_image=final_cover_image
    )

    obj = create_blog(db, payload)
    return BlogOut.model_validate(obj)

# --- UPDATE İŞLEMİ (SADECE ADMİN) ---
@router.put("/{blog_id}", response_model=BlogOut)
def api_update_blog(
    blog_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    preview_text: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    published_date: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(None),
    cover_image: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    # Önce kaydı bulalım
    existing_blog = get_blog(db, blog_id)
    if not existing_blog:
        raise HTTPException(status_code=404, detail="Blog bulunamadı")

    final_cover_image = cover_image

    # Yeni dosya varsa kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_cover_image = uploaded_url

    # Boş string gelirse None yap
    if published_date == "":
        published_date = None

    payload = BlogUpdate(
        title=title,
        content=content,
        preview_text=preview_text,
        author=author,
        category=category,
        date=published_date,
        is_published=is_published,
        cover_image=final_cover_image
    )

    obj = update_blog(db, blog_id, payload)
    if not obj:
        raise HTTPException(status_code=404, detail="Blog bulunamadı")
    return BlogOut.model_validate(obj)

# --- DELETE İŞLEMİ (SADECE ADMİN) ---
@router.delete("/{blog_id}", status_code=204)
def api_delete_blog(
    blog_id: int, 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    ok = delete_blog(db, blog_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Blog bulunamadı")
    return None