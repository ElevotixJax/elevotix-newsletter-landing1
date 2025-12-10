# Elevotix Newsletter Landing — Vercel Deployment

This landing page includes a secure backend API for Mailchimp integration.

## Setup: Add Environment Variables

Before deploying, set your Mailchimp credentials in Vercel.

**Option 1: Using Vercel CLI**

```bash
vercel env add MCKEY
# Paste your Mailchimp API key

vercel env add MCLID
# Paste your Mailchimp List ID

vercel env add MCDC
# Paste your Mailchimp datacenter (e.g., us5)
```

**Option 2: Vercel Dashboard**

1. Go to your Vercel project dashboard
2. Settings > Environment Variables
3. Add three variables:
   - `MCKEY` (Mailchimp API Key)
   - `MCLID` (Mailchimp List ID)
   - `MCDC` (Mailchimp Datacenter)

See `.env.example` for reference.

## Deploy

**CLI deployment:**

```bash
npm install -g vercel
vercel login
vercel --prod
```

**GitHub integration:**

1. Connect your GitHub repo in the Vercel dashboard
2. Set production branch to `main`
3. Vercel auto-deploys on push

## Local Testing

1. Create `.env` file with your Mailchimp credentials:

```bash
cp .env.example .env
# Edit .env with your actual credentials
```

2. Install Node dependencies and run the API:

```bash
npm install
node api.js
```

3. In another terminal, run the static server:

```bash
python3 -m http.server 8000
```

4. Visit `http://localhost:8000/newsletterlanding.html` and test the signup forms

## Architecture

- **Frontend:** Static HTML/CSS/JS (no secrets exposed)
- **Backend:** `api.js` Node.js proxy that handles Mailchimp API calls securely
- **Vercel Config:** `vercel.json` routes `/api/subscribe` to the Node.js function
- **Secrets:** Environment variables stored in Vercel (never committed to git)

