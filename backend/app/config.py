"""Application configuration and constants."""

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
OUTPUT_DIR = BASE_DIR / "outputs"

UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# 20 MB — plenty for documents, small enough to keep the server safe.
MAX_FILE_SIZE = 20 * 1024 * 1024

# Formats LibreOffice can convert to PDF.
ALLOWED_EXTENSIONS = {".docx", ".doc", ".odt", ".rtf", ".txt"}
