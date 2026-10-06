"""FastAPI application entry point."""

import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from .config import ALLOWED_EXTENSIONS, MAX_FILE_SIZE, UPLOAD_DIR
from .converter import ConversionError, convert_to_pdf

app = FastAPI(
    title="Word to PDF",
    description="Convert Word documents to PDF. Self-hosted, privacy-first.",
    version="0.1.0",
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    """Liveness check. Returns OK if the app is running."""
    return {"status": "ok"}


@app.post("/api/convert")
async def convert(file: UploadFile = File(...)) -> FileResponse:
    """Convert an uploaded document to PDF and return it."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported file type '{ext}'. "
                f"Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Max {MAX_FILE_SIZE // (1024 * 1024)} MB.",
        )
    if not contents:
        raise HTTPException(status_code=400, detail="File is empty.")

    upload_id = uuid.uuid4().hex
    input_path = UPLOAD_DIR / f"{upload_id}{ext}"
    input_path.write_bytes(contents)

    try:
        pdf_path = await convert_to_pdf(input_path)
    except ConversionError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    finally:
        input_path.unlink(missing_ok=True)

    download_name = Path(file.filename).with_suffix(".pdf").name
    return FileResponse(
        pdf_path,
        media_type="application/pdf",
        filename=download_name,
    )
