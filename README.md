# Elevotix Newsletter Landing

Static landing page for Elevotix newsletter subscriptions with Google Sheets integration.

## Architecture

- **Frontend:** Static HTML/CSS/JS
- **Backend:** Google Apps Script (handles form submissions)
- **Data Storage:** Google Sheets
- **Hosting:** Vercel (static deployment)

## How It Works

1. User enters email and clicks "Subscribe Free"
2. Frontend POSTs to Google Apps Script endpoint
3. Apps Script appends email + timestamp to Google Sheet
4. User sees success confirmation

## Deploy

Deployments are automatic via GitHub Actions when pushing to `main`.

**Manual deployment:**

```bash
npm install -g vercel
vercel login
vercel --prod
```

## Local Development

```bash
python3 -m http.server 8000
# Visit http://localhost:8000/newsletterlanding.html
```
