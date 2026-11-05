# The five facts page

A small static page built from `facts.json`. `npm run build` writes `dist/index.html`; no dependencies, no network at runtime.

## Run

```sh
git clone <this-repo> facts-page
cd facts-page
npm install
npm run build
npm test
```

Edit `facts.json` and run `npm run build` again to regenerate the page. Vercel deploys it using `vercel.json` (`npm run build`, output `dist`).
