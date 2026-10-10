# SECURITY THREAT MODEL & DEFENSE SPECIFICATION

**Document Owner:** Domain Master 11 (Authentication & Security Master)  
**Supervised by:** KING Agent  
**Audited by:** Independent Red-Team Agent  
**Status:** Approved for Gate 3  
**Version:** 1.0.0

---

## 1. Threat Identification & Mitigation

### 1.1 Cross-Tenant Data Access (IDOR)
- **Risk:** Malicious tenant crafts request with another tenant's store ID or order ID.
- **Mitigation:**
  1. Identity resolved strictly from cryptographically verified server session JWT.
  2. Organization membership checked on every request.
  3. Database queries enforce tenant scoping (`WHERE store_id = :store_id`).
  4. PostgreSQL Row-Level Security (RLS) acts as mandatory defense in depth.

### 1.2 SSRF via Odoo Integration URL
- **Risk:** Attacker configures Odoo instance URL to `http://169.254.169.254` (cloud metadata) or `http://127.0.0.1:5432` to probe internal services.
- **Mitigation:**
  1. URL parser enforces HTTPS in production.
  2. Domain resolution checks IP against private CIDR blocks (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`).
  3. Requests to private/loopback addresses are rejected with immediate HTTP 400.

### 1.3 Client-Side Price Tampering
- **Risk:** Shopper alters cart payload in browser to submit item with price `1 PKR`.
- **Mitigation:**
  1. Client-submitted prices are completely ignored by the checkout engine.
  2. Server queries current product/variant prices, recalculates line items, evaluates active discount codes, computes delivery fees and taxes.
  3. Immutable line-item snapshot written to `order_items`.

### 1.4 Webhook Replay & Forgery (JazzCash / Easypaisa)
- **Risk:** Attacker replays previous payment callback or forges success payload.
- **Mitigation:**
  1. Cryptographic HMAC-SHA256 signature verification on all incoming webhook payloads using tenant's encrypted secret salt.
  2. Strict idempotency keys (`gateway_ref:{transaction_id}`).
  3. Status transitions only accept verified cryptographic callbacks.

### 1.5 Credential & Secret Storage
- **Risk:** Odoo passwords and payment API keys exposed in database dumps or logs.
- **Mitigation:**
  1. Secrets encrypted using AES-256-GCM.
  2. Tenant-specific salt derivation.
  3. Secrets masked in logs (`***MASKED***`) and omitted from API response schemas.
