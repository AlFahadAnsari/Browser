---
title: GeoBrowser
emoji: 📍
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# GeoBrowser

A lightweight Electron desktop application that opens websites in Chromium and always
reports one permanently configured geolocation.

It is **not** a web browser. There are no tabs, bookmarks, downloads, extensions, profiles,
multiple windows or browser settings — just an address bar, a website area and a status bar.

## The built-in location

Every website that asks for the browser's position receives these coordinates automatically,
with no prompt and no user action:

| Field     | Value        |
| --------- | ------------ |
| Name      | Zoo Media    |
| Area      | Prabhadevi   |
| City      | Mumbai       |
| State     | Maharashtra  |
| Country   | India        |
| Latitude  | 19.0060953   |
| Longitude | 72.8240398   |
| Accuracy  | 20 m         |
| Timezone  | Asia/Kolkata |
| Language  | en-IN        |
| Locale    | en-IN        |

The values live in exactly one file — [`src/config/location.ts`](src/config/location.ts).
Change them there and rebuild; nothing else needs to be touched.

### How it is applied

Four independent layers, so a site sees the configured place even if one of them is
unavailable:

1. **Process** — `TZ` and Chromium's `--lang` are set before the engine boots
   ([`src/electron/geo/geolocation.ts`](src/electron/geo/geolocation.ts)).
2. **Session** — geolocation permission requests and checks are auto-granted, every other
   permission is denied, and `Accept-Language` is pinned
   ([`src/electron/browser/websiteSession.ts`](src/electron/browser/websiteSession.ts)).
3. **Page** — Chromium's native emulation via CDP: `Emulation.setGeolocationOverride`,
   `setTimezoneOverride` and `setLocaleOverride`. This is what `navigator.geolocation`
   actually reads.
4. **Safety net** — the website preload patches `navigator.geolocation`,
   `navigator.language(s)`, `permissions.query`, and every `Intl` constructor and
   `toLocale*` method in the page's main world
   ([`src/electron/websitePreload.ts`](src/electron/websitePreload.ts)). This layer is not
   optional: a cross-site navigation spawns a fresh renderer process that can start parsing
   before the asynchronous CDP locale override lands, and the preload always runs first.

Verified end to end: a page loaded in the app reports
`{"latitude":19.0060953,"longitude":72.8240398,"accuracy":20}`, `Asia/Calcutta`
(GMT+0530, the canonical alias of `Asia/Kolkata`), `en-IN`, and formats `1234567.89` as
`12,34,567.89`.

## Features

- **Address bar** — accepts `google.com`, `https://google.com`, `amazon.in/deals`,
  `localhost:3000`; anything that is not address-like (`weather`, `chatgpt`) becomes a
  Google search.
- **Navigation** — Go, Back, Forward, Refresh (turns into Stop while loading).
- **History** — every visit is saved automatically with title, URL, date and time. Search,
  delete one entry, clear everything. Persisted with `electron-store`, no database.
- **Home** — logo, address bar, recent history.
- **Settings** — clear history, light/dark mode. Nothing else.
- **Status bar** — the current URL, the loading indicator and the active location.

## Tech stack

Electron 43 · React 19 · TypeScript (strict) · Vite (electron-vite) · Tailwind CSS 4 ·
React Router 7 · Framer Motion · React Icons · electron-store.

All free, no paid or Google APIs, no backend. Everything works offline except loading the
websites themselves.

## Architecture

```
src/
├── app/          App root, hash router, route table
├── components/   Shared UI (AppShell, TopBar, AddressBar, StatusBar, Logo, ui/)
├── config/       location.ts — the single source of truth for the geolocation
├── electron/     Main process
│   ├── browser/  WebContentsView lifecycle + the browsing session
│   ├── geo/      Geolocation / timezone / locale emulation
│   ├── ipc/      Typed, sender-checked IPC handlers
│   ├── store/    electron-store repositories (history, settings)
│   ├── windows/  The single application window
│   ├── main.ts
│   ├── preload.ts         Bridge for the UI (contextBridge only, no ipcRenderer leak)
│   └── websitePreload.ts  Geolocation safety net for web content (no IPC surface)
├── features/     browser/ · history/ · settings/
├── hooks/        useBrowser, useHistory, useTheme, useWebsiteViewport, useStore
├── services/     Thin wrappers over the preload bridge
├── store/        ~20-line observable stores consumed with useSyncExternalStore
├── styles/       Tailwind theme tokens (light/dark CSS variables)
├── types/        Shared contracts (api, browser, history, settings, ipc)
└── utils/        URL resolution, date/time formatting, className helper
```

