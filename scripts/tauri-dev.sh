#!/bin/bash
# Start Vite dev server and guarantee it's killed when this script exits,
# regardless of whether Tauri exits cleanly, crashes, or is Ctrl-C'd.

npm run dev &
DEV_PID=$!

trap "kill $DEV_PID 2>/dev/null" EXIT INT TERM

# GDK_BACKEND=x11                  → use XWayland instead of native Wayland (avoids protocol error 71)
# WEBKIT_DISABLE_DMABUF_RENDERER=1 → fixes WebKit crash causing blank window on some Linux setups
GDK_BACKEND=x11 WEBKIT_DISABLE_DMABUF_RENDERER=1 npx tauri dev
