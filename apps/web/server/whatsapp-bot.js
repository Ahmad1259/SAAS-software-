/**
 * Burger Cottage Official WhatsApp Autonomous Gateway
 * Powered by Baileys & Multi-File Auth
 * Zero Human Intervention - 100% Automated Background Dispatch
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const QRCode = require('qrcode');

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const AUTH_FOLDER = isServerless 
  ? path.join(os.tmpdir(), 'whatsapp_auth_session') 
  : path.join(__dirname, '..', '..', '..', 'whatsapp_auth_session');

let makeWASocket, DisconnectReason, useMultiFileAuthState;
let pino;

async function loadDependencies() {
  if (makeWASocket && pino) return;

  // Load Pino safely
  try {
    pino = require('pino');
  } catch (e) {
    pino = () => ({ level: 'silent', info: () => {}, error: () => {}, warn: () => {} });
  }

  // Load Baileys safely with ESM fallback
  try {
    const baileys = require('@whiskeysockets/baileys');
    makeWASocket = baileys.default || baileys.makeWASocket || baileys;
    DisconnectReason = baileys.DisconnectReason;
    useMultiFileAuthState = baileys.useMultiFileAuthState;
  } catch (err) {
    if (err.code === 'ERR_REQUIRE_ESM' || (err.message && err.message.includes('import()'))) {
      const baileys = await import('@whiskeysockets/baileys');
      makeWASocket = baileys.default || baileys.makeWASocket || baileys;
      DisconnectReason = baileys.DisconnectReason;
      useMultiFileAuthState = baileys.useMultiFileAuthState;
    } else {
      throw err;
    }
  }
}

let sock = null;
let currentQrDataUrl = null;
let currentRawQr = null;
let connectionStatus = 'DISCONNECTED'; // 'DISCONNECTED' | 'SCAN_QR' | 'CONNECTING' | 'CONNECTED'
let connectedPhone = null;
let lastConnectedAt = null;
let lastError = null;

// Format phone number to WhatsApp JID format (e.g. 03054122075 -> 923054122075@s.whatsapp.net)
function formatToWhatsAppJid(phone) {
  if (!phone) return null;
  let cleaned = phone.toString().replace(/[^0-9]/g, '');
  if (cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  } else if (cleaned.startsWith('3') && cleaned.length === 10) {
    cleaned = '92' + cleaned;
  }
  return cleaned + '@s.whatsapp.net';
}

async function initWhatsApp(forceReconnect = false) {
  if (sock && connectionStatus === 'CONNECTED' && !forceReconnect) {
    return { status: connectionStatus, connectedPhone, isConnected: true };
  }

  try {
    await loadDependencies();

    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    connectionStatus = 'CONNECTING';
    currentQrDataUrl = null;
    currentRawQr = null;
    lastError = null;

    sock = makeWASocket({
      auth: state,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: false,
      browser: ['Burger Cottage Autonomous POS', 'Chrome', '1.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentRawQr = qr;
        try {
          currentQrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 2 });
          connectionStatus = 'SCAN_QR';
          console.log('[WHATSAPP GATEWAY] New QR Code generated for Official Line pairing.');
        } catch (qrErr) {
          console.error('[WHATSAPP GATEWAY] QR generation err:', qrErr);
        }
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason?.loggedOut;
        console.log(`[WHATSAPP GATEWAY] Connection closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`);
        
        connectionStatus = 'DISCONNECTED';
        currentQrDataUrl = null;
        connectedPhone = null;
        lastError = lastDisconnect?.error?.message || 'Connection closed';

        if (shouldReconnect) {
          setTimeout(() => {
            initWhatsApp(true).catch(e => console.error('[WHATSAPP RECONNECT ERR]', e));
          }, 4000);
        } else {
          // Logged out - clean folder
          try {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
          } catch (e) {}
        }
      } else if (connection === 'open') {
        connectionStatus = 'CONNECTED';
        currentQrDataUrl = null;
        currentRawQr = null;
        lastConnectedAt = new Date().toISOString();

        const userJid = sock.user?.id || '';
        connectedPhone = userJid.split(':')[0] || userJid.split('@')[0] || 'Official Store Line';
        console.log(`[WHATSAPP GATEWAY] ✅ OFFICIAL BURGER COTTAGE LINE CONNECTED: +${connectedPhone}`);
      }
    });

    // Wait up to 4.5 seconds for QR code generation or connection ready
    await new Promise((resolve) => {
      let finished = false;
      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          resolve();
        }
      }, 4500);

      const interval = setInterval(() => {
        if (currentQrDataUrl || connectionStatus === 'CONNECTED' || connectionStatus === 'SCAN_QR' || lastError) {
          if (!finished) {
            finished = true;
            clearInterval(interval);
            clearTimeout(timer);
            resolve();
          }
        }
      }, 150);
    });

    return {
      status: connectionStatus,
      isConnected: connectionStatus === 'CONNECTED',
      qrDataUrl: currentQrDataUrl,
      connectedPhone
    };
  } catch (err) {
    console.error('[WHATSAPP GATEWAY] Initialization error:', err);
    connectionStatus = 'DISCONNECTED';
    lastError = err.message;
    return {
      status: 'ERROR',
      isConnected: false,
      error: err.message,
      qrDataUrl: null
    };
  }
}

async function sendWhatsAppMessage(recipientPhone, textMessage) {
  if (connectionStatus !== 'CONNECTED' || !sock) {
    console.warn('[WHATSAPP GATEWAY] Cannot send automated message: Gateway is NOT connected.');
    return {
      success: false,
      error: 'GATEWAY_NOT_CONNECTED',
      message: 'Official WhatsApp is not connected. Scan QR in Owner Admin panel to enable 100% automated delivery.'
    };
  }

  const jid = formatToWhatsAppJid(recipientPhone);
  if (!jid) {
    return { success: false, error: 'INVALID_PHONE_NUMBER' };
  }

  try {
    const res = await sock.sendMessage(jid, { text: textMessage });
    console.log(`[WHATSAPP GATEWAY] 🚀 Message sent to ${recipientPhone} (ID: ${res?.key?.id || 'OK'})`);
    return {
      success: true,
      messageId: res?.key?.id,
      recipient: recipientPhone,
      timestamp: new Date().toISOString()
    };
  } catch (sendErr) {
    console.error(`[WHATSAPP GATEWAY] Failed to send message to ${recipientPhone}:`, sendErr);
    return {
      success: false,
      error: sendErr.message
    };
  }
}

async function logoutWhatsApp() {
  try {
    if (sock) {
      await sock.logout();
    }
  } catch (e) {}
  sock = null;
  connectionStatus = 'DISCONNECTED';
  currentQrDataUrl = null;
  connectedPhone = null;
  try {
    fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
  } catch (e) {}
  return { success: true };
}

function getGatewayStatus() {
  return {
    status: connectionStatus,
    isConnected: connectionStatus === 'CONNECTED',
    qrDataUrl: currentQrDataUrl,
    connectedPhone,
    lastConnectedAt,
    lastError
  };
}

module.exports = {
  initWhatsApp,
  sendWhatsAppMessage,
  logoutWhatsApp,
  getGatewayStatus,
  formatToWhatsAppJid
};
