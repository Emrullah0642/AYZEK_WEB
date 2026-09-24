from typing import Dict
from sqlalchemy.orm import Session
from app.models import SiteContent


def get_all(db: Session) -> Dict[str, str]:
    rows = db.query(SiteContent).all()
    return {row.key: row.value for row in rows}


def upsert_many(db: Session, data: Dict[str, str]) -> Dict[str, str]:
    for key, value in data.items():
        row = db.query(SiteContent).filter(SiteContent.key == key).first()
        if row:
            row.value = value
        else:
            db.add(SiteContent(key=key, value=value))
    db.commit()
    return data
