/**
 * @commerce/auth
 * Multi-Tenant Authentication & Role-Based Access Control (RBAC) Engine
 * Author: Domain Master 11 (Security Master) & Domain Master 4 (Backend Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 16 (Red-Team Auditor)
 */

import * as crypto from 'crypto';

export type UserRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'CHEF' | 'RIDER' | 'CASHIER' | 'STAFF';

export interface AuthenticatedSession {
  userId: string;
  email: string;
  tenantId: string;
  storeId: string;
  role: UserRole;
  isPlatformAdmin: boolean;
  issuedAt: number;
  expiresAt: number;
}

export interface PermissionCheck {
  canManageProducts: boolean;
  canViewAllOrders: boolean;
  canUpdateCookingStatus: boolean;
  canDispatchDelivery: boolean;
  canManageStoreSettings: boolean;
  canManageOdoo: boolean;
  canManageBilling: boolean;
}

export class MultiTenantAuthEngine {
  private secretKey: string;

  constructor(secretKey: string) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error('JWT Secret key must be at least 32 characters long');
    }
    this.secretKey = secretKey;
  }

  /**
   * Hashes user passwords using PBKDF2 with a cryptographic salt (OWASP Recommended)
   */
  static hashPassword(password: string): { hash: string; salt: string } {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { hash, salt };
  }

  /**
   * Verifies password against stored hash & salt
   */
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(verifyHash));
  }

  /**
   * Generates a signed, tamper-evident session token containing verified tenant context
   */
  createSessionToken(session: AuthenticatedSession): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(`${header}.${payload}`)
      .digest('base64url');

    return `${header}.${payload}.${signature}`;
  }

  /**
   * Validates and unpacks session token. Rejects expired, altered, or unsigned tokens.
   */
  verifySessionToken(token: string): AuthenticatedSession {
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

    const session: AuthenticatedSession = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    if (Date.now() > session.expiresAt) {
      throw new Error('Session has expired');
    }

    return session;
  }

  /**
   * Role-Based Access Control (RBAC) Matrix
   * Maps roles (Owner, Chef, Rider, etc.) to granular capabilities.
   */
  static getPermissions(role: UserRole, isPlatformAdmin = false): PermissionCheck {
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
          canViewAllOrders: false, // Chef only sees KDS active cooking queue
          canUpdateCookingStatus: true,
          canDispatchDelivery: false,
          canManageStoreSettings: false,
          canManageOdoo: false,
          canManageBilling: false,
        };

      case 'RIDER':
        return {
          canManageProducts: false,
          canViewAllOrders: false, // Rider only sees assigned deliveries
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
