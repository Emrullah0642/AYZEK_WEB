"""Add documented awards and replace the Aksaray gallery cover.

Revision ID: 7c93d2a4e0b1
Revises: 2d7a4f6c93e1
"""

import json
from datetime import date, datetime
from pathlib import Path

from alembic import op
import sqlalchemy as sa


revision = "7c93d2a4e0b1"
down_revision = "2d7a4f6c93e1"
branch_labels = None
depends_on = None

DATA_FILE = Path(__file__).resolve().parents[2] / "awards_more_seed.json"
BACKEND_DIR = Path(__file__).resolve().parents[2]

awards = sa.table(
    "awards",
    sa.column("id", sa.Integer),
    sa.column("title", sa.String(200)),
    sa.column("description", sa.Text),
    sa.column("image_url", sa.String(500)),
    sa.column("location", sa.String(150)),
    sa.column("date", sa.Date),
    sa.column("order_index", sa.Integer),
    sa.column("created_at", sa.DateTime),
)

gallery_events = sa.table(
    "gallery_events",
    sa.column("title", sa.String(150)),
    sa.column("image_url", sa.Text),
)

OLD_AKSARAY_COVER = "/public/gallery/seed-04.jpg"
NEW_AKSARAY_COVER = "/public/gallery/aksaray-arge-2025.jpg"


def _rows():
    rows = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for row in rows:
        image = BACKEND_DIR / row["image_url"].lstrip("/")
        if not image.is_file():
            raise FileNotFoundError(f"Award photo is missing: {image}")
    return rows


def upgrade():
    gallery_image = BACKEND_DIR / NEW_AKSARAY_COVER.lstrip("/")
    if not gallery_image.is_file():
        raise FileNotFoundError(f"Gallery cover is missing: {gallery_image}")

    connection = op.get_bind()
    connection.execute(
        gallery_events.update()
        .where(
            gallery_events.c.title == "Aksaray Ar-Ge Proje Pazarı",
            gallery_events.c.image_url == OLD_AKSARAY_COVER,
        )
        .values(image_url=NEW_AKSARAY_COVER)
    )

    for row in _rows():
        exists = connection.execute(
            sa.select(awards.c.id)
            .where(awards.c.image_url == row["image_url"])
            .limit(1)
        ).scalar()
        if exists is not None:
            continue
        connection.execute(
            awards.insert().values(
                title=row["title"],
                description=row["description"],
                image_url=row["image_url"],
                location=row["location"],
                date=date.fromisoformat(row["date"]) if row["date"] else None,
                order_index=row["order_index"],
                created_at=datetime.utcnow(),
            )
        )


def downgrade():
    connection = op.get_bind()
    for row in _rows():
        connection.execute(
            awards.delete().where(
                awards.c.title == row["title"],
                awards.c.image_url == row["image_url"],
            )
        )

    connection.execute(
        gallery_events.update()
        .where(
            gallery_events.c.title == "Aksaray Ar-Ge Proje Pazarı",
            gallery_events.c.image_url == NEW_AKSARAY_COVER,
        )
        .values(image_url=OLD_AKSARAY_COVER)
    )
