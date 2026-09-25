"""Seed selected award moments from the AYZEK photo archive.

Revision ID: 2d7a4f6c93e1
Revises: 8b6e3f2c19a0
"""

import json
from datetime import date, datetime
from pathlib import Path

from alembic import op
import sqlalchemy as sa


revision = "2d7a4f6c93e1"
down_revision = "8b6e3f2c19a0"
branch_labels = None
depends_on = None

DATA_FILE = Path(__file__).resolve().parents[2] / "awards_seed.json"

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


def _rows():
    rows = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    for row in rows:
        image = Path(__file__).resolve().parents[2] / row["image_url"].lstrip("/")
        if not image.is_file():
            raise FileNotFoundError(f"Award photo is missing: {image}")
    return rows


def upgrade():
    connection = op.get_bind()
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
