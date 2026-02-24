# Estate 2026

Minimal Astro starter for Cloudflare Pages with dynamic path-based i18n.

## How to Deploy to Cloudflare Pages from GitHub

1. Push this repository to GitHub.
2. Log in to the Cloudflare Dashboard and go to **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your GitHub repository and click **Begin setup**.
4. Configure the build settings as follows:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Expand **Environment variables (advanced)** if you have any production secrets configured in `.env.example`.
6. Click **Save and Deploy**. 

## Environment Variables

Environment variables are set in your Cloudflare Pages dashboard under the project's **Settings -> Environment variables** tab. 

## Files Summary

### Committed files list
These files are pushed to GitHub:
- `package.json`
- `astro.config.mjs`
- `README.md`
- `.gitignore`
- `.env.example`
- `src/i18n/en.json`
- `src/i18n/bg.json`
- `src/lib/i18n.js`
- `src/pages/index.astro`
- `src/pages/[lang]/index.astro`

### Local-only files list
These files strictly reside on your system and must never be committed:
- `.env`
- `node_modules/`
- `dist/`
- `.astro/`
