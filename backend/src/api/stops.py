"""Stop API endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.api import schemas
from src.api.auth import require_planner
from src.db import get_db
from src.services import stop_service
from src.services.errors import NotFoundError

router = APIRouter(prefix="/stops", tags=["stops"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("", response_model=list[schemas.Stop])
def list_stops(db: DbSession):
    return stop_service.list_stops(db)


@router.post(
    "",
    response_model=schemas.Stop,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_planner)],
)
def create_stop(payload: schemas.StopInput, db: DbSession):
    return stop_service.create_stop(db, payload)


@router.get("/{stop_id}", response_model=schemas.StopDetail)
def get_stop(stop_id: str, db: DbSession):
    try:
        return stop_service.get_stop(db, stop_id)
    except NotFoundError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
