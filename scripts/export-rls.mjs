import pg from 'pg';
const url = process.env.DB_URL_READONLY;
if (!url) { console.log(JSON.stringify({error:'DB_URL_READONLY missing'})); process.exit(0); }
const client = new pg.Client({ connectionString:url });
await client.connect();
const { rows } = await client.query(`
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies order by schemaname, tablename, policyname`);
console.log(JSON.stringify({generatedAt:new Date().toISOString(), policies: rows}, null, 2));
await client.end();
