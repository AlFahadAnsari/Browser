# Image for GitHub Codespaces / VS Code Dev Containers.
#
# Unlike the production Dockerfile at the repo root, this one does NOT bake the app
# in: Codespaces mounts your working copy at /workspaces/<repo>, which would shadow
# anything built into /app. It installs only the system libraries, and the app is
# built in the workspace by postCreateCommand.

FROM mcr.microsoft.com/devcontainers/javascript-node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

# Chromium's runtime libraries, a virtual screen (Xvfb), a VNC server, and noVNC —
# the piece that lets a web browser display that screen.
RUN apt-get update && apt-get install -y --no-install-recommends \
      xvfb x11vnc x11-utils novnc websockify \
      fonts-liberation fonts-noto-color-emoji fonts-indic \
      libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
      libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
      libcairo2 libasound2 libatspi2.0-0 libgtk-3-0 libx11-xcb1 libxcb-dri3-0 \
      dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Opening the forwarded port should land straight in the browser, not on a VNC
# connect screen.
RUN printf '%s\n' \
      '<!doctype html><meta charset="utf-8"><title>GeoBrowser</title>' \
      '<meta name="viewport" content="width=device-width,initial-scale=1">' \
      '<script>location.replace("vnc.html?autoconnect=true&resize=scale&reconnect=true&show_dot=true")</script>' \
      > /usr/share/novnc/index.html

ENV DISPLAY=:0 \
    SCREEN_SIZE=1280x820x24 \
    PORT=7860 \
    TZ=Asia/Kolkata \
    ELECTRON_DISABLE_SECURITY_WARNINGS=1
