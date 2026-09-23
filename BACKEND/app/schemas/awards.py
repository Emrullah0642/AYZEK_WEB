from typing import Optional
from pydantic import BaseModel, Field


class AwardBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    image_url: Optional[str] = None
    year: Optional[int] = None
    order_index: Optional[int] = None


class AwardCreate(AwardBase):
    pass


class AwardUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    image_url: Optional[str] = None
    year: Optional[int] = None
    order_index: Optional[int] = None


class AwardOut(AwardBase):
    id: int

    class Config:
        from_attributes = True
