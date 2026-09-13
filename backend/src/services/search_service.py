"""Search business logic: find routes and stops by name or number."""

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from src.api import schemas
from src.models.entities import Route, Stop


def search(db: Session, query: str) -> schemas.SearchResults:
    pattern = f"%{query}%"

    routes = db.execute(
        select(Route)
        .where(
            or_(
                Route.number.ilike(pattern),
                Route.name.ilike(pattern),
            )
        )
        .order_by(Route.number)
    ).scalars().all()

    stops = db.execute(
        select(Stop).where(Stop.name.ilike(pattern)).order_by(Stop.name)
    ).scalars().all()

    return schemas.SearchResults(
        routes=[schemas.Route.model_validate(r) for r in routes],
        stops=[schemas.Stop.model_validate(s) for s in stops],
    )
