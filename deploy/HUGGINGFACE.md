# Hosting GeoBrowser on Hugging Face Spaces (free, no credit card)

This runs the real app on a server and gives you one URL that works on an iPhone, an
Android phone, a MacBook — anything with a browser. Nothing to download or install.

## What you get

- A permanent link like `https://alfahadansari-geobrowser.hf.space`
- The full app: address bar, back/forward, history, the built-in Prabhadevi location
- Free tier: 2 CPU, 16 GB RAM. The Space sleeps after ~48 h idle and wakes when you open it.

## Steps

**1. Make an account** at https://huggingface.co/join — email only, no card.

**2. Create a Space:** https://huggingface.co/new-space

- **Space name:** `geobrowser`
- **License:** MIT
- **SDK:** choose **Docker** → **Blank**
- **Hardware:** CPU basic (free)
- **Visibility:** **Private** unless you want strangers using your browser

**3. Set a password.** In the Space, go to **Settings → Variables and secrets → New secret**:

- Name: `VNC_PASSWORD`
- Value: any password you like

Skip this only if the Space is private. Without it, anyone with the link controls the browser.

**4. Push the code.** In your terminal:

```bash
cd "/Users/alfahadansari/presonal projects/fake gps"
git remote add space https://huggingface.co/spaces/<your-username>/geobrowser
git push space main
```

It will ask for your username and an access token — create one at
https://huggingface.co/settings/tokens with **write** permission, and paste it as the password.

**5. Wait ~10 minutes** for the first build, then open your Space URL.

## The Space needs its own README

Hugging Face reads configuration from the top of `README.md`. Before pushing, put this at the
very top of the repo's `README.md` — or keep a separate branch for the Space:

```
---
title: GeoBrowser
emoji: 📍
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---
```

## Honest limits

- **The server is not in India.** Hugging Face runs in the US/EU, so your _IP_ will look
  American even though your _coordinates_ say Prabhadevi. Sites that geolocate by IP will
  disagree with the ones that ask the browser. On your own Mac, both agree — so the hosted
  version is more convenient but less consistent.
- **It is remote control, not an app.** On a phone you are pinching and tapping at a
  desktop-sized screen.
- **Shared state.** Anyone with the link and password uses the _same_ browser session,
  including the same history.

If IP consistency matters more than convenience, run the desktop app on your Mac instead.
If being able to open it from your phone matters more, use this.
