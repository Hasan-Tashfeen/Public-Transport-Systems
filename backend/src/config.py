"""Environment-driven configuration.

No secrets are hardcoded; values come from environment variables with safe
development defaults for the pilot.
"""

import os


def get_database_url() -> str:
    return os.getenv("DATABASE_URL", "sqlite:///./data/app.db")


def get_cors_origins() -> list[str]:
    raw = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def get_planner_token() -> str:
    return os.getenv("PLANNER_TOKEN", "dev-token")


def get_karachi_center() -> tuple[float, float]:
    raw = os.getenv("KARACHI_CENTER", "24.8607,67.0011")
    lat, lng = (part.strip() for part in raw.split(",", 1))
    return float(lat), float(lng)


def get_karachi_bbox() -> tuple[float, float, float, float]:
    """Return (min_lon, min_lat, max_lon, max_lat) for the Karachi search area."""
    raw = os.getenv("KARACHI_BBOX", "66.75,24.70,67.45,25.20")
    min_lon, min_lat, max_lon, max_lat = (part.strip() for part in raw.split(","))
    return float(min_lon), float(min_lat), float(max_lon), float(max_lat)


def get_geocoder_url() -> str:
    return os.getenv("GEOCODER_URL", "https://photon.komoot.io")


def get_geocoder_user_agent() -> str:
    return os.getenv("GEOCODER_USER_AGENT", "karachi-transit-map/0.2 (pilot)")


def is_seed_disabled() -> bool:
    return os.getenv("SEED_DISABLED", "").lower() in {"1", "true", "yes"}
