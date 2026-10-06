# word-to-pdf

Convert Word documents to PDF. Self-hosted, privacy-first, Docker-ready.

[![Release](https://img.shields.io/github/v/release/aksharghatole/word-to-pdf)](https://github.com/aksharghatole/word-to-pdf/releases)
[![CI](https://github.com/aksharghatole/word-to-pdf/actions/workflows/ci.yml/badge.svg)](https://github.com/aksharghatole/word-to-pdf/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**→ Live demo:** https://word-to-pdf-b4dr.onrender.com/app/

## What it does

Drop a `.docx` (or `.doc`, `.odt`, `.rtf`, `.txt`) into the browser, get a PDF back. Conversion runs in a FastAPI service that shells out to LibreOffice headless — no external APIs, no tracking, no data leaving the container.

Run it on your own machine for full privacy, or use the hosted demo above.

## Quick start (Docker)

```bash
git clone https://github.com/aksharghatole/word-to-pdf.git
cd word-to-pdf
docker compose up --build
```

Open **http://localhost:8000**.

Requirements: Docker only. LibreOffice is bundled inside the image.

## Local development (without Docker)

Requires Python 3.12 and LibreOffice (`soffice` on PATH).

```bash
pip install -r backend/requirements-dev.txt
uvicorn app.main:app --app-dir backend --reload --port 8000
```

Open **http://localhost:8000**.

### Tests

```bash
python -m pytest -v
```

### Lint

```bash
ruff check backend tests
ruff format --check backend tests
```

## API

`POST /api/convert` — multipart form, field `file`. Returns `application/pdf`.

```bash
curl -F "file=@document.docx" http://localhost:8000/api/convert -o document.pdf
```

Interactive docs at **/docs**.

### Endpoints

| Method | Path           | Description                      |
|--------|----------------|----------------------------------|
| GET    | `/`            | Redirects to `/app/`             |
| GET    | `/app/`        | Web UI                           |
| GET    | `/api/health`  | Liveness check                   |
| POST   | `/api/convert` | Upload a document, receive a PDF |
| GET    | `/docs`        | Swagger UI                       |

## Supported formats

`.docx`, `.doc`, `.odt`, `.rtf`, `.txt` — up to 20 MB per file.

## Stack

- **Backend:** FastAPI, Python 3.12, LibreOffice headless
- **Frontend:** Plain HTML / CSS / JS — no build step, no framework
- **Container:** `python:3.12-slim` + `libreoffice-writer`
- **CI:** GitHub Actions (ruff + pytest)
- **Hosting:** Render (free tier)

## Roadmap

**Shipped in v0.1**
- [x] Backend conversion (LibreOffice headless)
- [x] `POST /api/convert`
- [x] Drag-and-drop web UI
- [x] Progress + result states in UI
- [x] Docker one-command deploy
- [x] CI (lint + tests)
- [x] Community scaffolding
- [x] Live hosted demo

**Next up**
- [ ] Batch conversion
- [ ] PDF → Word (reverse)
- [ ] Client-side privacy mode
- [ ] CLI + GitHub Action

See the [Roadmap board](https://github.com/users/aksharghatole/projects/1) for details.

## Project layout

```
backend/
  app/
    main.py       # FastAPI app + routes
    converter.py  # LibreOffice conversion
    config.py     # constants, paths, limits
  Dockerfile
  requirements.txt
  requirements-dev.txt
frontend/
  index.html
  style.css
  app.js
tests/
  test_api.py
  test_converter.py
docker-compose.yml
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Bug reports and feature requests use the [issue templates](.github/ISSUE_TEMPLATE).

## License

MIT — see [LICENSE](./LICENSE).