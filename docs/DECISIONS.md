# ARCHITECTURAL DECISION RECORDS (ADR)

**Project:** Commerce Cloud (Multi-Tenant Commerce SaaS)

---

## ADR-001: Technology Stack — Next.js Modular Monolith with TypeScript

### Context
The platform requires five delivery interfaces:
1. SaaS Public Landing & Onboarding
2. Store Owner Administration Dashboard
3. High-Performance Multi-Tenant Public Storefronts (subdomain & custom domain)
4. SaaS Super-Admin Panel
5. Scaffolding for PWA & Native apps (Expo/React Native)

Budget during early phase is close to zero. We need maximum maintainability, code reuse, type safety, and zero unnecessary infrastructure overhead.

### Decision
- **Framework:** Next.js (App Router) + TypeScript + Tailwind CSS.
- **Architecture:** Modular Monolith with strict separation of modules:
  - `@commerce/core` (tenancy, catalog, orders, inventory)
  - `@commerce/payments` (JazzCash, Easypaisa, Bank/Raast, COD, ledger)
  - `@commerce/odoo` (XML-RPC/JSON-RPC adapters, mapping engine, outbox sync)
  - `@commerce/subscriptions` (SaaS rental billing, usage limits, grace periods)
- **Database Layer:** PostgreSQL with TypeScript ORM (Prisma or Drizzle), enforcing strict tenant foreign keys, transactions for order/inventory operations, and exact integer minor-unit math for currency (PKR Paisas, USD Cents).

### Consequences
- Rapid development with zero microservice deployment overhead.
- Clear module boundaries allow decomposing into worker services or separate microservices in the future if scale warrants.

---

## ADR-002: Tenant Isolation Strategy

### Context
A core requirement is zero-leakage tenant isolation across stores, products, orders, customers, financial records, Odoo credentials, and background sync jobs.

### Decision
1. **Hierarchical Ownership:** `Tenant (Organization)` -> `Stores` -> `Store Resources`.
2. **Double-Barreled Authorization:** Every API handler, server action, and database query must resolve user identity from verified server sessions, look up verified organization membership, and scope all database operations by `tenant_id` and `store_id`.
3. **Defense in Depth:** In addition to application-level scoping, PostgreSQL Row-Level Security (RLS) policies are defined on all tenant-owned tables using session variables (`SET LOCAL app.current_tenant_id = '...'`).
4. **Encrypted Secrets:** External credentials (Odoo passwords/API keys, JazzCash/Easypaisa merchant credentials) are encrypted at rest using AES-256-GCM with tenant-isolated salt/key derivation.

---

## ADR-003: Financial Event Model & Currency Handling

### Context
Floating-point math in financial systems leads to compounding rounding errors. Furthermore, store sales are not automatically earned SaaS platform revenue, and orders are distinct from payments, invoices, and accounting journals.

### Decision
1. **Exact Representation:** All monetary fields stored as 64-bit integers in minor units (e.g. PKR paisas, 100 paisas = 1 PKR) alongside ISO-4217 currency code (`PKR`, `USD`).
2. **Three-Layer Financial Separation:**
   - *Layer 1 — Commerce Records:* Orders, line item immutable price snapshots, discount codes, shipping fees.
   - *Layer 2 — Operational Financial Events:* Verified payment attempts, confirmed receipts, refunds, COD collections, manual bank verifications.
   - *Layer 3 — Official Accounting (Odoo):* Customer invoices, credit notes, account moves, bank reconciliation.
3. **SaaS Rental Ledger Isolation:** Platform rental subscription billing records are isolated in SaaS billing tables and never mixed with tenant store sales ledgers.

---

## ADR-004: Pakistan Payment Gateways & Manual Transfers Architecture

### Context
Pakistani commerce relies heavily on Cash on Delivery (COD), Direct Bank Transfer / Raast, and local digital mobile wallets (JazzCash, Easypaisa), with emerging card gateway support.

### Decision
Support three distinct modes per store:
1. **Automated Gateway (JazzCash / Easypaisa / PayFast / Safepay):** Server-side cryptographic HMAC-SHA256 signature verification, webhook handling with idempotent transaction recording. Never trust client redirects.
2. **Manual Bank Transfer / Raast / Mobile Wallet:** Merchant configures bank name, IBAN, account title, or wallet number. System generates unique transaction reference token. Customer submits payment reference and optional receipt. Authorized store staff verifies and confirms or rejects with an audit trail.
3. **Cash on Delivery (COD):** Separate states for Order Placed, Out for Delivery, Cash Collected, and Settled.

---

## ADR-005: Odoo Connector & Version-Adaptive Architecture

### Context
Clients run different Odoo versions (Odoo 14, 15, 16, 17, 18), editions (Community vs Enterprise), and hosting models (Client-owned vs Centrally managed SaaS Odoo). Some have external XML-RPC/JSON-RPC enabled, others use custom modules.

### Decision
1. **Version Adapter Interface:** Universal contract (`IOdooConnector`) implemented by version-specific adapters (`OdooV14Adapter`, `OdooV16Adapter`, `OdooV17PlusAdapter`).
2. **Capability Detection:** Safe, read-only pre-flight inspection of Odoo version, installed modules (`sale`, `account`, `stock`), and company permissions before any sync is attempted.
3. **Transactional Outbox Engine:** Sync events are committed to a local `integration_sync_jobs` table in the same DB transaction as order/payment creation. Asynchronous workers process jobs with bounded exponential backoff, circuit breaking, idempotency keys, and reconciliation audit logs.
