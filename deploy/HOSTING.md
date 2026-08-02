# Hosting GeoBrowser so you can use it from a phone

The app is a desktop program, so "hosting" means running it on a machine somewhere and
streaming its screen to your browser. You open one link and you are using the app — on an
iPhone, an Android phone, or any computer. Nothing to install.

`Dockerfile` and `scripts/serve.sh` do the work; the only question is where they run.

## The options, honestly

| Where                     | Cost             | Card needed      | Always on        | IP looks like          |
| ------------------------- | ---------------- | ---------------- | ---------------- | ---------------------- |
| **GitHub Codespaces**     | Free, 60 h/month | **No**           | No, you start it | US / Europe            |
| **Oracle Cloud (Mumbai)** | Free forever     | Yes, for ID only | Yes              | **Mumbai** ✅          |
| Hugging Face Spaces       | $9/month         | Yes              | Yes              | US                     |
| Vercel, Netlify, Render   | —                | —                | —                | Cannot run this at all |

Hugging Face used to allow free Docker Spaces. It no longer does — their docs now state that
Gradio and Docker Spaces "require a paid plan to create". Only static HTML Spaces are free,
and this app is not a static page.

## Recommended: GitHub Codespaces (free, no card)

**1.** Open https://github.com/AlFahadAnsari/Browser

**2.** Click the green **Code** button → **Codespaces** tab → **Create codespace on main**

**3.** Wait ~8 minutes for the first build. It is building the whole app, so it is slow once
and fast afterwards.

**4.** When it opens, look at the **Ports** tab at the bottom. Right-click port **7860** →
**Port Visibility** → **Public**.

**5.** Copy the URL next to port 7860. It looks like
`https://something-7860.app.github.dev`. Open it on your phone.

That URL is GeoBrowser. Type an address, browse, and every site sees Prabhadevi.

### Set a password first

A public port means anyone with the link can control the browser. Before step 4, add a
password:

Repository **Settings** → **Secrets and variables** → **Codespaces** → **New repository
secret**

- Name: `VNC_PASSWORD`
- Value: anything you choose

Rebuild the Codespace afterwards so it picks the secret up.

### What to know

- **60 hours per month free.** The Codespace stops after 30 minutes idle and you restart it
  from the same Code → Codespaces menu. Your history and logins survive a restart.
- **The IP is not Indian.** Coordinates say Prabhadevi, but the IP belongs to GitHub's data
  centre. Sites that only read IP will think you are abroad. See the note below.

## If the IP matters: Oracle Cloud, Mumbai

Oracle's Always Free tier includes a machine in their **India South (Mumbai)** region, free
permanently — not a trial. A card is required to verify identity but is never charged.

Run the same image there:

```bash
docker build -t geobrowser .
docker run -d --restart unless-stopped -p 7860:7860 -e VNC_PASSWORD=your-password geobrowser
```

This is the only setup where the coordinates _and_ the IP both say Mumbai — more convincing
than the app on your own Mac, and reachable from your phone.

## Security, in one line

Whatever you choose, it is **one browser shared by everyone who has the link**. Your history
and every account you log into are visible to them. Set the password, never share it, and do
not sign in to personal accounts on a hosted instance.
