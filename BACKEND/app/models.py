from sqlalchemy import (
    Column,     #bir tablo sütunu oluşturur.
    Integer,
    String,
    Text,
    DateTime,
    Date,
    ARRAY,      #veritabanlarında bir sütun içinde metin listesi gibi dizeleri saklamanı sağlar.(mesela birden fazla uzmanlık yazılabirlir)
    ForeignKey, #bir sütunu başka bir tablonun id sine bağlamak için kullanılır.
    Enum,       #be yazmamız gerektiği belirlenmiştir. Başka bir şey yazamazsın
    Boolean,
    func,       #sql in kendi fonksiyonlarını kullanmamızı sağlar.
)
    # noqa: E402
#from sqlalchemy.sql import
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base
from datetime import datetime, date as date_type
import enum


# -------------------------
# AYZEK Topluluğuna Katılım Başvuruları
# -------------------------
class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    accepted = "accepted"
    rejected = "rejected"


class CommunityApplication(Base):
    """
    Katılım formu (Profesyonel Geçmiş ve checkbox'lar yok).
    Zorunlu alanlar: first_name, last_name, email, interests(>=1), heard_from, motivation, contribution
    """
    __tablename__ = "community_applications"

    id = Column(Integer, primary_key=True, index=True)

    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False, index=True)
    phone = Column(String(20), nullable=False)

    interests = Column(ARRAY(String), nullable=False)  # çoklu seçim
    heard_from = Column(String(100), nullable=False)

    motivation = Column(Text, nullable=False)

    status = Column(Enum(ApplicationStatus), nullable=False, default=ApplicationStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


# -------------------------
# Var olan modeller
# -------------------------
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    slug = Column(String(200), unique=True, index=True, nullable=False)  # URL için
    title = Column(String(200), nullable=False)                          # Başlık
    description = Column(Text, nullable=False)                           # Açıklama
    cover_image_url = Column(Text, nullable=True)                        # Fotoğraf
    start_at = Column(DateTime, nullable=False)                          # Tarih+Saat
    location = Column(String(200), nullable=False)                       # Konum
    category = Column(String(50), nullable=False)                        # Workshop/Meetup vb.
    capacity = Column(Integer, nullable=False, default=60)               # Max (örn: 60)
    registered = Column(Integer, nullable=False, default=0)              # Şu anki (örn: 45)
    whatsapp_link = Column(Text, nullable=False)                         # “Şimdi Kaydol” gideceği link
    tags = Column(String(200), nullable=True)                            # "AI,Machine Learning,Python"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)


class GalleryEvent(Base):
    __tablename__ = "gallery_events"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)         # Workshop / Hackathon / Networking ...
    image_url = Column(Text, nullable=False)              # S3 / CDN / public URL
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    date = Column(Date, nullable=False)                   # 2025-05-13 gibi
    location = Column(String(120), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# -------------------------
# Etkinlik Önerileri (Kullanıcıdan → Admin panele)
# -------------------------
class SuggestionStatus(str, enum.Enum):
    pending = "pending"
    reviewed = "reviewed"
    accepted = "accepted"
    rejected = "rejected"


class EventSuggestion(Base):
    __tablename__ = "event_suggestions"

    id = Column(Integer, primary_key=True, index=True)

    # Kullanıcıdan toplanan zorunlu alanlar
    title = Column(String(200), nullable=False)       # Etkinlik Başlığı
    description = Column(Text, nullable=False)        # Etkinlik Açıklaması
    contact = Column(String(200), nullable=False)     # İletişim (e-posta)

    # NOT: "event_type", "duration", "target_audience" alanları kaldırıldı.

    status = Column(Enum(SuggestionStatus), nullable=False, default=SuggestionStatus.pending)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Award(Base):
    __tablename__ = "awards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)          # Ödül adı
    description: Mapped[str] = mapped_column(Text, nullable=False)           # Açıklama
    image_url: Mapped[str | None] = mapped_column(String(500))               # Görsel/rozet URL
    location: Mapped[str | None] = mapped_column(String(150))                # Konum
    date: Mapped[date_type | None] = mapped_column(Date, index=True)         # Kazanıldığı tarih
    order_index: Mapped[int] = mapped_column(Integer, default=0, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class SiteContent(Base):
    """Ana sayfadaki serbest metinler (başlık/açıklama) için basit key-value depo."""
    __tablename__ = "site_content"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class Poster(Base):
    __tablename__ = "posters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)         # Başlık
    subtitle: Mapped[str | None] = mapped_column(String(250))               # Alt Başlık
    content: Mapped[str | None] = mapped_column(Text)                       # İçerik
    image_url: Mapped[str | None] = mapped_column(String(500))              # Görsel URL
    order_index: Mapped[int] = mapped_column(Integer, default=0, index=True) # Sıralama
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

class Blog(Base):
    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    author = Column(String(120), nullable=False, default="AYZEK Ekibi")
    category = Column(String(80), nullable=False, index=True)  # ör: "Yapay Zeka", "Algoritma", "Web", "Makine Öğrenmesi"
    cover_image = Column(String(400), nullable=True)           # "/images/blog/kapak.jpg" ya da tam URL
    date = Column(Date, nullable=False)                        # yayın tarihi
    preview = Column(Text, nullable=True)                      # kart üstü kısa özet


class Admin(Base):
    __tablename__ = "admins" # Bu tablo adını veritabanınızdakine göre değiştirin

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    totp_secret = Column(String, nullable=True)


class CrewMember(Base):
    __tablename__ = 'crew_members'

    id = Column(Integer, primary_key=True, index=True)
    
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)  # Uzun açıklama için Text
    photo_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    
    # Kişinin hangi kategoriye ait olduğunu belirtir
    category = Column(String(100), nullable=False, index=True) 
    
    # Kategori içindeki sıralamayı belirlemek için
    order_index = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<CrewMember(name='{self.name}', category='{self.category}')>"
