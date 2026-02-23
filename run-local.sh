#!/usr/bin/env bash
# Run backend + frontend locally and show logs. Stop with Ctrl+C.
# Backend: http://localhost:5000  (needs MySQL for /api/products etc.)
# Frontend: http://localhost:8080 or 8081 (use dev:safe to avoid file watcher crash)

set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_LOG="/tmp/whitelight-backend.log"
FRONTEND_LOG="/tmp/whitelight-frontend.log"

echo "Starting backend (log: $BACKEND_LOG)..."
cd "$ROOT/whitelight-backend"
node start-with-env.js >> "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "Starting frontend with dev:safe (log: $FRONTEND_LOG)..."
cd "$ROOT/whitelight"
CHOKIDAR_USEPOLLING=1 npm run dev >> "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

cleanup() {
  echo "Stopping..."
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

echo "Backend PID: $BACKEND_PID  Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:5000  Frontend: http://localhost:8080 (or 8081)"
echo "Watching both logs (Ctrl+C to stop)..."
echo "---"
tail -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null || tail -f "$BACKEND_LOG"
