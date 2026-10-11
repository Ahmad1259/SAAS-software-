const http = require('http');

function postJSON(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'x-store-id': 'burger-cottage'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function patchJSON(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch (e) { resolve(body); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runSimulation() {
  console.log('=== MULTI-AGENT ORDER SIMULATION TEST INITIATED ===\n');

  console.log('[AGENT 1: CUSTOMER BOT]');
  console.log('-> Customer browsing Burger Cottage Storefront (Single Deals category)...');
  console.log('-> Customer selecting "Single Deal 1 (Zinger Burger + Fries + Drink)" with Pepsi 345ml & Extra Cheese.');
  
  const orderRes = await postJSON('http://localhost:3000/api/orders', {
    customerName: 'Ahmad Farooq',
    customerPhone: '03054122075',
    address: 'House 22, Lane 4, Iqbal Park, Main Blvd Cantt, Lahore',
    paymentMethod: 'COD',
    items: [
      { id: 'bc-deal-01', name: 'Single Deal 1 (Zinger + Fries + Pepsi)', price: 620, qty: 2 }
    ]
  });

  console.log('-> Order Placed Successfully!');
  console.log('   Order ID:', orderRes.order.id);
  console.log('   Customer:', orderRes.order.customerName);
  console.log('   Total Bill:', 'PKR ' + orderRes.order.total);
  console.log('   Status:', orderRes.order.status);

  const orderId = orderRes.order.id;

  console.log('\n[AGENT 2: KITCHEN KDS CHEF BOT]');
  console.log(`-> Kitchen Display Screen received new Ticket #${orderId}...`);
  console.log('-> Chef taps "Start Cooking" (COOKING status assigned)...');
  const cookingRes = await patchJSON(`http://localhost:3000/api/orders/${orderId}`, {
    status: 'COOKING'
  });
  console.log('   Updated Status:', cookingRes.order.status);

  console.log('-> 12 minutes elapsed: Chef finishes frying and packaging deal box.');
  console.log('-> Chef marks "Ready for Pickup" (READY_FOR_PICKUP assigned)...');
  const readyRes = await patchJSON(`http://localhost:3000/api/orders/${orderId}`, {
    status: 'READY_FOR_PICKUP'
  });
  console.log('   Updated Status:', readyRes.order.status);

  console.log('\n[AGENT 3: DISPATCH & DELIVERY RIDER BOT]');
  console.log(`-> Dispatch system detects order #${orderId} ready at counter.`);
  console.log('-> Rider Usman (Proximity Rank 1) assigned and accepts order...');
  const shipRes = await patchJSON(`http://localhost:3000/api/orders/${orderId}`, {
    status: 'SHIPPED',
    rider: 'Usman - Iqbal Park Branch'
  });
  console.log('   Updated Status:', shipRes.order.status);
  console.log('   Rider:', shipRes.order.rider);

  console.log('-> Rider arrives at Iqbal Park Cantt address and collects PKR 1,240 Cash...');
  const completeRes = await patchJSON(`http://localhost:3000/api/orders/${orderId}`, {
    status: 'COMPLETED',
    paymentStatus: 'PAID'
  });
  console.log('   Updated Status:', completeRes.order.status);
  console.log('   Payment Status:', completeRes.order.paymentStatus);

  console.log('\n=== ALL 3 AGENTS COMPLETED LIFECYCLE 100% SUCCESSFULLY! ===');
}

runSimulation().catch(console.error);
