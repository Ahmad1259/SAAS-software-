const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres.utdpjnaorqpjsdyxiixs:ilyIyB7dux9eM9wc@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'products'");
  console.log('Columns in products:', res.rows.map(r => r.column_name + ' (' + r.data_type + ')'));
  await pool.end();
}

main().catch(console.error);
