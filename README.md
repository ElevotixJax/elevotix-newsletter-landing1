# Elevotix Newsletter Landing — Vercel Deployment

This is a static landing page. Use Vercel to deploy quickly.

Quick deploy (CLI):

1. Install the Vercel CLI (if not installed):

```bash
npm i -g vercel
```

2. Log in and deploy:

```bash
vercel login
vercel           # follow prompts (first deploy creates a project)
vercel --prod    # promote a deployment to production
```

Notes:
- The project is configured as a static site in `vercel.json` and routes the root path to `newsletterlanding.html`.
- Static assets (images, `js/`) are included automatically.
- If you prefer GitHub integration, connect the repo in the Vercel dashboard and set the production branch to `main`.

Local preview:

```bash
# Simple static preview using Python
python3 -m http.server 8000
# open http://localhost:8000/newsletterlanding.html
```

If you'd like I can add a small `package.json` or a GitHub Action that deploys to Vercel on push. Request it and I'll add it.
