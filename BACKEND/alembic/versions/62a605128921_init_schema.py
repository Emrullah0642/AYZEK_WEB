"""init schema

Revision ID: 62a605128921
Revises:
Create Date: 2025-08-28 19:20:30.110786

Not: Bu migration daha önce boş bir veritabanında çalışmıyordu — sadece
'event_suggestions' tablosunu oluşturup mevcut olduğu varsayılan diğer
tablolara (team_members dahil) dokunuyordu, çünkü otomatik oluşturulduğu
sırada geliştirme veritabanı zaten doluydu. Prod bu revizyona zaten
'alembic stamp head' ile elle işaretlendiği için (tablolar
Base.metadata.create_all() ile oluşturuldu) bu dosyanın içeriğini
düzeltmek prod'u etkilemez — sadece sıfırdan kurulan yeni ortamlarda
(yerel geliştirme, CI, felaket kurtarma) 'alembic upgrade head'
komutunun artık gerçekten çalışmasını sağlar.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62a605128921'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('admins',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.Column('totp_secret', sa.String(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_admins_email'), 'admins', ['email'], unique=True)
    op.create_index(op.f('ix_admins_id'), 'admins', ['id'], unique=False)

    op.create_table('blogs',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('content', sa.Text(), nullable=False),
    sa.Column('author', sa.String(length=120), nullable=False),
    sa.Column('category', sa.String(length=80), nullable=False),
    sa.Column('cover_image', sa.String(length=400), nullable=True),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('preview', sa.Text(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_blogs_category'), 'blogs', ['category'], unique=False)
    op.create_index(op.f('ix_blogs_id'), 'blogs', ['id'], unique=False)
    op.create_index(op.f('ix_blogs_title'), 'blogs', ['title'], unique=False)

    op.create_table('community_applications',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('first_name', sa.String(length=100), nullable=False),
    sa.Column('last_name', sa.String(length=100), nullable=False),
    sa.Column('email', sa.String(length=150), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('interests', sa.ARRAY(sa.String()), nullable=False),
    sa.Column('heard_from', sa.String(length=100), nullable=False),
    sa.Column('motivation', sa.Text(), nullable=False),
    sa.Column('status', sa.Enum('pending', 'reviewed', 'accepted', 'rejected', name='applicationstatus'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_community_applications_email'), 'community_applications', ['email'], unique=False)
    op.create_index(op.f('ix_community_applications_id'), 'community_applications', ['id'], unique=False)

    op.create_table('crew_members',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('role', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('photo_url', sa.String(length=255), nullable=True),
    sa.Column('linkedin_url', sa.String(length=255), nullable=True),
    sa.Column('github_url', sa.String(length=255), nullable=True),
    sa.Column('category', sa.String(length=100), nullable=False),
    sa.Column('order_index', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crew_members_category'), 'crew_members', ['category'], unique=False)
    op.create_index(op.f('ix_crew_members_id'), 'crew_members', ['id'], unique=False)

    op.create_table('event_suggestions',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('contact', sa.String(length=200), nullable=False),
    sa.Column('status', sa.Enum('pending', 'reviewed', 'accepted', 'rejected', name='suggestionstatus'), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_event_suggestions_id'), 'event_suggestions', ['id'], unique=False)

    op.create_table('events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('slug', sa.String(length=200), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('cover_image_url', sa.Text(), nullable=False),
    sa.Column('start_at', sa.DateTime(), nullable=False),
    sa.Column('location', sa.String(length=200), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('registered', sa.Integer(), nullable=False),
    sa.Column('whatsapp_link', sa.Text(), nullable=False),
    sa.Column('tags', sa.String(length=200), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_events_slug'), 'events', ['slug'], unique=True)

    op.create_table('gallery_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('category', sa.String(length=50), nullable=False),
    sa.Column('image_url', sa.Text(), nullable=False),
    sa.Column('title', sa.String(length=150), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('date', sa.Date(), nullable=False),
    sa.Column('location', sa.String(length=120), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_gallery_events_id'), 'gallery_events', ['id'], unique=False)

    op.create_table('journey_people',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('year', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('role', sa.String(length=100), nullable=False),
    sa.Column('description', sa.String(length=255), nullable=False),
    sa.Column('photo_url', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_journey_people_id'), 'journey_people', ['id'], unique=False)
    op.create_index(op.f('ix_journey_people_year'), 'journey_people', ['year'], unique=False)

    op.create_table('posters',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(length=200), nullable=False),
    sa.Column('subtitle', sa.String(length=250), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('image_url', sa.String(length=500), nullable=True),
    sa.Column('order_index', sa.Integer(), nullable=False),
    sa.Column('is_active', sa.Boolean(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_posters_id'), 'posters', ['id'], unique=False)
    op.create_index(op.f('ix_posters_is_active'), 'posters', ['is_active'], unique=False)
    op.create_index(op.f('ix_posters_order_index'), 'posters', ['order_index'], unique=False)

    op.create_table('teams',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('slug', sa.String(length=100), nullable=False),
    sa.Column('project_name', sa.String(length=150), nullable=False),
    sa.Column('category', sa.String(length=100), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('is_featured', sa.Boolean(), nullable=True),
    sa.Column('photo_url', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('name'),
    sa.UniqueConstraint('slug')
    )
    op.create_index(op.f('ix_teams_id'), 'teams', ['id'], unique=False)

    op.create_table('timeline_events',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('title', sa.String(), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('category', sa.String(), nullable=False),
    sa.Column('date_label', sa.String(), nullable=False),
    sa.Column('image_url', sa.String(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_timeline_events_id'), 'timeline_events', ['id'], unique=False)

    op.create_table('team_members',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('role', sa.String(length=100), nullable=False),
    sa.Column('linkedin_url', sa.String(length=255), nullable=True),
    sa.Column('team_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_team_members_id'), 'team_members', ['id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_team_members_id'), table_name='team_members')
    op.drop_table('team_members')
    op.drop_index(op.f('ix_timeline_events_id'), table_name='timeline_events')
    op.drop_table('timeline_events')
    op.drop_index(op.f('ix_teams_id'), table_name='teams')
    op.drop_table('teams')
    op.drop_index(op.f('ix_posters_order_index'), table_name='posters')
    op.drop_index(op.f('ix_posters_is_active'), table_name='posters')
    op.drop_index(op.f('ix_posters_id'), table_name='posters')
    op.drop_table('posters')
    op.drop_index(op.f('ix_journey_people_year'), table_name='journey_people')
    op.drop_index(op.f('ix_journey_people_id'), table_name='journey_people')
    op.drop_table('journey_people')
    op.drop_index(op.f('ix_gallery_events_id'), table_name='gallery_events')
    op.drop_table('gallery_events')
    op.drop_index(op.f('ix_events_slug'), table_name='events')
    op.drop_table('events')
    op.drop_index(op.f('ix_event_suggestions_id'), table_name='event_suggestions')
    op.drop_table('event_suggestions')
    op.drop_index(op.f('ix_crew_members_id'), table_name='crew_members')
    op.drop_index(op.f('ix_crew_members_category'), table_name='crew_members')
    op.drop_table('crew_members')
    op.drop_index(op.f('ix_community_applications_id'), table_name='community_applications')
    op.drop_index(op.f('ix_community_applications_email'), table_name='community_applications')
    op.drop_table('community_applications')
    op.drop_index(op.f('ix_blogs_title'), table_name='blogs')
    op.drop_index(op.f('ix_blogs_id'), table_name='blogs')
    op.drop_index(op.f('ix_blogs_category'), table_name='blogs')
    op.drop_table('blogs')
    op.drop_index(op.f('ix_admins_id'), table_name='admins')
    op.drop_index(op.f('ix_admins_email'), table_name='admins')
    op.drop_table('admins')
