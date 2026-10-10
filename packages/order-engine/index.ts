/**
 * @commerce/order-engine
 * Server-Side Order Validation, Pricing Snapshots, and State Machine
 * Author: Domain Master 6 (Commerce & Takeaway Master)
 * Supervised by: KING Agent
 */

import {
  OrderItemSnapshot,
  OrderStatus,
  PaymentStatus,
  FulfillmentStatus,
  PaymentMethodType,
  CurrencyCode,
  ValidatedOrderResult,
} from '../core-types';

export interface CatalogProductLookup {
  id: string;
  name: string;
  sku?: string;
  basePriceMinor: bigint;
  isActive: boolean;
  trackInventory: boolean;
  quantityOnHand: number;
  modifiers?: Array<{
    name: string;
    isRequired: boolean;
    minSelections: number;
    maxSelections: number;
    options: Array<{
      name: string;
      priceMinor: bigint;
    }>;
  }>;
  variants?: Array<{
    id: string;
    title: string;
    sku?: string;
    priceMinor: bigint;
    quantityOnHand: number;
  }>;
}

export interface CatalogLookupService {
  findProductById(productId: string): Promise<CatalogProductLookup | null>;
}

export class OrderCalculationEngine {
  constructor(private catalog: CatalogLookupService) {}

  /**
   * Validates cart line items strictly on the server.
   * Completely ignores any client-supplied prices or discounts to prevent price tampering.
   */
  async validateAndCalculateOrder(params: {
    storeId: string;
    currency: CurrencyCode;
    deliveryFeeMinor: bigint;
    paymentMethod: PaymentMethodType;
    items: Array<{
      productId: string;
      variantId?: string;
      quantity: number;
      selectedModifiers?: Array<{
        groupName: string;
        optionName: string;
      }>;
    }>;
  }): Promise<ValidatedOrderResult> {
    if (!params.items || params.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const snapshots: OrderItemSnapshot[] = [];
    let subtotalMinor = 0n;

    for (const item of params.items) {
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        throw new Error(`Invalid item quantity: ${item.quantity}`);
      }

      const product = await this.catalog.findProductById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      if (!product.isActive) {
        throw new Error(`Product is currently inactive: ${product.name}`);
      }

      let unitPriceMinor = product.basePriceMinor;
      let title = product.name;
      let sku = product.sku;

      // Handle variant pricing if applicable
      if (item.variantId) {
        const variant = product.variants?.find((v) => v.id === item.variantId);
        if (!variant) {
          throw new Error(`Variant not found: ${item.variantId} for product ${product.name}`);
        }
        unitPriceMinor = variant.priceMinor;
        title = `${product.name} - ${variant.title}`;
        sku = variant.sku || sku;
      }

      // Handle modifiers (e.g., restaurant extra toppings)
      let modifierTotalMinor = 0n;
      const verifiedModifiers: Array<{ groupName: string; optionName: string; priceMinor: bigint }> = [];

      if (item.selectedModifiers && item.selectedModifiers.length > 0) {
        for (const modSelection of item.selectedModifiers) {
          const group = product.modifiers?.find((m) => m.name === modSelection.groupName);
          if (!group) {
            throw new Error(`Modifier group not found: ${modSelection.groupName}`);
          }
          const option = group.options.find((o) => o.name === modSelection.optionName);
          if (!option) {
            throw new Error(`Modifier option not found: ${modSelection.optionName} in group ${group.name}`);
          }
          modifierTotalMinor += option.priceMinor;
          verifiedModifiers.push({
            groupName: group.name,
            optionName: option.name,
            priceMinor: option.priceMinor,
          });
        }
      }

      const effectiveUnitPriceMinor = unitPriceMinor + modifierTotalMinor;
      const lineTotalMinor = effectiveUnitPriceMinor * BigInt(item.quantity);
      subtotalMinor += lineTotalMinor;

      snapshots.push({
        id: `item-${Math.random().toString(36).substring(2, 9)}`,
        productId: product.id,
        variantId: item.variantId,
        title,
        sku,
        unitPriceMinor: effectiveUnitPriceMinor,
        quantity: item.quantity,
        taxRatePercent: 0,
        discountAmountMinor: 0n,
        totalPriceMinor: lineTotalMinor,
        selectedModifiers: verifiedModifiers,
      });
    }

    const taxAmountMinor = 0n;
    const discountAmountMinor = 0n;
    const totalAmountMinor = subtotalMinor + params.deliveryFeeMinor + taxAmountMinor - discountAmountMinor;

    const initialPaymentStatus: PaymentStatus =
      params.paymentMethod === 'COD' ? 'AWAITING_PAYMENT' : 'UNPAID';

    return {
      storeId: params.storeId,
      orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
      currency: params.currency,
      items: snapshots,
      subtotalMinor,
      taxAmountMinor,
      deliveryFeeMinor: params.deliveryFeeMinor,
      discountAmountMinor,
      totalAmountMinor,
      paymentMethod: params.paymentMethod,
      status: 'PLACED',
      paymentStatus: initialPaymentStatus,
      fulfillmentStatus: 'UNFULFILLED',
    };
  }
}
