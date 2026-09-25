"""Seed selected gallery events and their bundled cover images.

Revision ID: 8b6e3f2c19a0
Revises: 9da16d5bf7fa
"""

import json
from datetime import date
from pathlib import Path

from alembic import op
import sqlalchemy as sa


revision = "8b6e3f2c19a0"
down_revision = "9da16d5bf7fa"
branch_labels = None
depends_on = None

DATA_FILE = Path(__file__).resolve().parents[2] / "gallery_seed.json"

gallery_events = sa.table(
    "gallery_events",
    sa.column("id", sa.Integer),
    sa.column("category", sa.String(50)),
    sa.column("image_url", sa.Text),
    sa.column("title", sa.String(150)),
    sa.column("description", sa.Text),
    sa.column("date", sa.Date),
    sa.column("location", sa.String(120)),
)


def _rows():
    rows = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for row in rows:
        image = Path(__file__).resolve().parents[2] / "public" / "gallery" / Path(row["image_url"]).name
        if not image.is_file():
            raise FileNotFoundError(f"Gallery cover is missing: {image}")
    return rows


def upgrade():
    connection = op.get_bind()
    for row in _rows():
        exists = connection.execute(
            sa.select(gallery_events.c.id)
            .where(gallery_events.c.title == row["title"])
            .limit(1)
        ).scalar()
        if exists is not None:
            continue
        connection.execute(
            gallery_events.insert().values(
                **{**row, "date": date.fromisoformat(row["date"])}
            )
        )


def downgrade():
    connection = op.get_bind()
    for row in _rows():
        connection.execute(
            gallery_events.delete().where(
                gallery_events.c.title == row["title"],
                gallery_events.c.image_url == row["image_url"],
            )
        )
