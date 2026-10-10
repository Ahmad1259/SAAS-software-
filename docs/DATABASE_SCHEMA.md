# DATABASE SCHEMA SPECIFICATION & ENTITY RELATIONSHIPS

**Document Owner:** Domain Master 3 (Database & Multi-Tenancy Master)  
**Supervised by:** KING Agent  
**Status:** Approved for Gate 3 (Data Architecture & Model Definition)  
**Version:** 1.0.0  
**Database Engine:** PostgreSQL 15+ (with Row-Level Security)

---

## 1. Tenancy & Staff Entities

```sql
-- Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, SUSPENDED, TRIAL
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users (Platform & Tenant Staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization Memberships (RBAC)
CREATE TABLE organization_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'STAFF', -- OWNER, ADMIN, MANAGER, CASHIER, STAFF
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Stores (One tenant can own multiple stores)
CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    business_type VARCHAR(50) NOT NULL, -- RETAIL, RESTAURANT, WHOLESALE, SALON, SERVICE
    currency_code VARCHAR(3) NOT NULL DEFAULT 'PKR',
    logo_url TEXT,
    banner_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#0F172A',
    accent_color VARCHAR(20) DEFAULT '#3B82F6',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED, ARCHIVED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store Domains (Subdomains & Custom Domains)
CREATE TABLE store_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    domain VARCHAR(255) UNIQUE NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- VERIFIED, PENDING, FAILED
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Store Settings & Configuration
CREATE TABLE store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    delivery_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    whatsapp_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 2. Catalog & Inventory Entities

```sql
-- Product Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- Products & Services
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    product_type VARCHAR(50) NOT NULL DEFAULT 'PHYSICAL', -- PHYSICAL, SERVICE, DIGITAL
    base_price_minor BIGINT NOT NULL, -- In minor units (e.g., PKR paisas)
    compare_at_price_minor BIGINT,
    cost_price_minor BIGINT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    track_inventory BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, slug)
);

-- Product Variants (Size, Color, etc.)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, -- e.g., "Large / Blue"
    price_minor BIGINT NOT NULL,
    compare_at_price_minor BIGINT,
    cost_price_minor BIGINT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    option_values JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Restaurant Modifiers / Add-ons
CREATE TABLE product_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- e.g., "Extra Toppings", "Spice Level"
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    min_selections INT NOT NULL DEFAULT 0,
    max_selections INT NOT NULL DEFAULT 1,
    options JSONB NOT NULL DEFAULT '[]'::jsonb -- [{"name": "Extra Cheese", "price_minor": 15000}]
);

-- Inventory & Stock Tracking
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity_on_hand INT NOT NULL DEFAULT 0,
    quantity_reserved INT NOT NULL DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity_delta INT NOT NULL,
    movement_type VARCHAR(50) NOT NULL, -- ORDER_RESERVATION, FULFILLMENT, RESTOCK, ADJUSTMENT, RETURN
    reference_id UUID, -- order_id or adjustment_id
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Orders & Immutable Financial Snapshots

```sql
-- Customers (Scoped to store)
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(50) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, phone)
);

-- Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL, -- e.g., "ORD-2026-1001"
    status VARCHAR(50) NOT NULL DEFAULT 'PLACED', -- DRAFT, PLACED, CONFIRMED, PROCESSING, READY, SHIPPED, COMPLETED, CANCELLED
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID', -- UNPAID, AWAITING_PAYMENT, PAYMENT_SUBMITTED, PENDING_VERIFICATION, PAID, REFUNDED, FAILED
    fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'UNFULFILLED', -- UNFULFILLED, PARTIALLY_FULFILLED, FULFILLED, RETURNED
    currency_code VARCHAR(3) NOT NULL DEFAULT 'PKR',
    subtotal_minor BIGINT NOT NULL,
    tax_amount_minor BIGINT NOT NULL DEFAULT 0,
    delivery_fee_minor BIGINT NOT NULL DEFAULT 0,
    discount_amount_minor BIGINT NOT NULL DEFAULT 0,
    total_amount_minor BIGINT NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- JAZZCASH, EASYPAISA, BANK_TRANSFER, RAAST, COD, CASH
    customer_notes TEXT,
    shipping_address JSONB,
    billing_address JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, order_number)
);

-- Order Items (Immutable Historical Snapshot)
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    unit_price_minor BIGINT NOT NULL,
    quantity INT NOT NULL,
    tax_rate_percent NUMERIC(5,2) DEFAULT 0.00,
    discount_amount_minor BIGINT NOT NULL DEFAULT 0,
    total_price_minor BIGINT NOT NULL,
    selected_modifiers JSONB DEFAULT '[]'::jsonb
);

-- Order Status Audit Log
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Pakistani Payment & Financial Ledger Entities

```sql
-- Payment Configurations Per Store
CREATE TABLE payment_method_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    method_type VARCHAR(50) NOT NULL, -- JAZZCASH, EASYPAISA, BANK_TRANSFER, RAAST, COD
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    display_title VARCHAR(100) NOT NULL,
    customer_instructions TEXT,
    encrypted_credentials JSONB, -- Encrypted Merchant ID, Secret Salt, Password
    bank_details JSONB, -- Bank Name, Account Title, IBAN, Raast ID
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, method_type)
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    amount_minor BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'PKR',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, VERIFYING, PAID, FAILED, REFUNDED
    transaction_reference VARCHAR(255),
    idempotency_key VARCHAR(255) UNIQUE,
    proof_attachment_url TEXT,
    verified_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Operational Financial Ledger (Events)
