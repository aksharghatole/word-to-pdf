"""FastAPI application entry point."""

from fastapi import FastAPI

app = FastAPI(
    title="Word to PDF",
    description="Convert Word documents to PDF. Self-hosted, privacy-first.",
    version="0.1.0",
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    """Liveness check. Returns OK if the app is running."""
    return {"status": "ok"}
