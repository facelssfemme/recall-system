# Deploy — recallsystem.easeandempire.co

Upload the entire `recall-system/` folder as the site root (or map the subdomain to this directory).

## Stripe success URL

`https://recallsystem.easeandempire.co/thank-you.html`

## Local preview

```bash
cd recall-system
python3 -m http.server 8765
```

Open `http://localhost:8765/index.html`

## Files

| File | Purpose |
|------|---------|
| `index.html` | Sales page |
| `thank-you.html` | Post-purchase access |
| `app.html` | Builder (password gate) |
| `css/recall.css` | Shared brand + marketing styles |
| `css/app.css` | Builder UI styles |
| `js/` | Builder logic + thank-you script |

Stripe checkout: `https://buy.stripe.com/7sY4gA5E9abnetA31n5c40f` (configured in `index.html`).