The website is rendered by a single `WebContentsView` layered over the React chrome.
The renderer measures the empty placeholder in [`BrowserPage`](src/features/browser/BrowserPage.tsx)
with a `ResizeObserver` and forwards the rectangle to the main process, which positions the
native view exactly on top of it. The view is hidden on the Home, History and Settings routes.

## Security

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` everywhere.
- `ipcRenderer` is never exposed; the renderer can only call a fixed, typed API surface on a
  fixed set of channels, and every handler rejects calls that did not come from the UI.
- Websites run in their own persistent partition, isolated from the application session.
- `webview` attachment is blocked, `target="_blank"` loads in place, and non-web schemes are
  handed to the operating system instead of being loaded.
- Every permission except geolocation is denied; device permissions are denied outright.
- The UI is served under a Content-Security-Policy and is not allowed to navigate away.

## Download

Installers for **macOS** (Apple Silicon and Intel) and **Windows** are published on the
[Releases page](https://github.com/AlFahadAnsari/Browser/releases/latest).

They are unsigned, so the first launch needs one extra click: on macOS right-click the app
and choose **Open**; on Windows choose **More info → Run anyway**.

Linux is not published. The AppImage and `.deb` targets do not package cleanly on the CI
runner, and an installer that does not work is worse than none — `npm run dist:linux` still
works if you are building on a Linux machine yourself.

## Hosting it (use it without installing anything)

The app can also run on a server and stream its screen to any web browser, so you can use
it from a phone or a machine that isn't yours. `Dockerfile` + `scripts/serve.sh` build that
image: Xvfb provides a virtual screen, the real Electron app draws onto it, and noVNC serves
that screen over HTTP on port 7860.

```bash
docker build -t geobrowser .
docker run -p 7860:7860 -e VNC_PASSWORD=choose-something geobrowser
# then open http://localhost:7860
```

Where to run it — including a free option that needs no credit card — is covered in
[deploy/HOSTING.md](deploy/HOSTING.md).

One trade-off to know: the coordinates stay Prabhadevi, but the _IP_ becomes the server's.
Running the desktop app on your own machine keeps the two consistent; hosting it does not.

## Releasing

`.github/workflows/release.yml` builds macOS and Windows and publishes the installers
whenever a version tag is pushed:

```bash
npm version patch          # or minor / major
git push --follow-tags
```

Running the workflow manually (`workflow_dispatch`) builds every platform as a check
without creating a release.

`docs/index.html` is the download page. It is a single self-contained file and can be served
by GitHub Pages (Settings → Pages → Source: `main` / `docs`) or by Vercel — `vercel.json`
points Vercel at `docs/` and skips the build, since there is nothing here for a web host to
run.

> **This app cannot be deployed as a website.** The UI talks to the Electron main process
> through a preload bridge, the website area is a native `WebContentsView`, and the
> geolocation override lives in the main process. In a browser tab none of that exists — a
> page is not allowed to frame `google.com`, let alone change the location it reports. Only
> the download page above is web-hostable.

## Getting started

```bash
npm install
npm run dev        # hot-reloading development build
```

Other scripts:

```bash
npm run build      # typecheck + production bundles into out/
npm start          # preview the production build
npm run typecheck  # strict TypeScript, main + renderer
npm run lint       # ESLint, zero warnings allowed
npm run format     # Prettier
npm run dist       # package with electron-builder into release/
```

The production bundle is ~476 KB in total (main 10 KB, preloads 3 KB, renderer 441 KB JS +
18 KB CSS).
