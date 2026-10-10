require('dotenv').config();
const { Client } = require('pg');
const { MultiTenantAuthEngine } = require('../packages/auth/index.js');

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Supabase for seeding...');

  try {
    // 1. Create Organization
    const orgRes = await client.query(`
      INSERT INTO organizations (name, slug, status)
      VALUES ($1, $2, $3)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, slug;
    `, ['Sultan Food Group', 'sultan-foods', 'ACTIVE']);
    const orgId = orgRes.rows[0].id;
    console.log('Organization seeded:', orgRes.rows[0]);

    // 2. Create Store
    const storeRes = await client.query(`
      INSERT INTO stores (organization_id, name, slug, business_type, currency_code, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id, name, slug;
    `, [orgId, 'Sultan Spice Biryani & Grill', 'sultan-spice', 'RESTAURANT', 'PKR', 'ACTIVE']);
    const storeId = storeRes.rows[0].id;
    console.log('Store seeded:', storeRes.rows[0]);

    // 3. Create Users & Memberships
    const usersToCreate = [
      { email: 'admin@sultan.pk', name: 'Master Admin', pass: 'Admin123!', role: 'ADMIN', isAdmin: true },
      { email: 'kitchen@sultan.pk', name: 'Head Chef', pass: 'Kitchen123!', role: 'CHEF', isAdmin: false },
      { email: 'rider@sultan.pk', name: 'Express Rider', pass: 'Rider123!', role: 'RIDER', isAdmin: false }
    ];

    for (const u of usersToCreate) {
      const { hash, salt } = MultiTenantAuthEngine.hashPassword(u.pass);
      const userRes = await client.query(`
        INSERT INTO users (email, password_hash, password_salt, full_name, is_platform_admin)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, password_salt = EXCLUDED.password_salt
        RETURNING id, email, full_name;
      `, [u.email, hash, salt, u.name, u.isAdmin]);
      const userId = userRes.rows[0].id;

      await client.query(`
        INSERT INTO organization_memberships (organization_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (organization_id, user_id) DO UPDATE SET role = EXCLUDED.role;
      `, [orgId, userId, u.role]);

      console.log(`User created: ${u.email} [${u.role}] (Password: ${u.pass})`);
    }

    // 4. Categories
    const catBiryani = await client.query(`
      INSERT INTO categories (store_id, name, slug, sort_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (store_id, slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `, [storeId, 'Biryani & Rice', 'biryani-rice', 1]);

    const catBbq = await client.query(`
      INSERT INTO categories (store_id, name, slug, sort_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (store_id, slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `, [storeId, 'BBQ & Grills', 'bbq-grills', 2]);

    const catSides = await client.query(`
      INSERT INTO categories (store_id, name, slug, sort_order)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (store_id, slug) DO UPDATE SET name = EXCLUDED.name
      RETURNING id;
    `, [storeId, 'Sides & Drinks', 'sides-drinks', 3]);

    // 5. Products
    const products = [
      { catId: catBiryani.rows[0].id, name: 'Special Chicken Dum Biryani', slug: 'special-chicken-dum-biryani', priceMinor: 65000, desc: 'Aromatic basmati rice cooked with succulent chicken.', sku: 'BIR-01', stock: 50 },
      { catId: catBbq.rows[0].id, name: 'Mutton Shinwari Karahi (Half KG)', slug: 'mutton-shinwari-karahi', priceMinor: 175000, desc: 'Fresh mutton in pure desi ghee with tomatoes and green chilies.', sku: 'KRH-01', stock: 25 },
      { catId: catBbq.rows[0].id, name: 'Chicken Malai Boti Platter', slug: 'chicken-malai-boti', priceMinor: 85000, desc: 'Melt-in-mouth chicken cubes marinated in heavy cream and spices.', sku: 'BBQ-02', stock: 30 },
      { catId: catSides.rows[0].id, name: 'Mint Raita & Fresh Salad', slug: 'mint-raita-salad', priceMinor: 12000, desc: 'Cooling yogurt dip with cucumber and herbs.', sku: 'SID-01', stock: 100 }
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (store_id, category_id, name, slug, description, base_price_minor, sku, quantity_on_hand)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (store_id, slug) DO UPDATE SET 
          base_price_minor = EXCLUDED.base_price_minor,
          quantity_on_hand = EXCLUDED.quantity_on_hand,
          description = EXCLUDED.description;
      `, [storeId, p.catId, p.name, p.slug, p.desc, p.priceMinor, p.sku, p.stock]);
      console.log(`Product seeded: ${p.name} (PKR ${p.priceMinor / 100})`);
    }

    console.log('\nAll seed data inserted successfully into Supabase!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.end();
  }
}

seed();
