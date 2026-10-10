# SYSTEM ARCHITECTURE SPECIFICATION

**Document Owner:** Domain Master 2 (Chief Software Architect)  
**Supervised by:** KING Agent  
**Status:** Approved for Gate 2 (System Design & Contracts)  
**Version:** 1.0.0

---

## 1. High-Level Architecture: Modular Monolith

To achieve maximum stability, velocity, and near-zero early operating costs while avoiding the complexities of premature microservices, Commerce Cloud is designed as a **TypeScript Next.js (App Router) Modular Monolith**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER BOUNDARY                     │
├──────────────────────┬────────────────────┬────────────────────────────┤
│   SAAS PLATFORM      │    TENANT ADMIN    │      PUBLIC STOREFRONT     │
│   • Landing page     │    • /admin        │      • Subdomains          │
│   • Onboarding       │    • Products      │        (tenant.domain.pk)  │
│   • Super-admin      │    • Orders        │      • Custom domains      │
│   • SaaS Billing     │    • Odoo mapping  │      • Mobile-first SSR    │
│   • Subscriptions    │    • Gateways      │      • Cart & Checkout     │
└──────────┬───────────┴──────────┬─────────┴─────────────┬──────────────┘
           │                      │                       │
┌──────────▼──────────────────────▼───────────────────────▼──────────────┐
│                           CORE DOMAIN PACKAGES                         │
├────────────────────────────────────────────────────────────────────────┤
│ • @commerce/core-db        - PostgreSQL schemas, Drizzle/Prisma, RLS   │
│ • @commerce/auth           - Session tokens, tenant resolution, RBAC   │
│ • @commerce/catalog        - Products, variants, modifiers, inventory  │
│ • @commerce/order-engine   - Server-side checkout & state machines     │
│ • @commerce/finance-ledger - Minor-unit ledger, taxes, financial events│
│ • @commerce/payments-pk    - JazzCash, Easypaisa, Bank/Raast, COD      │
│ • @commerce/odoo-connector - Version-adaptive XML-RPC/JSON-RPC, outbox │
│ • @commerce/subscriptions  - Tenant rental plans, billing, entitlements│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│                    POSTGRESQL MULTI-TENANT DATABASE                    │
│   - Enforced foreign keys, unique constraint idempotency               │
│   - Row-Level Security (RLS) defense in depth                          │
│   - Transactional Outbox for asynchronous Odoo synchronization         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Domain Boundaries & Dependency Rules

1. **Strict Layering:**
   - Presentation layer (React UI / Server Actions) depends only on Domain Modules.
   - Domain Modules depend on Core Services and Database Client.
   - Domain Modules never circularly depend on each other.
2. **Financial Boundaries:**
   - Payment operations cannot directly mutate order status without writing to the `financial_events` ledger.
   - SaaS rental subscription billing is completely partitioned from merchant store transaction accounts.
3. **Odoo Isolation:**
   - Core checkout and order operations have zero direct runtime dependency on Odoo availability.
   - All Odoo operations are dispatched through the transactional outbox (`integration_sync_jobs`). If Odoo is down or slow, customer checkout proceeds instantly without interruption.

---

## 3. Asynchronous Reliable Outbox Pattern

```
[Customer Checkout] ──(DB Transaction)──> [1. Save Order]
                                        [2. Reserve Stock]
                                        [3. Insert Outbox Event]
                                                    │
                                                    ▼
                                       `integration_sync_jobs`
                                                    │
                                         (Worker Process)
                                                    │
                                    ┌───────────────▼──────────────┐
                                    │ Adaptive Odoo Connector      │
                                    │ • Read-only capability check │
                                    │ • XML-RPC / JSON-RPC dispatch│
                                    │ • Idempotent external key    │
                                    └───────────────┬──────────────┘
                                                    │
                                  ┌─────────────────┴────────────────┐
                                  ▼                                  ▼
                            [Success: Record Ext ID]       [Failure: Bounded Exp Backoff]
```

---

## 4. Multi-Tenant Subdomain & Custom Domain Routing

1. **Subdomain Detection:** Middleware parses the incoming Host header (`slug.commercecloud.pk`).
2. **Custom Domain Resolution:** Custom CNAMEs (e.g. `shop.fashionbrand.pk`) are resolved via `store_domains` cache to the respective `store_id`.
3. **Security Context:** Middleware populates request headers with verified `x-tenant-id` and `x-store-id`, enabling localized caching while preventing cross-tenant cache contamination.
