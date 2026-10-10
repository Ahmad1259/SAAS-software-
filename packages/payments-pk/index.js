/**
 * @commerce/payments-pk (CommonJS)
 * Pakistani Payment Gateways & Manual Transfers Engine
 * Author: Domain Master 7 (Payments Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 16 (Independent Red-Team & Audit Master)
 */

const crypto = require('crypto');

class PakistanPaymentsEngine {
  static generateJazzCashSecureHash(params, integritySalt) {
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

  static verifyJazzCashCallback(payload, integritySalt) {
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

  static generateTransferReference(orderNumber) {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let token = '';
    for (let i = 0; i < 4; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `PAY-${orderNumber.replace(/[^A-Za-z0-9]/g, '')}-${token}`;
  }

  static validateStaffApproval(params) {
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

module.exports = { PakistanPaymentsEngine };
