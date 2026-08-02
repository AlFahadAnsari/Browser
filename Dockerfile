# GeoBrowser, hosted.
#
# Runs the real Electron app on a server inside a virtual screen, and streams that
# screen to any web browser. You open one URL — on an iPhone, an Android phone, a
# MacBook, any machine — and you are using GeoBrowser. Nothing to install.
#
# Port 7860 is what Hugging Face Spaces expects; the image runs anywhere that can
# run a container.

FROM node:22-bookworm-slim

ENV DEBIAN_FRONTEND=noninteractive

# Electron's runtime libraries, a virtual screen (Xvfb), a VNC server, and noVNC —
# the piece that turns VNC into something a web browser can display.
RUN apt-get update && apt-get install -y --no-install-recommends \
      xvfb x11vnc x11-utils novnc websockify \
      fonts-liberation fonts-noto-color-emoji fonts-indic \
      libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
      libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
      libcairo2 libasound2 libatspi2.0-0 libgtk-3-0 libx11-xcb1 libxcb-dri3-0 \
      ca-certificates dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Opening the site should land straight in the browser, not on a VNC connect screen.
RUN printf '%s\n' \
      '<!doctype html><meta charset="utf-8"><title>GeoBrowser</title>' \
      '<meta name="viewport" content="width=device-width,initial-scale=1">' \
      '<script>location.replace("vnc.html?autoconnect=true&resize=scale&reconnect=true&show_dot=true")</script>' \
      > /usr/share/novnc/index.html

WORKDIR /app

# Dependencies first, so this layer is cached between rebuilds.
COPY package.json package-lock.json ./
RUN npm ci

# Build exactly as a desktop release is built.
COPY . .
RUN npm run build

# Chromium's sandbox helper must be setuid root to work. Doing this at build time
# means the app can keep its sandbox instead of being launched with --no-sandbox.
RUN chown root:root node_modules/electron/dist/chrome-sandbox \
    && chmod 4755 node_modules/electron/dist/chrome-sandbox \
    && chmod +x scripts/serve.sh

# The official Node images already ship an unprivileged `node` user at UID 1000, so
# creating another user at that UID fails the build. Reuse the one that exists.
RUN chown -R node:node /app
USER node

ENV DISPLAY=:0 \
    SCREEN_SIZE=1280x820x24 \
    PORT=7860 \
    TZ=Asia/Kolkata \
    ELECTRON_DISABLE_SECURITY_WARNINGS=1

EXPOSE 7860

ENTRYPOINT ["dumb-init", "--"]
CMD ["./scripts/serve.sh"]
