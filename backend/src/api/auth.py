"""Planner authorization dependency.

Editing endpoints are restricted to authorized planners. For the pilot this is a
single shared bearer token configured via the `PLANNER_TOKEN` environment
variable.
"""

from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from src.config import get_planner_token

_bearer = HTTPBearer(auto_error=False)

PlannerCredentials = Annotated[
    HTTPAuthorizationCredentials | None, Depends(_bearer)
]


def require_planner(
    credentials: PlannerCredentials,
) -> HTTPAuthorizationCredentials:
    token = get_planner_token()
    if credentials is None or credentials.credentials != token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Planner authorization required",
        )
    return credentials
