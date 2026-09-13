"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-09-13
"""

from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    from src import models  # noqa: F401
    from src.models.base import Base

    Base.metadata.create_all(bind=op.get_bind())


def downgrade() -> None:
    from src.models.base import Base

    Base.metadata.drop_all(bind=op.get_bind())
