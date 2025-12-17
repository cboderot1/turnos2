"""Convenience entrypoint so `uvicorn main:app` serves the real API."""
from app.main import app  # noqa: F401
