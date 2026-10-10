/**
 * @commerce/payments-pk
 * Pakistani Payment Gateways & Manual Transfers Engine
 * Author: Domain Master 7 (Payments Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 16 (Independent Red-Team & Audit Master)
 */

import * as crypto from 'crypto';

export interface JazzCashConfig {
  merchantId: string;
  password: string;
  integritySalt: string;
  returnUrl: string;
}

export interface EasypaisaConfig {
  storeId: string;
  hashKey: string;
  returnUrl: string;
}

export interface BankTransferConfig {
  bankName: string;
  accountTitle: string;
  accountNumberOrIban: string;
  raastId?: string;
  branchName?: string;
}

export class PakistanPaymentsEngine {
  /**
   * Generates JazzCash HMAC-SHA256 Secure Hash
   * JazzCash requires sorting all parameter values alphabetically by key and prefixing/appending salt.
   */
  static generateJazzCashSecureHash(
    params: Record<string, string>,
    integritySalt: string
  ): string {
    const sortedKeys = Object.keys(params)
      .filter((key) => key !== 'pp_SecureHash' && params[key] !== '')
      .sort();

    let messageString = integritySalt;
    for (const key of sortedKeys) {
      messageString += `&${params[key]}`;
    }

    return crypto
      .createHmac('sha256', integritySalt)
      .update(messageString)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Verifies JazzCash Webhook / IPN response payload
   */
  static verifyJazzCashCallback(
    payload: Record<string, string>,
    integritySalt: string
  ): boolean {
    const receivedHash = payload['pp_SecureHash'];
    if (!receivedHash) {
      return false;
    }

    const calculatedHash = this.generateJazzCashSecureHash(payload, integritySalt);
    return crypto.timingSafeEqual(
      Buffer.from(receivedHash),
      Buffer.from(calculatedHash)
    );
  }

  /**
   * Generates unique payment reference token for Bank / Raast transfers
   * Formatted to avoid ambiguous characters (O vs 0, I vs 1).
   */
  static generateTransferReference(orderNumber: string): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PAY-${orderNumber.replace(/[^A-Za-z0-9]/g, '')}-${token}`;
  }

  /**
   * Validates manual bank slip approval request
   */
  static validateStaffApproval(params: {
    staffUserId: string;
    orderId: string;
    expectedAmountMinor: bigint;
    confirmedAmountMinor: bigint;
    transactionReference: string;
  }): { approved: boolean; reason?: string } {
    if (!params.staffUserId) {
      return { approved: false, reason: 'Staff identity required for audit log' };
    }
    if (!params.transactionReference || params.transactionReference.trim().length < 4) {
      return { approved: false, reason: 'Valid bank transaction reference ID required' };
    }
    if (params.confirmedAmountMinor !== params.expectedAmountMinor) {
      return {
        approved: false,
        reason: `Amount mismatch: Expected ${params.expectedAmountMinor}, confirmed ${params.confirmedAmountMinor}`,
      };
    }
    return { approved: true };
  }
}
