import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { build, escapeHtml, renderPage } from '../scripts/build.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

test('built page lists every fact from facts.json in order, escaped, with badge', () => {
  const outFile = build();
  const html = readFileSync(outFile, 'utf8');
  const facts = JSON.parse(readFileSync(join(root, 'facts.json'), 'utf8'));

  const ids = [...html.matchAll(/data-fact-id="([^"]*)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, facts.map((f) => escapeHtml(f.id)));

  const blocks = html.split('data-fact-id=').slice(1);
  assert.equal(blocks.length, facts.length);
  facts.forEach((fact, i) => {
    assert.ok(blocks[i].includes(escapeHtml(fact.text)), `fact ${fact.id} text present`);
    assert.match(blocks[i], /class="badge">Market: 50%</);
  });
  assert.equal((html.match(/Market: 50%/g) || []).length, facts.length);
});

test('dist names no other host', () => {
  build();
  const dist = join(root, 'dist');
  for (const name of readdirSync(dist, { recursive: true })) {
    let content;
    try { content = readFileSync(join(dist, name), 'utf8'); } catch { continue; }
    assert.ok(!/https?:\/\//.test(content), `${name} contains a URL`);
  }
});

test('fact text is escaped', () => {
  const html = renderPage([{ id: 'x"y', text: '<script>a & b</script>' }]);
  assert.ok(html.includes('&lt;script&gt;a &amp; b&lt;/script&gt;'));
  assert.ok(html.includes('data-fact-id="x&quot;y"'));
  assert.ok(!html.includes('<script>'));
});

test('page is rebuilt from a different facts file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'facts-'));
  const factsPath = join(dir, 'facts.json');
  writeFileSync(factsPath, JSON.stringify([{ id: 'm1', text: 'Mutated one' }, { id: 'm2', text: 'Mutated two' }]));
  const html = readFileSync(build(factsPath, join(dir, 'dist')), 'utf8');
  assert.equal((html.match(/data-fact-id=/g) || []).length, 2);
  assert.ok(html.includes('Mutated two'));
});
