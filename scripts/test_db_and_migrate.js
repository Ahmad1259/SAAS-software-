require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

async function main() {
  console.log('Connecting to Supabase PostgreSQL at:', connectionString ? connectionString.replace(/:[^:@]+@/, ':****@') : 'NONE');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Successfully connected to Supabase PostgreSQL!');

    const res = await client.query('SELECT NOW() as current_time, version();');
    console.log('Server Time:', res.rows[0].current_time);

    // Check if tables already exist
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\nExisting Tables in public schema:');
    const existingTables = tablesRes.rows.map(r => r.table_name);
    console.log(existingTables.length ? existingTables.join(', ') : '(No tables yet)');

    if (!existingTables.includes('orders') || !existingTables.includes('users')) {
      console.log('\nApplying schema migration from packages/database/migrations/001_initial_schema.sql...');
      const schemaPath = path.join(__dirname, '../packages/database/migrations/001_initial_schema.sql');
      const sql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(sql);
      console.log('Schema migration applied successfully!');

      const verifyRes = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `);
      console.log('\nVerified Tables now in DB:\n - ' + verifyRes.rows.map(r => r.table_name).join('\n - '));
    } else {
      console.log('\nAll core tables already exist. Schema is up to date.');
    }

  } catch (err) {
    console.error('Database connection / migration error:', err);
  } finally {
    await client.end();
  }
}

main();
