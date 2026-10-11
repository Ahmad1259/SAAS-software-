const localtunnel = require('localtunnel');

async function start() {
  try {
    const tunnel = await localtunnel({ port: 3000 });
    console.log(`[TUNNEL_ONLINE] PUBLIC_URL: ${tunnel.url}`);

    tunnel.on('close', () => {
      console.log('Tunnel closed. Reconnecting in 3s...');
      setTimeout(start, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error:', err);
      setTimeout(start, 3000);
    });
  } catch (err) {
    console.error('Failed to create tunnel:', err);
    setTimeout(start, 3000);
  }
}

// Keep process active permanently
setInterval(() => {}, 60000);

start();
