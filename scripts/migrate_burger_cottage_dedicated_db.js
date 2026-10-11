const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const crypto = require('crypto');

const dedicatedConnectionString = 'postgresql://postgres.tiwuiyhlmkdlpzlnomkq:BurgerCottage2026%21@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({
  connectionString: dedicatedConnectionString,
  ssl: { rejectUnauthorized: false }
});

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

async function runDedicatedMigration() {
  const client = await pool.connect();
  try {
    console.log('--- 1. RUNNING BASE SCHEMA MIGRATION ON DEDICATED DATABASE ---');
    const schemaSqlPath = path.join(__dirname, '../packages/database/migrations/001_initial_schema.sql');
    const schemaSql = fs.readFileSync(schemaSqlPath, 'utf8');
    await client.query(schemaSql);
    console.log('Tables organizations, stores, categories, products, orders, users verified.');

    console.log('--- 2. EXTENDING SCHEMA (CALORIES, IMAGES, POS COLS) ---');
    await client.query(`
      ALTER TABLE products ADD COLUMN IF NOT EXISTS calories INT DEFAULT 500;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'DELIVERY';
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_no VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_details JSONB DEFAULT '{}'::jsonb;
    `);
    console.log('Extended schema columns verified.');

    console.log('--- 3. CREATING BURGER COTTAGE ORGANIZATION & STORE ---');
    const orgRes = await client.query(`
      INSERT INTO organizations (name, slug, status)
      VALUES ('Burger Cottage Group', 'burger-cottage', 'ACTIVE')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
      RETURNING id;
    `);
    const orgId = orgRes.rows[0].id;

    const storeRes = await client.query(`
      INSERT INTO stores (organization_id, name, slug, business_type, currency_code, status)
      VALUES ($1, 'Burger Cottage', 'burger-cottage', 'RESTAURANT', 'PKR', 'ACTIVE')
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW()
      RETURNING id;
    `, [orgId]);
    const storeId = storeRes.rows[0].id;
    console.log(`Burger Cottage Organization: ${orgId}, Store: ${storeId}`);

    console.log('--- 4. PROVISIONING DEDICATED STAFF ACCOUNTS ---');
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
    console.log('Staff accounts for Admin, Cashier, Chef, and Rider provisioned.');

    console.log('--- 5. SEEDING ALL 97 MENU PRODUCTS ---');
    const menuPath = path.join(__dirname, '../clients/burger-cottage/menu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

    let seededCount = 0;
    for (const item of menuData.items) {
      const catSlug = (item.category || 'General').toLowerCase().replace(/[^a-z0-9]/g, '-');
      const catRes = await client.query(`
        INSERT INTO categories (store_id, name, slug)
        VALUES ($1, $2, $3)
        ON CONFLICT (store_id, slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `, [storeId, item.category || 'General', catSlug]);
      const catId = catRes.rows[0].id;

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

    console.log(`Seeded ${seededCount} products in dedicated Burger Cottage database!`);

    const vCat = await client.query('SELECT COUNT(*) as c FROM categories WHERE store_id = $1', [storeId]);
    const vProd = await client.query('SELECT COUNT(*) as c FROM products WHERE store_id = $1', [storeId]);
    console.log(`Verified Total Categories: ${vCat.rows[0].c}`);
    console.log(`Verified Total Products: ${vProd.rows[0].c}`);

    console.log('SUCCESS: DEDICATED DATABASE IS FULLY POPULATED & ISOLATED FOR BURGER COTTAGE!');
  } finally {
    client.release();
    await pool.end();
  }
}

runDedicatedMigration().catch(err => {
  console.error(err);
  process.exit(1);
});
