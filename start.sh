#!/usr/bin/env bash
# Starts backend (port 8000) and frontend (port 5173) together on macOS/Linux.
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

cd "$ROOT/backend"
[ -d .venv ] || python3 -m venv .venv
. .venv/bin/activate
pip install -q -r requirements.txt
uvicorn app.main:app --reload --port 8000 &
BACK=$!

cd "$ROOT/frontend"
[ -d node_modules ] || npm install
trap 'kill $BACK' EXIT
npm run dev
