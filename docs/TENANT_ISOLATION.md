# TENANT ISOLATION SPECIFICATION & AUDIT PROCEDURES

**Document Owner:** Domain Master 3 (Database & Multi-Tenancy Master) & Domain Master 11 (Security Master)  
**Supervised by:** KING Agent  
**Audited by:** Independent Red-Team Agent  
**Status:** Approved for Gate 3  
**Version:** 1.0.0

---

## 1. Zero-Trust Multi-Tenancy Principles

1. **Explicit Identity Derivation:** No incoming HTTP request or message payload is permitted to supply its own `tenant_id` or `store_id` without cryptographic session verification. The identity is extracted exclusively from the validated JWT/session token and verified against `organization_memberships`.
2. **Double-Barreled Query Scoping:**
   - Every database query at the application layer must include `WHERE store_id = :store_id` (or `organization_id = :organization_id`).
   - In addition, PostgreSQL Row-Level Security (RLS) policies are active on all tenant tables as a second layer of defense.
3. **Encrypted Isolation of External Secrets:**
   - Odoo ERP credentials and payment gateway API secrets (JazzCash merchant passwords, Easypaisa store IDs) are encrypted using AES-256-GCM.
   - Keys are derived with tenant-specific salt parameters so a compromised key for Tenant A cannot decrypt records for Tenant B.
4. **Storage Isolation:**
   - Uploaded customer payment receipts, product images, and export files are stored in paths partitioned by tenant: `storage://tenants/{tenant_id}/stores/{store_id}/...`.
   - Payment receipts and confidential files use private bucket policies and are served only via time-limited, signed URLs validated against tenant staff authorization.

---

## 2. Row-Level Security (RLS) Implementation Blueprint

```sql
-- Enable RLS on Tenant Tables
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_jobs ENABLE ROW LEVEL SECURITY;

-- Create Tenant Context Function
CREATE OR REPLACE FUNCTION app.current_tenant_id() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION app.current_store_id() RETURNS UUID AS $$
    SELECT NULLIF(current_setting('app.current_store_id', true), '')::UUID;
$$ LANGUAGE sql STABLE;

-- Stores Policy
CREATE POLICY tenant_isolation_stores ON stores
    FOR ALL
    USING (organization_id = app.current_tenant_id());

-- Orders Policy
CREATE POLICY tenant_isolation_orders ON orders
    FOR ALL
    USING (store_id = app.current_store_id());

-- Payments Policy
CREATE POLICY tenant_isolation_payments ON payments
    FOR ALL
    USING (store_id = app.current_store_id());

-- Odoo Connections Policy
CREATE POLICY tenant_isolation_odoo_connections ON integration_connections
    FOR ALL
    USING (store_id = app.current_store_id());
```

---

## 3. Adversarial Negative Test Matrix

The Independent Red-Team Agent requires passing automated test suites for the following attack scenarios:

| Test ID | Scenario | Attack Vector | Expected Result |
|---|---|---|---|
| **ISO-01** | Cross-Tenant Order Query | User A requests `GET /api/stores/{store_B_id}/orders/{order_B_id}` with User A's token | **HTTP 403 Forbidden / 404 Not Found**; zero data returned |
| **ISO-02** | Cross-Tenant Product Mutation | User A sends `PATCH /api/products/{product_B_id}` with price override | **HTTP 403 Forbidden**; DB update rejected |
| **ISO-03** | Odoo Credential Access | User A queries `/api/integrations/odoo` with store B ID | **HTTP 403 Forbidden**; secrets never leaked |
| **ISO-04** | Receipt File Traversal | User A accesses signed URL for User B's manual bank transfer slip | **Access Denied**; unauthorized signature rejected |
| **ISO-05** | Outbox Job Snooping | Sync worker queries outbox jobs | Worker process only processes jobs scoped to verified connection |
