# word-to-pdf

Convert Word documents to PDF. Self-hosted, privacy-first, Docker-ready.

[![CI](https://github.com/aksharghatole/word-to-pdf/actions/workflows/ci.yml/badge.svg)](https://github.com/aksharghatole/word-to-pdf/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> 🚧 **Status:** Pre-alpha. Building toward `v0.1 — MVP`.
>
> Track progress on the [Roadmap board](https://github.com/users/aksharghatole/projects/1).

## Demo

![Demo](docs/demo.gif)

_(GIF placeholder — recording coming soon.)_

## What it does

Drop a `.docx` (or `.doc`, `.odt`, `.rtf`, `.txt`) into the browser, get a PDF back. Runs entirely on your own machine — no external services, no tracking, no uploads to someone else's server.

## Quick start (Docker)

```bash
git clone https://github.com/aksharghatole/word-to-pdf.git
cd word-to-pdf
docker compose up --build