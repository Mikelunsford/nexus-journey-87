import { execSync } from 'node:child_process';
try {
  const url = process.env.DB_URL_READONLY;
  const sql = execSync(`pg_dump --schema-only --no-owner ${url}`, {encoding:'utf8'});
  process.stdout.write(sql);
} catch { process.stdout.write('-- Set DB_URL_READONLY for live dump\n'); }
