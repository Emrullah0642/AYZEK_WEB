from utils.r2_service import upload_file_to_r2
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.awards import AwardCreate, AwardUpdate, AwardOut
from app.crud import awards as crud_awards

# !!! GÜVENLİK İÇİN GEREKLİ IMPORT !!!
from app.security import get_current_admin
from app.models import Admin

router = APIRouter(prefix="/awards", tags=["awards"])


# --- GET İŞLEMLERİ (HERKESE AÇIK) ---
@router.get("", response_model=List[AwardOut])
def list_awards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_awards.get_multi(db, skip=skip, limit=limit)


@router.get("/{award_id}", response_model=AwardOut)
def get_award(award_id: int, db: Session = Depends(get_db)):
    obj = crud_awards.get(db, award_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Ödül bulunamadı")
    return obj


# --- CREATE (KİLİTLİ - SADECE ADMIN) ---
@router.post("", response_model=AwardOut, status_code=status.HTTP_201_CREATED)
def create_award(
    title: str = Form(..., max_length=200),
    description: str = Form(...),
    year: Optional[int] = Form(None),
    order_index: Optional[int] = Form(None),
    image_url: Optional[str] = Form(None),  # Manuel link girilirse
    file: Optional[UploadFile] = File(None),  # Dosya seçilirse
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    final_image_url = image_url

    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"

        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url

    award_in = AwardCreate(
        title=title,
        description=description,
        image_url=final_image_url,
        year=year,
        order_index=order_index,
    )
    return crud_awards.create(db, obj_in=award_in)


# --- UPDATE (KİLİTLİ - SADECE ADMIN) ---
@router.put("/{award_id}", response_model=AwardOut)
def update_award(
    award_id: int,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    order_index: Optional[int] = Form(None),
    image_url: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    db_obj = crud_awards.get(db, award_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Ödül bulunamadı")

    final_image_url = image_url
    if file:
        file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        unique_filename = f"{uuid.uuid4()}.{file_ext}"

        uploaded_url = upload_file_to_r2(file.file, unique_filename, file.content_type)
        if not uploaded_url:
            raise HTTPException(status_code=500, detail="Resim yüklenemedi")

        final_image_url = uploaded_url

    update_data = AwardUpdate(
        title=title,
        description=description,
        image_url=final_image_url,
        year=year,
        order_index=order_index,
    )
    return crud_awards.update(db, db_obj=db_obj, obj_in=update_data)


# --- DELETE (KİLİTLİ - SADECE ADMIN) ---
@router.delete("/{award_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_award(
    award_id: int,
    db: Session = Depends(get_db),
    current_admin: Admin = Depends(get_current_admin),
):
    db_obj = crud_awards.get(db, award_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Ödül bulunamadı")
    crud_awards.remove(db, award_id)
    return
