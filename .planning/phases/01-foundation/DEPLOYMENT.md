# Cloudflare Pages Deployment Guide

**Status:** Pending — deploy when ready
**Created:** 2026-03-03

## Prerequisites

- GitHub repository created and code pushed
- Cloudflare account

## Step 1: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## Step 2: Create Cloudflare Pages Project

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Click **Create a project** → **Connect to Git**
3. Select the GitHub repo

## Step 3: Configure Build Settings

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | *(leave blank — repo root)* |
| Node.js version | *(leave blank — reads `.nvmrc` automatically)* |
| Framework preset | `Astro` (if prompted) |

## Step 4: Deploy and Verify

1. Trigger the first deployment
2. Visit the live URL: `https://[project-name].pages.dev`
3. Confirm it shows "Ilhéu Magazine" and "Site under construction"
4. Check build logs — Node.js version should show 22.x

## Troubleshooting

- **Build fails?** Go to Pages Settings → Build → Build system version → set to **v3**
- **Wrong output?** Ensure output directory is `dist` (not `build` or `public`)
- **Node version wrong?** Verify `.nvmrc` contains `22` and is committed

## CLI Verification

```bash
curl -s https://YOUR-PROJECT.pages.dev | grep "Ilhéu"
```

---
*From Phase 1, Plan 01-03*
