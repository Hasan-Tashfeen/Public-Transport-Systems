"""Application factory and entrypoint."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import routes, search, stops
from src.config import get_cors_origins
from src.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="City Public Transport Route Map API",
        version="0.1.0",
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

    @app.get("/health", tags=["health"])
    def health() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
