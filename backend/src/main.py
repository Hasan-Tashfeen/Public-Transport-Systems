"""Application factory and entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src import db as db_module
from src.api import places, routes, search, stops
from src.config import get_cors_origins, is_seed_disabled
from src.seed.loader import seed_if_empty


def _seed() -> None:
    if is_seed_disabled() or db_module.SessionLocal is None:
        return
    session = db_module.SessionLocal()
    try:
        seed_if_empty(session)
    finally:
        session.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_module.init_db()
    _seed()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Karachi Transit Map API",
        version="0.2.0",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=get_cors_origins(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(routes.router)
    app.include_router(stops.router)
    app.include_router(search.router)
    app.include_router(places.router)

    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
