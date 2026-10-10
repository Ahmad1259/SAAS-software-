# TEST STRATEGY & QUALITY ASSURANCE PLAN

**Document Owner:** Domain Master 15 (QA & Automation Testing Master)  
**Supervised by:** KING Agent  
**Audited by:** Domain Master 16 (Independent Red-Team & Audit Master)  
**Status:** Approved for Gate 1 & 7  
**Version:** 1.0.0

---

## 1. Testing Pyramid & Test Types

1. **Unit Testing:**
   - Minor-unit currency math (PKR Paisa calculations, tax rounding).
   - Checkout total calculations and discount logic.
   - HMAC-SHA256 signature generation and validation for JazzCash and Easypaisa.
   - Odoo XML-RPC / JSON-RPC payload encoders and decoders.
2. **Integration Testing:**
   - Database repository methods with real foreign keys and unique constraints.
   - Transactional order creation + inventory deduction + outbox job insertion.
   - Odoo mock server roundtrips (v14 through v18 adapters).
3. **Adversarial Tenant Isolation Testing (Red-Team):**
   - Tenant A session attempting to read/update/delete Tenant B products, orders, customers, and Odoo secrets.
   - SSRF payload injection on external Odoo connection endpoints.
4. **End-to-End (E2E) Workflow Testing:**
   - Provisioning new tenant -> Configuring store -> Adding product -> Storefront checkout -> Order confirmed -> Odoo sync.
   - Cash on Delivery order flow vs. Manual Bank Transfer upload & approval flow.

---

## 2. Automated Test Matrix

```
tests/
├── unit/
│   ├── currency.test.ts          # Exact minor-unit calculations
│   ├── order-validation.test.ts  # Server-side pricing & modifier calculation
│   ├── jazzcash.test.ts          # Signature generation & IPN validation
│   └── odoo-adapter.test.ts      # Protocol auto-negotiation & payload mapping
├── integration/
│   ├── tenant-isolation.test.ts  # Adversarial cross-tenant rejection tests
│   ├── order-lifecycle.test.ts   # State machine transitions
│   └── outbox-worker.test.ts     # Reliable job processing & exponential backoff
└── e2e/
    ├── customer-checkout.test.ts # Public storefront mobile-first purchase
    └── merchant-admin.test.ts    # Dashboard product creation & bank slip approval
```
