/**
 * @commerce/saas-billing
 * SaaS Platform Rental Subscription Engine & Entitlement Verification
 * Author: Domain Master 10 (Subscriptions Master) & Domain Master 9 (Accounting Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 16 (Red-Team Auditor)
 */

class SaasSubscriptionEngine {
  static PLANS = {
    STARTER: {
      code: 'STARTER',
      name: 'Starter Tier',
      priceMonthlyMinor: 300000n, // PKR 3,000 / month
      entitlements: {
        maxProducts: 25,
        staffSeats: 2,
        customDomainAllowed: false,
        odooSyncAllowed: false
      }
    },
    BUSINESS: {
      code: 'BUSINESS',
      name: 'Business Pro',
      priceMonthlyMinor: 750000n, // PKR 7,500 / month
      entitlements: {
        maxProducts: 150,
        staffSeats: 10,
        customDomainAllowed: true,
        odooSyncAllowed: true
      }
    },
    ENTERPRISE: {
      code: 'ENTERPRISE',
      name: 'Enterprise / Multi-Branch',
      priceMonthlyMinor: 2000000n, // PKR 20,000 / month
      entitlements: {
        maxProducts: 5000,
        staffSeats: 50,
        customDomainAllowed: true,
        odooSyncAllowed: true
      }
    }
  };

  /**
   * Evaluates if a tenant's subscription plan permits adding another product
   */
  static canAddProduct(subscription, currentProductCount) {
    if (subscription.status === 'SUSPENDED') {
      return { allowed: false, reason: 'Store subscription is suspended due to unpaid rental invoice' };
    }

    const plan = this.PLANS[subscription.planCode] || this.PLANS.STARTER;
    if (currentProductCount >= plan.entitlements.maxProducts) {
      return {
        allowed: false,
        reason: `Plan limit reached: Maximum ${plan.entitlements.maxProducts} products allowed on ${plan.name}. Please upgrade your plan.`
      };
    }

    return { allowed: true };
  }

  /**
   * Evaluates if Odoo synchronization is authorized under the tenant's rental tier
   */
  static canUseOdoo(subscription) {
    if (subscription.status === 'SUSPENDED') {
      return { allowed: false, reason: 'Subscription suspended' };
    }

    const plan = this.PLANS[subscription.planCode] || this.PLANS.STARTER;
    if (!plan.entitlements.odooSyncAllowed) {
      return {
        allowed: false,
        reason: `Odoo ERP Integration requires Business Pro or Enterprise tier. Current plan: ${plan.name}.`
      };
    }

    return { allowed: true };
  }

  /**
   * Generates a monthly platform rental invoice for the SaaS operator
   * CRITICAL INVARIANT: This invoice belongs to the SaaS Operator's company account,
   * completely segregated from the tenant store's sales revenue.
   */
  static generateRentalInvoice(tenantId, subscription) {
    const plan = this.PLANS[subscription.planCode] || this.PLANS.STARTER;
    const invoiceNumber = `INV-SAAS-${Date.now().toString(36).toUpperCase()}`;

    return {
      invoiceNumber,
      tenantId,
      amountMinor: plan.priceMonthlyMinor,
      currency: 'PKR',
      status: 'UNPAID',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days grace
      issuedAt: new Date().toISOString()
    };
  }
}

module.exports = { SaasSubscriptionEngine };
