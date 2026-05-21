# The Recall System

Standalone product site for med spa follow-up and rebooking — sales page, thank-you access, and password-gated builder app.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Sales landing page |
| `thank-you.html` | Post-purchase access instructions |
| `app.html` | Follow-up message builder |

## Local preview

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765`

## Deploy

Deploy this folder as the site root (e.g. Vercel static hosting on `recallsystem.easeandempire.co`).

See [DEPLOY.md](DEPLOY.md) for Stripe success URL and paths.
