from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles 
from starlette.middleware.gzip import GZipMiddleware
from dotenv import load_dotenv
import logging, os
from starlette.middleware.base import BaseHTTPMiddleware

# --- GÜVENLİK (RATE LIMIT) IMPORTLARI ---
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.limiter import limiter # Oluşturduğumuz ayar dosyasından çekiyoruz

load_dotenv()

from app.security import hash_password

# Router Importları
from app.routers.timeline import router as timeline_router
from app.routers.events import router as events_router
from app.routers.gallery_events import router as gallery_router
from app.routers.journey import router as journey_router
from app.routers.event_suggestions import router as suggestions_router
from app.routers.community import router as community_router
from app.routers.poster import router as poster_router
from app.routers.blog import router as blog_router
from app.routers.admin_auth import router as admin_auth_router
from app.routers.crew import router as crew_router
from app.routers.awards import router as awards_router

app = FastAPI(title="AYZEK Platform Backend", version="1.0.0")

class ProxyFixMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        forwarded_proto = request.headers.get("x-forwarded-proto")
        if forwarded_proto:
            request.scope["scheme"] = forwarded_proto
        return await call_next(request)

app.add_middleware(ProxyFixMiddleware)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

env_origins = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in env_origins.split(",") if o.strip()] or [ 
    "http://localhost",
    "http://localhost:3000",
    "https://ayzek.tr",       # <-- Bunu ekle
    "http://ayzek.tr",
    "https://api.ayzek.tr",  # <-- Bunu da ekle
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)

# Klasör Kontrolleri
os.makedirs("public/uploads", exist_ok=True)
app.mount("/public", StaticFiles(directory="public"), name="public")

logger = logging.getLogger("uvicorn.error")

@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})

# Router'ları Dahil Et
app.include_router(timeline_router)
app.include_router(events_router)
app.include_router(gallery_router)
app.include_router(journey_router)
app.include_router(suggestions_router)
app.include_router(community_router)
app.include_router(poster_router)
app.include_router(blog_router)
app.include_router(admin_auth_router)  
app.include_router(crew_router)
app.include_router(awards_router)

@app.get("/")
def root():
    return {"Fatih Emrullah": True}