CREATE TABLE financial_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
    event_type VARCHAR(50) NOT NULL, -- PAYMENT_RECEIVED, REFUND_ISSUED, COD_COLLECTED, EXPENSE_RECORDED
    amount_minor BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL,
    reference_entity VARCHAR(50) NOT NULL, -- order, payment, refund
    reference_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 5. Odoo ERP Integration Entities

```sql
-- Odoo Connections
CREATE TABLE integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    mode VARCHAR(20) NOT NULL DEFAULT 'CLIENT_OWNED', -- CLIENT_OWNED, CENTRALLY_MANAGED
    odoo_url TEXT NOT NULL,
    odoo_version VARCHAR(20), -- '14.0', '16.0', '17.0', '18.0'
    odoo_database VARCHAR(100) NOT NULL,
    encrypted_credentials JSONB NOT NULL, -- Encrypted username, API key / password
    status VARCHAR(50) NOT NULL DEFAULT 'DISCONNECTED', -- CONNECTED, FAILED, DISCONNECTED
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Odoo Company & Journal Mappings
CREATE TABLE integration_account_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID UNIQUE NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    odoo_company_id INT NOT NULL,
    sales_journal_id INT NOT NULL,
    receivable_account_id INT,
    cash_journal_id INT,
    bank_journal_id INT,
    default_tax_id INT,
    warehouse_id INT,
    is_confirmed_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Transactional Outbox (Reliable Sync Jobs)
CREATE TABLE integration_sync_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    connection_id UUID NOT NULL REFERENCES integration_connections(id) ON DELETE CASCADE,
    event_type VARCHAR(100) NOT NULL, -- SYNC_CUSTOMER, SYNC_ORDER, SYNC_INVOICE, SYNC_PAYMENT
    internal_record_id UUID NOT NULL,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, SUCCEEDED, RETRY_SCHEDULED, FAILED, DEAD_LETTER
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    next_retry_at TIMESTAMPTZ,
    last_error TEXT,
    external_record_id VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sync Audit Logs
CREATE TABLE integration_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    sync_job_id UUID REFERENCES integration_sync_jobs(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    request_summary JSONB,
    response_summary JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. SaaS Rental Subscription Entities

```sql
-- Subscription Plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL, -- STARTER, BUSINESS, PREMIUM, ENTERPRISE
    name VARCHAR(100) NOT NULL,
    price_monthly_minor BIGINT NOT NULL,
    price_yearly_minor BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'PKR',
    entitlements JSONB NOT NULL DEFAULT '{}'::jsonb, -- max_products, staff_seats, custom_domain, odoo_sync
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenant Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID UNIQUE NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    billing_interval VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, YEARLY
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- TRIAL, ACTIVE, GRACE_PERIOD, SUSPENDED, CANCELLED
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    grace_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- SaaS Rental Invoices (SaaS Operator Revenue Only)
CREATE TABLE rental_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount_minor BIGINT NOT NULL,
    currency_code VARCHAR(3) NOT NULL DEFAULT 'PKR',
    status VARCHAR(50) NOT NULL DEFAULT 'UNPAID', -- UNPAID, PAID, OVERDUE, VOID
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
