/**
 * @commerce/core-types
 * Universal Domain Types & Invariants for Commerce Cloud
 * Author: Domain Master 2 (Architecture Master) & Domain Master 4 (Backend Master)
 * Supervised by: KING Agent
 */

export type BusinessType = 'RETAIL' | 'RESTAURANT' | 'WHOLESALE' | 'SALON' | 'SERVICE';
export type CurrencyCode = 'PKR' | 'USD' | 'AED' | 'GBP';

export type OrderStatus =
  | 'DRAFT'
  | 'PLACED'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'READY_FOR_PICKUP'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentStatus =
  | 'UNPAID'
  | 'AWAITING_PAYMENT'
  | 'PAYMENT_SUBMITTED'
  | 'PENDING_VERIFICATION'
  | 'PAID'
  | 'PARTIALLY_REFUNDED'
  | 'REFUNDED'
  | 'FAILED';

export type FulfillmentStatus =
  | 'UNFULFILLED'
  | 'PARTIALLY_FULFILLED'
  | 'FULFILLED'
  | 'RETURNED';

export type PaymentMethodType =
  | 'JAZZCASH'
  | 'EASYPAISA'
  | 'BANK_TRANSFER'
  | 'RAAST'
  | 'COD'
  | 'CASH'
  | 'CARD_GATEWAY';

export interface MoneyMinor {
  amountMinor: bigint; // Minor units: 100 paisas = 1 PKR
  currency: CurrencyCode;
}

export interface SelectedModifierOption {
  groupName: string;
  optionName: string;
  priceMinor: bigint;
}

export interface OrderItemSnapshot {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  sku?: string;
  unitPriceMinor: bigint;
  quantity: number;
  taxRatePercent: number;
  discountAmountMinor: bigint;
  totalPriceMinor: bigint;
  selectedModifiers?: SelectedModifierOption[];
}

export interface OrderValidationInput {
  storeId: string;
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
    selectedModifiers?: Array<{
      groupName: string;
      optionName: string;
    }>;
  }>;
  customerNotes?: string;
  shippingAddress?: {
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    provinceState?: string;
    postalCode?: string;
  };
  deliveryZoneId?: string;
  paymentMethod: PaymentMethodType;
}

export interface ValidatedOrderResult {
  storeId: string;
  orderNumber: string;
  currency: CurrencyCode;
  items: OrderItemSnapshot[];
  subtotalMinor: bigint;
  taxAmountMinor: bigint;
  deliveryFeeMinor: bigint;
  discountAmountMinor: bigint;
  totalAmountMinor: bigint;
  paymentMethod: PaymentMethodType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
}
