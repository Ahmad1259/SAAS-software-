/**
 * @commerce/auth (CommonJS distribution)
 * Multi-Tenant Authentication & Role-Based Access Control (RBAC) Engine
 * Author: Domain Master 11 (Security Master) & Domain Master 4 (Backend Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 16 (Red-Team Auditor)
 */

const crypto = require('crypto');

class MultiTenantAuthEngine {
  constructor(secretKey) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error('JWT Secret key must be at least 32 characters long');
    }
    this.secretKey = secretKey;
  }

  static hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  static verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
  }

  createSessionToken(session) {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  verifySessionToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token structure');
    }

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw new Error('Cryptographic signature verification failed');
    }

    const session = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    if (Date.now() > session.expiresAt) {
      throw new Error('Session has expired');
    }

    return session;
  }

  static getPermissions(role, isPlatformAdmin = false) {
    if (isPlatformAdmin) {
      return {
        canManageProducts: true,
        canViewAllOrders: true,
        canUpdateCookingStatus: true,
        canDispatchDelivery: true,
        canManageStoreSettings: true,
        canManageOdoo: true,
        canManageBilling: true,
      };
    }

    switch (role) {
      case 'OWNER':
      case 'ADMIN':
        return {
          canManageProducts: true,
          canViewAllOrders: true,
          canUpdateCookingStatus: true,
          canDispatchDelivery: true,
          canManageStoreSettings: true,
          canManageOdoo: true,
          canManageBilling: true,
        };

      case 'MANAGER':
        return {
          canManageProducts: true,
          canViewAllOrders: true,
          canUpdateCookingStatus: true,
          canDispatchDelivery: true,
          canManageStoreSettings: false,
          canManageOdoo: false,
          canManageBilling: false,
        };

      case 'CHEF':
        return {
          canManageProducts: false,
          canViewAllOrders: false,
          canUpdateCookingStatus: true,
          canDispatchDelivery: false,
          canManageStoreSettings: false,
          canManageOdoo: false,
          canManageBilling: false,
        };

      case 'RIDER':
        return {
          canManageProducts: false,
          canViewAllOrders: false,
          canUpdateCookingStatus: false,
          canDispatchDelivery: true,
          canManageStoreSettings: false,
          canManageOdoo: false,
          canManageBilling: false,
        };

      default:
        return {
          canManageProducts: false,
          canViewAllOrders: false,
          canUpdateCookingStatus: false,
          canDispatchDelivery: false,
          canManageStoreSettings: false,
          canManageOdoo: false,
          canManageBilling: false,
        };
    }
  }
}

module.exports = { MultiTenantAuthEngine };
