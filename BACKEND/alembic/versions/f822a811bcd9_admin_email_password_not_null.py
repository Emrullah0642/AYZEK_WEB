"""admin email/password not null + length bound

Revision ID: f822a811bcd9
Revises: 62a605128921
Create Date: 2026-09-23 00:00:00.000000

Admin.email/password kolonlarında uzunluk sınırı yoktu ve NOT NULL
constraint'i eksikti — modelin geri kalanındaki String(n) + nullable=False
konvansiyonuna aykırıydı. Mevcut tek admin satırı zaten her iki alanı da
dolu tuttuğu için bu güvenli bir değişikliktir.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f822a811bcd9'
down_revision: Union[str, Sequence[str], None] = '62a605128921'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column('admins', 'email',
        existing_type=sa.String(),
        type_=sa.String(length=255),
        nullable=False)
    op.alter_column('admins', 'password',
        existing_type=sa.String(),
        type_=sa.String(length=255),
        nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column('admins', 'password',
        existing_type=sa.String(length=255),
        type_=sa.String(),
        nullable=True)
    op.alter_column('admins', 'email',
        existing_type=sa.String(length=255),
        type_=sa.String(),
        nullable=True)
