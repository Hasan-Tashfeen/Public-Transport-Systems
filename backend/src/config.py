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
