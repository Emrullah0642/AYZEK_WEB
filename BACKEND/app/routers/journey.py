from utils.r2_service import upload_file_to_r2
import os
import shutil
import uuid
from typing import List, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.crud import journey as crud
from app.schemas.journey import JourneyPersonCreate, JourneyPersonRead, JourneyPersonUpdate

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin

from app.models import Admin
router = APIRouter(
    prefix="/journey",
    tags=["Journey"]
)

# Resimlerin kaydedileceği klasör
UPLOAD_DIR = "public/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# --- PUBLIC ROUTE (Frontend için - HERKESE AÇIK) ---

@router.get("/", response_model=Dict[int, List[JourneyPersonRead]], summary="Tüm 'Yolculuğumuz' kayıtlarını yıllara göre gruplanmış olarak getirir.")
def read_all_journey_people(db: Session = Depends(get_db)):
    """
    Frontend'de zaman çizelgesini oluşturmak için tüm kişileri `{2023: [...], 2022: [...]}` formatında döndürür.
    """
    return crud.get_all_journey_people_grouped_by_year(db=db)


# --- ADMIN ROUTES (Yönetim paneli için - KİLİTLİ) ---

@router.post("/", response_model=JourneyPersonRead, status_code=status.HTTP_201_CREATED, summary="Yeni bir 'Yolculuğumuz' kişisi oluşturur (Admin).")
def create_journey_person(
    year: int = Form(...),
    name: str = Form(...),
    role: str = Form(...),
    description: str = Form(...),
    photo_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None), # Dosya parametresi
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    """
    Admin panelinden gelen verilerle yeni bir kişi kaydı oluşturur.
    Hem dosya yüklemeyi hem de manuel URL girmeyi destekler.
    """
    final_photo_url = photo_url

    # Dosya yüklendiyse kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_photo_url = uploaded_url

    # Şemayı oluştur
    person_in = JourneyPersonCreate(
        year=year,
        name=name,
        role=role,
        description=description,
        photo_url=final_photo_url
    )

    return crud.create_journey_person(db=db, person=person_in)


@router.put("/{person_id}", response_model=JourneyPersonRead, summary="Bir 'Yolculuğumuz' kişisini günceller (Admin).")
def update_journey_person(
    person_id: int,
    year: Optional[int] = Form(None),
    name: Optional[str] = Form(None),
    role: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    photo_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    """
    ID'ye göre belirtilen kişi kaydının bilgilerini günceller.
    Dosya gönderilirse fotoğraf güncellenir.
    """
    db_person = crud.get_journey_person_by_id(db, person_id=person_id)
    if db_person is None:
        raise HTTPException(status_code=404, detail="Kişi bulunamadı")
    
    final_photo_url = photo_url

    # Yeni dosya varsa kaydet
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"
        
        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_photo_url = uploaded_url

    # Güncelleme şemasını oluştur
    person_update = JourneyPersonUpdate(
        year=year,
        name=name,
        role=role,
        description=description,
        photo_url=final_photo_url
    )
    
    updated_person = crud.update_journey_person(db=db, person_id=person_id, person_update=person_update)
    return updated_person


@router.delete("/{person_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Bir 'Yolculuğumuz' kişisini siler (Admin).")
def delete_journey_person(
    person_id: int, 
    db: Session = Depends(get_db),
    # !!! KİLİT BURADA !!!
    current_admin: Admin = Depends(get_current_admin)
):
    """
    ID'ye göre belirtilen kişi kaydını veritabanından siler.
    """
    db_person = crud.get_journey_person_by_id(db, person_id=person_id)
    if db_person is None:
        raise HTTPException(status_code=404, detail="Kişi bulunamadı")
    
    crud.delete_journey_person(db=db, person_id=person_id)
    return {"ok": True}