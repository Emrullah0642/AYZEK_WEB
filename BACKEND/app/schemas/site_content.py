from typing import Dict
from pydantic import BaseModel, RootModel


class SiteContentUpdate(RootModel[Dict[str, str]]):
    """Kaydedilecek {key: value} çiftleri."""
    pass


class SiteContentOut(BaseModel):
    key: str
    value: str

    class Config:
        from_attributes = True
