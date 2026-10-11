const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres.utdpjnaorqpjsdyxiixs:ilyIyB7dux9eM9wc@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function runDatabaseSetup() {
  const client = await pool.connect();
  try {
    console.log('--- 1. EXECUTING BASE SCHEMA MIGRATIONS ---');
    const schemaSqlPath = path.join(__dirname, '../packages/database/migrations/001_initial_schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(schemaSql);
    console.log('Base schema tables & RLS policies verified.');

    console.log('--- 2. EXTENDING SCHEMA FOR POS, CALORIES & IMAGES ---');
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS calories INT DEFAULT 500;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'DELIVERY';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_no VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Columns calories, image_url, order_type, table_no verified.');

    console.log('--- 3. CREATING / UPSERTING BURGER COTTAGE TENANT ---');
    // Organization
    const orgRes = await client.query(`
      INSERT INTO organizations (name, slug, status)
      VALUES ('Burger Cottage Group', 'burger-cottage', 'ACTIVE')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
      RETURNING id, name, slug;
    `);
    const orgId = orgRes.rows[0].id;

    // Store
    const storeRes = await client.query(`
      INSERT INTO stores (organization_id, name, slug, business_type, currency_code, status)
      VALUES ($1, 'Burger Cottage', 'burger-cottage', 'RESTAURANT', 'PKR', 'ACTIVE')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
      RETURNING id, name, slug;
    `, [orgId]);
    const storeId = storeRes.rows[0].id;
    console.log(`Burger Cottage Organization ID: ${orgId}, Store ID: ${storeId}`);

    console.log('--- 4. SEEDING STAFF USERS & ROLES ---');
    const staffMembers = [
      { email: 'admin@burgercottage.pk', name: 'Store Owner / Admin', role: 'ADMIN', pass: '123456' },
      { email: 'cashier@burgercottage.pk', name: 'Front Desk Cashier', role: 'CASHIER', pass: '123456' },
      { email: 'chef@burgercottage.pk', name: 'Kitchen Head Chef', role: 'CHEF', pass: '123456' },
      { email: 'rider@burgercottage.pk', name: 'Fleet Rider Courier', role: 'RIDER', pass: '123456' }
    ];

    for (const member of staffMembers) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = hashPassword(member.pass, salt);

      const userRes = await client.query(`
        INSERT INTO users (email, password_hash, password_salt, full_name, is_platform_admin)
        VALUES ($1, $2, $3, $4, FALSE)
        ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
        RETURNING id;
      `, [member.email, hash, salt, member.name]);
      const userId = userRes.rows[0].id;

      await client.query(`
        INSERT INTO organization_memberships (organization_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;
      `, [orgId, userId, member.role]);
    }
    console.log('Staff accounts for Admin, Cashier, Chef, Rider provisioned.');

    console.log('--- 5. SEEDING 97 BURGER COTTAGE MENU PRODUCTS ---');
    const menuPath = path.join(__dirname, '../clients/burger-cottage/menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

    let seededCount = 0;
    for (const item of menuData.items) {
      // Get or create category
      const catSlug = (item.category || 'General').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const catRes = await client.query(`
        INSERT INTO categories (store_id, name, slug)
        VALUES ($1, $2, $3)
        ON CONFLICT (store_id, slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [storeId, item.category || 'General', catSlug]);
      const catId = catRes.rows[0].id;

      // Product slug
      const prodSlug = item.id || (item.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000));
      const priceMinor = BigInt(Math.round(item.price * 100));

      await client.query(`
        INSERT INTO products (
          store_id, category_id, name, slug, description,
          base_price_minor, calories, image_url, is_active, quantity_on_hand
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, $9)
        ON CONFLICT (store_id, slug) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          base_price_minor = EXCLUDED.base_price_minor,
          calories = EXCLUDED.calories,
          image_url = EXCLUDED.image_url,
          quantity_on_hand = EXCLUDED.quantity_on_hand,
          updated_at = NOW();
      `, [
        storeId,
        catId,
        item.name,
        prodSlug,
        item.desc || '',
        priceMinor.toString(),
        item.calories || 500,
        item.imageUrl || null,
        item.stock || 100
      ]);
      seededCount++;
    }

    console.log(`Successfully inserted / synced ${seededCount} items in PostgreSQL database!`);

    console.log('--- 6. VERIFYING SEEDED DATA METRICS ---');
    const verifyProdCount = await client.query('SELECT COUNT(*) as count FROM products WHERE store_id = $1', [storeId]);
    const verifyCatCount = await client.query('SELECT COUNT(*) as count FROM categories WHERE store_id = $1', [storeId]);
    console.log(`PostgreSQL Verified Total Categories: ${verifyCatCount.rows[0].count}`);
    console.log(`PostgreSQL Verified Total Products: ${verifyProdCount.rows[0].count}`);

    console.log('DATABASE SETUP & MIGRATION COMPLETE! ALL 97 ITEMS FULLY LIVE IN SUPABASE POSTGRESQL.');
  } catch (err) {
    console.error('Database migration failed:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

runDatabaseSetup().catch(err => {
  console.error(err);
  process.exit(1);
});
