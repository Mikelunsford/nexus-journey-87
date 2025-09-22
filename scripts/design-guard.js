const fs = require('fs');
const path = require('path');
const glob = require('glob');

const banned = /(text-(white|slate|gray)-\d+|bg-(white|slate|gray)-\d+|from-|to-|via-)/g; // no gradients, no slate/gray, no text-white
const files = glob.sync('src/**/*.{tsx,ts,css}');
let bad = [];

for (const f of files) {
  const c = fs.readFileSync(f, 'utf8');
  const m = c.match(banned);
  if (m) bad.push({ f, m });
}

if (bad.length) {
  console.warn('[DesignGuard] Replace ad-hoc classes with semantic utilities:', bad.slice(0, 20));
  process.exitCode = 1;
} else {
  console.log('[DesignGuard] All clear - using semantic design tokens!');
}