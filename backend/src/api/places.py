"""Place suggestion API endpoint for the Karachi stop editor."""

from typing import Annotated

from fastapi import APIRouter, Query

from src.api import schemas
from src.services import place_service

router = APIRouter(prefix="/places", tags=["places"])


@router.get("", response_model=list[schemas.PlaceSuggestion])
def list_places(
    q: Annotated[str, Query(min_length=2)],
    limit: Annotated[int, Query(ge=1, le=10)] = 5,
):
    return place_service.search(q, limit)
