/**
 * @commerce/odoo-connector (CommonJS)
 * Adaptive Odoo XML-RPC / JSON-RPC Connector with Outbox Engine
 * Author: Domain Master 8 (Odoo Integration Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 9 (Accounting Master) & Domain Master 16 (Red-Team)
 */

class OdooConnectorEngine {
  static validateUrlSafety(inputUrl) {
    try {
      const parsed = new URL(inputUrl);

      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return { isSafe: false, error: 'Protocol must be HTTP or HTTPS' };
      }

      const hostname = parsed.hostname.toLowerCase();

      // Check loopback
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.localhost')
      ) {
        return { isSafe: false, error: 'Access to loopback addresses is strictly prohibited' };
      }

      // Check cloud metadata IP
      if (hostname === '169.254.169.254') {
        return { isSafe: false, error: 'Access to cloud instance metadata is strictly prohibited' };
      }

      // Check private IPv4 ranges (RFC 1918)
      const ipParts = hostname.split('.').map(Number);
      if (ipParts.length === 4 && ipParts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
        if (ipParts[0] === 10) return { isSafe: false, error: 'Access to private network (10.0.0.0/8) is prohibited' };
        if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) return { isSafe: false, error: 'Access to private network (172.16.0.0/12) is prohibited' };
        if (ipParts[0] === 192 && ipParts[1] === 168) return { isSafe: false, error: 'Access to private network (192.168.0.0/16) is prohibited' };
      }

      return { isSafe: true };
    } catch {
      return { isSafe: false, error: 'Invalid URL format' };
    }
  }

  static generateIdempotencyKey(storeId, eventType, recordId) {
    return `odoo_sync:${storeId}:${eventType}:${recordId}`;
  }

  static adaptInvoicePayload(odooVersion, rawPayload) {
    const isV14 = odooVersion.startsWith('14.');
    const adapted = { ...rawPayload };

    if (isV14) {
      adapted['type'] = 'out_invoice';
      delete adapted['move_type'];
    } else {
      adapted['move_type'] = 'out_invoice';
      delete adapted['type'];
    }

    return adapted;
  }
}

module.exports = { OdooConnectorEngine };
