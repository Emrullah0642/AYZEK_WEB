from typing import Sequence
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models import Award
from app.schemas.awards import AwardCreate, AwardUpdate


def get(db: Session, award_id: int) -> Award | None:
    return db.query(Award).filter(Award.id == award_id).first()


def get_multi(db: Session, skip: int = 0, limit: int = 100) -> Sequence[Award]:
    return (
        db.query(Award)
        .order_by(Award.order_index.asc().nulls_last(), Award.year.desc().nulls_last(), Award.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create(db: Session, obj_in: AwardCreate) -> Award:
    if obj_in.order_index is None:
        max_idx = db.query(func.coalesce(func.max(Award.order_index), 0)).scalar()
        next_idx = int(max_idx) + 1
    else:
        next_idx = obj_in.order_index

    db_obj = Award(
        title=obj_in.title,
        description=obj_in.description,
        image_url=obj_in.image_url,
        year=obj_in.year,
        order_index=next_idx,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update(db: Session, db_obj: Award, obj_in: AwardUpdate) -> Award:
    if obj_in.title is not None:
        db_obj.title = obj_in.title
    if obj_in.description is not None:
        db_obj.description = obj_in.description
    if obj_in.image_url is not None:
        db_obj.image_url = obj_in.image_url
    if obj_in.year is not None:
        db_obj.year = obj_in.year
    if obj_in.order_index is not None:
        db_obj.order_index = obj_in.order_index

    db.commit()
    db.refresh(db_obj)
    return db_obj


def remove(db: Session, award_id: int) -> None:
    db_obj = get(db, award_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
