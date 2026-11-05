import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export const BADGE = 'Market: 50%';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPage(facts) {
  if (!Array.isArray(facts)) throw new Error('facts.json must contain an array');
  const items = facts
    .map((fact) => {
      if (!fact || typeof fact.id !== 'string' || typeof fact.text !== 'string') {
        throw new Error(`Invalid fact: ${JSON.stringify(fact)}`);
      }
      return `      <li class="fact" data-fact-id="${escapeHtml(fact.id)}">
        <span class="text">${escapeHtml(fact.text)}</span>
        <span class="badge">${BADGE}</span>
      </li>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The five facts</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; color: #222; }
      ul { list-style: none; padding: 0; }
      .fact { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: .75rem 0; border-bottom: 1px solid #ddd; }
      .badge { flex: none; font-size: .8rem; padding: .15rem .5rem; border-radius: 999px; background: #eef; color: #335; }
    </style>
  </head>
  <body>
    <h1>The five facts</h1>
    <ul class="facts">
${items}
    </ul>
  </body>
</html>
`;
}

export function build(factsPath = join(root, 'facts.json'), outDir = join(root, 'dist')) {
  const facts = JSON.parse(readFileSync(factsPath, 'utf8'));
  const html = renderPage(facts);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, 'index.html');
  writeFileSync(outFile, html);
  return outFile;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = build();
  console.log(`Wrote ${out}`);
}
