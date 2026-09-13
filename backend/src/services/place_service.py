"""Karachi place search backed by an OpenStreetMap geocoder (Photon).

Results are filtered to the Karachi bounding box, cached in memory, and returned as
a possibly empty list so that an upstream outage never breaks the planner flow.
"""

import time

import httpx

from src.api import schemas
from src.config import (
    get_geocoder_url,
    get_geocoder_user_agent,
    get_karachi_bbox,
    get_karachi_center,
)

MIN_QUERY_LENGTH = 2
MAX_LIMIT = 10
CACHE_TTL_SECONDS = 24 * 60 * 60
REQUEST_TIMEOUT_SECONDS = 5.0

_cache: dict[tuple[str, int], tuple[float, list[schemas.PlaceSuggestion]]] = {}


def _within_bbox(
    lat: float, lng: float, bbox: tuple[float, float, float, float]
) -> bool:
    min_lon, min_lat, max_lon, max_lat = bbox
    return min_lat <= lat <= max_lat and min_lon <= lng <= max_lon


def _area(props: dict) -> str | None:
    parts: list[str] = []
    for key in ("district", "city", "state"):
        value = props.get(key)
        if value and str(value) not in parts:
            parts.append(str(value))
    return ", ".join(parts) if parts else None


def _fetch(query: str, limit: int) -> list[schemas.PlaceSuggestion]:
    bbox = get_karachi_bbox()
    center_lat, center_lng = get_karachi_center()
    min_lon, min_lat, max_lon, max_lat = bbox
    params: dict[str, str | int | float] = {
        "q": query,
        "limit": limit,
        "lang": "en",
        "lat": center_lat,
        "lon": center_lng,
        "bbox": f"{min_lon},{min_lat},{max_lon},{max_lat}",
    }
    headers = {"User-Agent": get_geocoder_user_agent()}
    try:
        response = httpx.get(
            f"{get_geocoder_url().rstrip('/')}/api/",
            params=params,
            headers=headers,
            timeout=REQUEST_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        features = response.json().get("features", [])
    except (httpx.HTTPError, ValueError):
        return []

    results: list[schemas.PlaceSuggestion] = []
    for feature in features:
        coordinates = (feature.get("geometry") or {}).get("coordinates") or []
        if len(coordinates) < 2:
            continue
        feature_lng, feature_lat = float(coordinates[0]), float(coordinates[1])
        if not _within_bbox(feature_lat, feature_lng, bbox):
            continue
        props = feature.get("properties") or {}
        name = props.get("name") or props.get("street") or query
        results.append(
            schemas.PlaceSuggestion(
                name=str(name),
                area=_area(props),
                lat=feature_lat,
                lng=feature_lng,
            )
        )
        if len(results) >= limit:
            break
    return results


def search(query: str, limit: int = 5) -> list[schemas.PlaceSuggestion]:
    """Return Karachi place suggestions for a partially typed name."""
    cleaned = query.strip()
    if len(cleaned) < MIN_QUERY_LENGTH:
        return []
    bounded_limit = max(1, min(limit, MAX_LIMIT))
    key = (cleaned.lower(), bounded_limit)
    now = time.time()
    cached = _cache.get(key)
    if cached is not None and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]
    results = _fetch(cleaned, bounded_limit)
    _cache[key] = (now, results)
    return results
