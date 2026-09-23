from utils.r2_service import upload_file_to_r2
import os
import shutil
import uuid
from typing import List, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import crew as crud
from app.schemas.crew import CrewMemberCreate, CrewMemberRead, CrewMemberUpdate
from app.models import CrewMember, Admin

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin

router = APIRouter(
    prefix="/crew",
    tags=["Crew Members"]
)

# Resimlerin kaydedileceği klasör
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- GET İŞLEMİ (HERKESE AÇIK) ---
@router.get("/", response_model=Dict[str, List[CrewMemberRead]], summary="Tüm ekip üyelerini kategorilere göre gruplanmış getirir.")
def read_all_crew_members(db: Session = Depends(get_db)):
    """
    Tüm ekip üyelerini `{ "Başkan ve Yardımcılar": [...], "Sosyal Medya": [...] }` formatında döndürür.
    """
    return crud.get_all_crew_members_grouped(db=db)

# --- CREATE İŞLEMİ (KİLİTLİ - SADECE ADMIN) ---
@router.post("/", response_model=CrewMemberRead, status_code=status.HTTP_201_CREATED, summary="Yeni bir ekip üyesi oluşturur (Admin).")
def create_crew_member(
    name: str = Form(...),
    role: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    photo_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    final_photo_url = photo_url

    # Dosya yüklendiyse kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_photo_url = uploaded_url

    # Pydantic modelini oluştur
    member = CrewMemberCreate(
        name=name,
        role=role,
        category=category,
        description=description,
        linkedin_url=linkedin_url,
        github_url=github_url,
        photo_url=final_photo_url
    )
    
    return crud.create_crew_member(db=db, member=member)

# --- UPDATE İŞLEMİ (KİLİTLİ - SADECE ADMIN) ---
@router.put("/{member_id}", response_model=CrewMemberRead, summary="Bir ekip üyesini günceller (Admin).")
def update_crew_member(
    member_id: int,
    name: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    linkedin_url: Optional[str] = Form(None),
    github_url: Optional[str] = Form(None),
    photo_url: Optional[str] = Form(None),
    order_index: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    # Önce üye var mı kontrol et
    db_member = db.query(CrewMember).filter(CrewMember.id == member_id).first()
    if db_member is None:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")

    final_photo_url = photo_url

    # Yeni dosya varsa kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_photo_url = uploaded_url

    # Güncelleme verilerini hazırla (Sadece dolu olanları al)
    update_data = {}
    if name is not None: update_data["name"] = name
    if role is not None: update_data["role"] = role
    if category is not None: update_data["category"] = category
    if description is not None: update_data["description"] = description
    if linkedin_url is not None: update_data["linkedin_url"] = linkedin_url
    if github_url is not None: update_data["github_url"] = github_url
    if final_photo_url is not None: update_data["photo_url"] = final_photo_url
    if order_index is not None: update_data["order_index"] = order_index

    member_update = CrewMemberUpdate(**update_data)

    updated = crud.update_crew_member(db=db, member_id=member_id, member_update=member_update)
    if updated is None:
        raise HTTPException(status_code=404, detail="Ekip üyesi güncellenemedi")
    return updated

# --- DELETE İŞLEMİ (KİLİTLİ - SADECE ADMIN) ---
@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Bir ekip üyesini siler (Admin).")
def delete_crew_member(
    member_id: int, 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    success = crud.delete_crew_member(db=db, member_id=member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Ekip üyesi bulunamadı")
    return {"ok": True}