import { writeFileSync } from 'node:fs';
writeFileSync('docs/index.html', `<!doctype html><meta charset="utf-8"><title>Team1 Docs</title>
<style>body{font:14px system-ui;margin:40px;line-height:1.35} code{background:#f5f5f7;padding:2px 6px;border-radius:6px}</style>
<h1>Team1 Docs Bundle</h1>
<ul>
  <li><a href="data/routes.json">routes.json</a></li>
  <li><a href="data/schema.sql">schema.sql</a></li>
  <li><a href="data/rls.json">rls.json</a></li>
  <li><a href="data/build.json">build.json</a></li>
</ul>`);
