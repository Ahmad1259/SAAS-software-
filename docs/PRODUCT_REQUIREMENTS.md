# PRODUCT REQUIREMENTS DOCUMENT (PRD) — COMMERCE CLOUD

**Document Owner:** Domain Master 1 (Product Strategy & Requirements)  
**Supervised by:** KING Agent  
**Status:** Approved for Gate 1 (MVP Foundation)  
**Version:** 1.0.0  
**Target Market:** Pakistan First (PKR, JazzCash, Easypaisa, Bank Transfer, Raast, COD) followed by International (Multi-Currency, Stripe/Cards)

---

## 1. Executive Summary & Vision

Commerce Cloud is a multi-tenant commerce SaaS platform designed to allow a SaaS operator (platform owner) to provision, customize, and rent independent e-commerce storefronts to diverse business owners (tenants).

Unlike single-tenant store generators or generic web builders:
1. One central platform operates all tenant stores with strict, impenetrable data isolation.
2. The platform accommodates distinct business models (Restaurants/Cafes, Retail, Wholesale, Salons/Appointment-based Services) without duplicating core checkout and database logic.
3. It provides deep, configurable, bi-directional integration with Odoo ERP (Odoo 14 through 18, Community & Enterprise), keeping commerce operations synchronized with official corporate accounting ledgers.
4. It accommodates local Pakistani financial realities out of the box (JazzCash, Easypaisa, Direct Bank Transfer / Raast slips, and Cash on Delivery with strict reconciliation).

---

## 2. User Personas & Roles

### 2.1 Platform Super-Administrator (SaaS Founder)
- **Role:** Full platform oversight.
- **Capabilities:**
  - Create and configure tenant organizations.
  - Assign subscription plans (Starter, Business, Premium, Enterprise).
  - Suspend or activate stores based on rental subscription status.
  - Monitor global system health, Odoo synchronization errors, and audit events.
  - Zero unauthorized browsing of tenants' private accounting details without explicit operational reason and audit logging.

### 2.2 Store Owner / Merchant (Tenant Admin)
- **Role:** Business owner renting a store.
- **Capabilities:**
  - Full management of catalog (products, categories, variants, restaurant modifiers).
  - Manage orders, fulfillments, cancellations, and customer communications.
  - Configure payment options (Merchant's own JazzCash/Easypaisa API keys, Bank/Raast transfer instructions, COD toggles).
  - Configure store branding (logo, colors, typography, layout sections).
  - Configure staff accounts and assign roles.
  - Connect and map their own Odoo ERP instance (Mode A) or configure SaaS-managed Odoo (Mode B).
  - Manage subscription payments and rental invoices.

### 2.3 Store Staff (Operator / Cashier / Kitchen Staff)
- **Role:** Operational staff within a specific store.
- **Capabilities:**
  - Read-only or scoped write access: view orders, update fulfillment states (e.g., "Cooking", "Out for Delivery", "Delivered"), verify bank transfer receipts, record COD cash collections.
  - Restricted from store financial settings, billing, or Odoo credentials.

### 2.4 End Customer (Shopper / Diner / Client)
- **Role:** Public user buying from a tenant's storefront.
- **Capabilities:**
  - Browse mobile-optimized catalog with instant search and category navigation.
  - Add items with variants and add-on modifiers to cart.
  - Choose delivery or in-store pickup with estimated delivery zone calculations.
  - Checkout with guest mode or authenticated customer account.
  - Pay via configured options (JazzCash, Easypaisa, Bank Transfer with slip upload, COD).
  - Receive automated status notifications and WhatsApp pre-filled order handoff links.

---

## 3. Product Workflows & Feature Specifications

### 3.1 Store Provisioning & Multi-Tenancy
- **Organization Hierarchy:** Organization (`Tenant`) -> Stores (`Store`) -> Store Domains (`Subdomain` / `Custom Domain`).
- **Domain Routing:** Requests to `store-slug.commercecloud.pk` or verified custom domains (`shop.brand.com`) resolve directly to the specific store's published theme and catalog.
- **Tenant Isolation:** Every protected resource is scoped by `tenant_id` and `store_id`. Server-side authentication and PostgreSQL Row-Level Security (RLS) reject any cross-tenant data access.

### 3.2 Dynamic Catalog & Industry Profiles
1. **Retail & Wholesale:**
   - Multi-option variants (Size, Color, Material) with independent SKU, price, and stock levels.
   - Tiered bulk pricing (e.g., 1–9 units = PKR 1,500; 10+ units = PKR 1,200) and Minimum Order Quantities (MOQ).
2. **Restaurants & Cafes:**
   - Menu categorization, item add-ons and modifiers (e.g., "Extra Cheese", "Spice Level"), special preparation instructions, pickup vs. delivery selection, operating hours.
3. **Salons & Services:**
   - Service listings with duration, booking date/time slots, customer requirements, appointment confirmation workflows.

### 3.3 Server-Side Order Processing & Lifecycle
- **Tamper-Proof Validation:** All line-item prices, taxes, delivery fees, and promo discounts are computed and validated exclusively on the server. Client-submitted prices are discarded.
- **Line-Item Snapshots:** Order items freeze the exact title, SKU, unit price, tax rate, and variant options at the instant of order placement.
- **State Machine:**
  - *Order States:* `DRAFT` -> `PLACED` -> `CONFIRMED` -> `PROCESSING` -> `READY_FOR_PICKUP` / `SHIPPED` -> `COMPLETED` (or `CANCELLED` / `REFUNDED`).
  - *Payment States:* `UNPAID` -> `AWAITING_PAYMENT` -> `PAYMENT_SUBMITTED` -> `PENDING_VERIFICATION` -> `PAID` -> `PARTIALLY_REFUNDED` -> `REFUNDED` -> `FAILED`.

### 3.4 Pakistani Payment Engine & Reconciliation
1. **Mode 1 — Automated Gateway (JazzCash & Easypaisa):**
   - Server-to-server cryptographic HMAC-SHA256 signature calculation and verification.
   - Webhook processing with idempotency keys. Never trust browser redirect URLs.
2. **Mode 2 — Manual Bank Transfer / Raast / Mobile Wallet:**
   - Display merchant's verified bank title, IBAN, bank name, or Raast ID.
   - Generate unique transaction reference token (e.g., `ORD-9821-X9K`).
   - Customer submits bank transaction reference and receipt image upload.
   - Status set to `PENDING_VERIFICATION`. Authorized staff reviews bank statement and approves/rejects with audit logging.
3. **Mode 3 — Cash on Delivery (COD):**
   - Track delivery agent / courier assignment, cash collected, and settlement.

### 3.5 Odoo ERP Integration (Version-Adaptive 14–18)
- **Mode A (Client-Owned):** Secure URL entry with strict SSRF defense (blocking private IPs and loopback), credential testing, version discovery, company selection.
- **Mode B (Centrally Managed):** Managed multi-company or dedicated instance mapping.
- **Mapping Wizard:** Map sales journals, receivable accounts, tax rates, payment journals, and warehouse locations.
- **Transactional Outbox Engine:** Order creation transactionally registers sync jobs in `integration_sync_jobs`. Asynchronous sync worker handles XML-RPC/JSON-RPC operations with exponential backoff and idempotency.

### 3.6 SaaS Rental Subscriptions
- **Tiers:** Starter, Business, Premium, Enterprise.
- **Entitlements:** Max products, custom domains, staff seats, Odoo integration access, transaction fees.
- **Grace Period & Non-Destructive Suspension:** When subscription expires, store enters read-only grace period. After grace period, public storefront checkout is paused, but all historical orders, invoices, and data remain intact.
