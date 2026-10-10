/**
 * @commerce/odoo-connector
 * Adaptive Odoo XML-RPC / JSON-RPC Connector with Outbox Engine
 * Author: Domain Master 8 (Odoo Integration Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 9 (Accounting Master) & Domain Master 16 (Red-Team)
 */

export interface OdooConnectionCredentials {
  url: string;
  database: string;
  username: string;
  apiKeyOrPassword: string;
}

export interface OdooCapability {
  version: string;
  protocol: 'XML-RPC' | 'JSON-RPC';
  hasSalesModule: boolean;
  hasAccountModule: boolean;
  hasStockModule: boolean;
  authorizedCompanies: Array<{ id: number; name: string }>;
}

export class OdooConnectorEngine {
  /**
   * SSRF Protection: Strictly validates external Odoo instance URL
   * Blocks private, loopback, and cloud metadata network ranges.
   */
  static validateUrlSafety(inputUrl: string): { isSafe: boolean; error?: string } {
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

      // Check AWS/GCP/Azure link-local metadata IP
      if (hostname === '169.254.169.254') {
        return { isSafe: false, error: 'Access to cloud instance metadata is strictly prohibited' };
      }

      // Check private IPv4 ranges (RFC 1918)
      const ipParts = hostname.split('.').map(Number);
      if (ipParts.length === 4 && ipParts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
        // 10.0.0.0/8
        if (ipParts[0] === 10) {
          return { isSafe: false, error: 'Access to private network (10.0.0.0/8) is prohibited' };
        }
        // 172.16.0.0/12
        if (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) {
          return { isSafe: false, error: 'Access to private network (172.16.0.0/12) is prohibited' };
        }
        // 192.168.0.0/16
        if (ipParts[0] === 192 && ipParts[1] === 168) {
          return { isSafe: false, error: 'Access to private network (192.168.0.0/16) is prohibited' };
        }
      }

      return { isSafe: true };
    } catch {
      return { isSafe: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Generates deterministic idempotency key for Odoo sync events
   */
  static generateIdempotencyKey(storeId: string, eventType: string, recordId: string): string {
    return `odoo_sync:${storeId}:${eventType}:${recordId}`;
  }

  /**
   * Version adapter field translator
   * In Odoo 14, customer invoices use `type='out_invoice'`.
   * In Odoo 15-18, customer invoices use `move_type='out_invoice'`.
   */
  static adaptInvoicePayload(odooVersion: string, rawPayload: Record<string, any>): Record<string, any> {
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
