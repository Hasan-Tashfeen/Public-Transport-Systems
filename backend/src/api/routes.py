"""Route API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api import schemas
from src.api.auth import require_planner
from src.db import get_db
from src.models.entities import TransportMode
from src.services import route_service
from src.services.errors import NotFoundError, ValidationError

router = APIRouter(prefix="/routes", tags=["routes"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[schemas.RouteDetail])
def list_routes(db: DbSession, mode: TransportMode | None = None):
    return route_service.list_routes(db, mode)


@router.post(
    "",
    response_model=schemas.RouteDetail,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_planner)],
)
def create_route(payload: schemas.RouteInput, db: DbSession):
    try:
        return route_service.create_route(db, payload)
    except (NotFoundError, ValidationError) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("/{route_id}", response_model=schemas.RouteDetail)
def get_route(route_id: str, db: DbSession):
    try:
        return route_service.get_route(db, route_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.patch(
    "/{route_id}",
    response_model=schemas.RouteDetail,
    dependencies=[Depends(require_planner)],
)
def update_route(route_id: str, payload: schemas.RouteInput, db: DbSession):
    try:
        return route_service.update_route(db, route_id, payload)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except ValidationError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.delete(
    "/{route_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_planner)],
)
def delete_route(route_id: str, db: DbSession):
    try:
        route_service.delete_route(db, route_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
