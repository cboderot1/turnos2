"""FastAPI entrypoint for the turnos backend."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import Base, engine
from .api.routes import router

# Create tables in development; in production run migrations instead
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Turnos API", version="1.0.0")

# CORS disabled per requirement; uncomment to allow a specific origin when needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=[],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["health"])
def healthcheck():
    return {"status": "ok"}
