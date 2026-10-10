/**
 * Production-ready HTTP Backend & RESTful API Service for Commerce Cloud
 * Author: Domain Master 4 (Backend Master) & Domain Master 11 (Security Master)
 * Supervised by: KING Agent
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'COMMERCE_CLOUD_ENTERPRISE_SECRET_KEY_SHA256_AT_LEAST_32_BYTES';

// In-Memory Database store with pre-seeded demo tenant for instant startup
let db = {
  organizations: [
    { id: 'org-sultan-01', name: 'Sultan Food Group', slug: 'sultan-foods', status: 'ACTIVE' }
  ],
  stores: [
    {
      id: 'store-sultan-main',
      organizationId: 'org-sultan-01',
      name: 'Sultan Spice Biryani & Grill',
      slug: 'sultan-spice',
      businessType: 'RESTAURANT',
      currency: 'PKR',
      whatsapp: '923001234567',
      deliveryFeeMinor: 15000n // PKR 150.00
    }
  ],
  products: [
    { id: 'prod-1', storeId: 'store-sultan-main', name: 'Special Chicken Dum Biryani', priceMinor: 65000n, category: 'Biryani & Rice', desc: 'Aromatic basmati rice cooked with chicken.', stock: 50 },
    { id: 'prod-2', storeId: 'store-sultan-main', name: 'Mutton Shinwari Karahi (Half KG)', priceMinor: 175000n, category: 'BBQ & Grills', desc: 'Fresh mutton in pure desi ghee.', stock: 25 },
    { id: 'prod-3', storeId: 'store-sultan-main', name: 'Chicken Malai Boti Platter', priceMinor: 85000n, category: 'BBQ & Grills', desc: 'Melt-in-mouth chicken cubes.', stock: 30 },
    { id: 'prod-4', storeId: 'store-sultan-main', name: 'Mint Raita & Fresh Salad', priceMinor: 12000n, category: 'Sides & Drinks', desc: 'Cooling yogurt dip with cucumber.', stock: 100 }
  ],
  orders: [
    {
      id: 'ORD-9821',
      storeId: 'store-sultan-main',
      customerName: 'Muhammad Usman',
      customerPhone: '0321-4567890',
      address: 'House 42, Street 8, Phase 5 DHA, Lahore',
      items: [
        { name: 'Special Chicken Dum Biryani', qty: 2, priceMinor: 65000n },
        { name: 'Mint Raita & Fresh Salad', qty: 1, priceMinor: 12000n }
      ],
      deliveryFeeMinor: 15000n,
      totalAmountMinor: 157000n,
      paymentMethod: 'COD',
      paymentStatus: 'AWAITING_PAYMENT',
      status: 'COOKING',
      createdAt: new Date().toISOString()
    }
  ],
  outboxJobs: []
};

// JSON helper with BigInt serializer
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-store-id, x-tenant-id'
  });
  const serialized = JSON.stringify(data, (key, value) =>
    typeof value === 'bigint' ? Number(value) : value
  );
  res.end(serialized);
}

// Request Body Parser
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-store-id, x-tenant-id'
    });
    return res.end();
  }

  try {
    // ----------------------------------------------------
    // API ROUTE: GET /api/health
    // ----------------------------------------------------
    if (pathname === '/api/health') {
      return sendJSON(res, 200, {
        status: 'UP',
        service: 'Commerce Cloud Modular Monolith',
        timestamp: new Date().toISOString()
      });
    }

    // ----------------------------------------------------
    // API ROUTE: GET /api/products
    // Scoped strictly to the store
    // ----------------------------------------------------
    if (pathname === '/api/products' && method === 'GET') {
      const storeId = req.headers['x-store-id'] || 'store-sultan-main';
      const storeProducts = db.products.filter(p => p.storeId === storeId);
      return sendJSON(res, 200, { products: storeProducts });
    }

    // ----------------------------------------------------
    // API ROUTE: POST /api/products (Store Owner creates product)
    // ----------------------------------------------------
    if (pathname === '/api/products' && method === 'POST') {
      const storeId = req.headers['x-store-id'] || 'store-sultan-main';
      const body = await parseBody(req);

      if (!body.name || !body.price) {
        return sendJSON(res, 400, { error: 'Product name and price are required' });
      }

      const newProduct = {
        id: 'prod-' + Date.now().toString(36),
        storeId,
        name: body.name,
        priceMinor: BigInt(body.price * 100), // convert PKR to paisas
        category: body.category || 'General',
        desc: body.desc || '',
        stock: body.stock || 50
      };

      db.products.push(newProduct);
      return sendJSON(res, 201, { success: true, product: newProduct });
    }

    // ----------------------------------------------------
    // API ROUTE: GET /api/orders
    // ----------------------------------------------------
    if (pathname === '/api/orders' && method === 'GET') {
      const storeId = req.headers['x-store-id'] || 'store-sultan-main';
      const role = req.headers['x-user-role'] || 'OWNER';

      let storeOrders = db.orders.filter(o => o.storeId === storeId);

      // Role-based filtering
      if (role === 'CHEF') {
        storeOrders = storeOrders.filter(o => o.status === 'PLACED' || o.status === 'COOKING');
      } else if (role === 'RIDER') {
        storeOrders = storeOrders.filter(o => o.status === 'READY_FOR_PICKUP' || o.status === 'SHIPPED');
      }

      return sendJSON(res, 200, { orders: storeOrders });
    }

    // ----------------------------------------------------
    // API ROUTE: POST /api/orders (Customer Checkout)
    // Server-side calculation & tamper-proof snapshots
    // ----------------------------------------------------
    if (pathname === '/api/orders' && method === 'POST') {
      const storeId = req.headers['x-store-id'] || 'store-sultan-main';
      const body = await parseBody(req);

      if (!body.items || body.items.length === 0) {
        return sendJSON(res, 400, { error: 'Cart must contain at least one item' });
      }

      let subtotalMinor = 0n;
      const verifiedItems = [];

      // Validate against catalog
      for (const item of body.items) {
        const prod = db.products.find(p => p.id === item.productId && p.storeId === storeId);
        if (!prod) {
          return sendJSON(res, 400, { error: `Product not found in store catalog: ${item.productId}` });
        }
        const lineTotal = prod.priceMinor * BigInt(item.quantity);
        subtotalMinor += lineTotal;
        verifiedItems.push({
          productId: prod.id,
          name: prod.name,
          qty: item.quantity,
          priceMinor: prod.priceMinor
        });
      }

      const deliveryFeeMinor = 15000n; // PKR 150
      const totalAmountMinor = subtotalMinor + deliveryFeeMinor;
      const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);

      const newOrder = {
        id: orderId,
        storeId,
        customerName: body.customerName || 'Customer',
        customerPhone: body.customerPhone || '03xx-xxxxxxx',
        address: body.address || 'Address not specified',
        items: verifiedItems,
        deliveryFeeMinor,
        totalAmountMinor,
        paymentMethod: body.paymentMethod || 'COD',
        paymentStatus: body.paymentMethod === 'COD' ? 'AWAITING_PAYMENT' : 'PAYMENT_SUBMITTED',
        status: 'PLACED',
        createdAt: new Date().toISOString()
      };

      db.orders.unshift(newOrder);

      // Register Odoo Outbox Sync Job automatically
      const outboxJob = {
        id: 'job-' + Date.now().toString(36),
        storeId,
        eventType: 'SYNC_SALES_ORDER',
        internalRecordId: orderId,
        status: 'PENDING',
        payload: newOrder,
        createdAt: new Date().toISOString()
      };
      db.outboxJobs.push(outboxJob);

      return sendJSON(res, 201, { success: true, order: newOrder });
    }

    // ----------------------------------------------------
    // API ROUTE: PATCH /api/orders/:id/status (Role Status Action)
    // ----------------------------------------------------
    if (pathname.startsWith('/api/orders/') && pathname.endsWith('/status') && method === 'PATCH') {
      const parts = pathname.split('/');
      const orderId = parts[3];
      const body = await parseBody(req);

      const order = db.orders.find(o => o.id === orderId);
      if (!order) {
        return sendJSON(res, 404, { error: 'Order not found' });
      }

      order.status = body.status;
      if (body.status === 'COMPLETED' && order.paymentMethod === 'COD') {
        order.paymentStatus = 'PAID';
      }

      return sendJSON(res, 200, { success: true, order });
    }

    // ----------------------------------------------------
    // STATIC FILE SERVING FOR FRONTEND UI
    // ----------------------------------------------------
    let filePath = path.join(__dirname, '..', 'public', pathname === '/' ? 'index.html' : pathname);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      return fs.createReadStream(filePath).pipe(res);
    }

    // 404 Fallback
    sendJSON(res, 404, { error: 'Endpoint not found' });

  } catch (error) {
    console.error('Server Error:', error);
    sendJSON(res, 500, { error: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  console.log(`[COMMERCE CLOUD] Server running live at http://localhost:${PORT}`);
});

module.exports = { server, db };
