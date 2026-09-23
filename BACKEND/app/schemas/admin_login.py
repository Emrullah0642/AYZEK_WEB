from pydantic import BaseModel, EmailStr
from typing import Optional

class AdminLogin(BaseModel):
    email: EmailStr
    password: str
    totp_code: Optional[str] = None

class Admin(BaseModel):
    email: str
    name: Optional[str] = None
    
    class Config:
        from_attributes = True