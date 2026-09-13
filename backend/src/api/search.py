"""Search API endpoint."""

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from src.api import schemas
from src.db import get_db
from src.services import search_service

router = APIRouter(tags=["search"])

DbSession = Annotated[Session, Depends(get_db)]


@router.get("/search", response_model=schemas.SearchResults)
def search(q: Annotated[str, Query(min_length=1)], db: DbSession):
    return search_service.search(db, q)
