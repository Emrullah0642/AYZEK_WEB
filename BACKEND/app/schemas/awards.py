from typing import Optional
from datetime import date as date_type
from pydantic import BaseModel, Field


class AwardBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    image_url: Optional[str] = None
    location: Optional[str] = None
    date: Optional[date_type] = None
    order_index: Optional[int] = None


class AwardCreate(AwardBase):
    pass


class AwardUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None
    date: Optional[date_type] = None
    order_index: Optional[int] = None


class AwardOut(AwardBase):
    id: int

    class Config:
        from_attributes = True
