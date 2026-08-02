#!/usr/bin/env bash
#
# Starts GeoBrowser on a virtual screen and serves that screen over HTTP.
#
#   Xvfb        a screen that exists only in memory
#   GeoBrowser  the real Electron app, drawn onto that screen
#   x11vnc      exposes the screen on a local VNC port
#   websockify  wraps VNC in websockets and serves the noVNC web client
#
# The result is a single URL that works in any browser, including a phone's.

set -euo pipefail

SCREEN_SIZE="${SCREEN_SIZE:-1280x820x24}"
PORT="${PORT:-7860}"
DISPLAY="${DISPLAY:-:0}"
export DISPLAY

# Set VNC_PASSWORD to require a password before anyone can view or control the
# browser. Leave it unset only if the deployment itself is private.
VNC_PASSWORD="${VNC_PASSWORD:-}"

# Some container platforms mount the filesystem `nosuid`, which stops Chromium's
# sandbox helper from working. Set ELECTRON_NO_SANDBOX=1 there.
ELECTRON_NO_SANDBOX="${ELECTRON_NO_SANDBOX:-0}"

cleanup() {
  # Take the whole process group down together, so a crashed browser never leaves
  # an orphaned screen serving a frozen image.
  jobs -p | xargs -r kill 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[geobrowser] virtual screen ${SCREEN_SIZE} on ${DISPLAY}"
Xvfb "${DISPLAY}" -screen 0 "${SCREEN_SIZE}" -nolisten tcp -dpi 96 &

# Wait for the screen to accept connections instead of sleeping a fixed amount.
for _ in $(seq 1 60); do
  if xdpyinfo -display "${DISPLAY}" >/dev/null 2>&1; then break; fi
  sleep 0.25
done
xdpyinfo -display "${DISPLAY}" >/dev/null 2>&1 || {
  echo "[geobrowser] the virtual screen never came up" >&2
  exit 1
}

ELECTRON_FLAGS=(--disable-dev-shm-usage --disable-gpu)
if [ "${ELECTRON_NO_SANDBOX}" = "1" ]; then
  echo "[geobrowser] sandbox disabled by ELECTRON_NO_SANDBOX"
  ELECTRON_FLAGS+=(--no-sandbox)
fi

echo "[geobrowser] starting the app"
npx electron . "${ELECTRON_FLAGS[@]}" &
APP_PID=$!

# If Electron dies immediately it is almost always the sandbox helper, and the
# screen would otherwise sit there serving an empty desktop forever.
sleep 5
if ! kill -0 "${APP_PID}" 2>/dev/null; then
  echo "[geobrowser] app exited on startup; retrying without the sandbox" >&2
  npx electron . --disable-dev-shm-usage --disable-gpu --no-sandbox &
  APP_PID=$!
  sleep 5
  kill -0 "${APP_PID}" 2>/dev/null || {
    echo "[geobrowser] the app will not start — check the log above" >&2
    exit 1
  }
fi

echo "[geobrowser] exposing the screen"
if [ -n "${VNC_PASSWORD}" ]; then
  mkdir -p "${HOME}/.vnc"
  x11vnc -storepasswd "${VNC_PASSWORD}" "${HOME}/.vnc/passwd" >/dev/null 2>&1
  x11vnc -display "${DISPLAY}" -forever -shared -rfbauth "${HOME}/.vnc/passwd" \
         -rfbport 5900 -quiet -noxdamage &
else
  echo "[geobrowser] WARNING: no VNC_PASSWORD set — anyone with the URL can control this browser" >&2
  x11vnc -display "${DISPLAY}" -forever -shared -nopw -rfbport 5900 -quiet -noxdamage &
fi

echo "[geobrowser] serving on port ${PORT}"
exec websockify --web=/usr/share/novnc "${PORT}" localhost:5900
