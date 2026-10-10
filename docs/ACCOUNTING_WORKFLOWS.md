# ACCOUNTING WORKFLOWS & PAKISTAN PAYMENT RECONCILIATION

**Document Owner:** Domain Master 9 (Accounting & Financial Controls Master) & Domain Master 7 (Payments Master)  
**Supervised by:** KING Agent  
**Audited by:** Independent Red-Team Agent  
**Status:** Approved for Gate 5  
**Version:** 1.0.0

---

## 1. Separation of Three Financial Layers

1. **Layer 1 — Commerce Operational Records:**
   - Captures customer order commitments, line item snapshots, discounts, and delivery fees.
   - **Critical Rule:** An order is never treated as recognized revenue or financial profit.
2. **Layer 2 — Operational Financial Events (The SaaS Ledger):**
   - Captures actual cash/bank events: payment submissions, manual slip approvals, verified gateway settlements, COD collections, and customer refunds.
3. **Layer 3 — Official Accounting (Odoo / External Ledger):**
   - Official customer invoices (`account.move`), debit/credit journal entries, receivables, and bank statement reconciliations.
4. **SaaS Rental Ledger (Independent Company Ledger):**
   - Platform rental invoices issued by the SaaS operator to tenant merchants are completely isolated from tenant store sales. They are recorded under the SaaS operator's own company ledger.

---

## 2. Pakistan Payment Methods & Workflows

### 2.1 Cash on Delivery (COD)
- **Lifecycle:** `ORDER_PLACED` -> `FULFILLED_AND_DISPATCHED` -> `CASH_COLLECTED_BY_COURIER` -> `SETTLED_TO_MERCHANT`.
- **Accounting Treatment:** Revenue recognized upon delivery fulfillment. Receivable assigned to courier suspense account until cash remittance is reconciled.

### 2.2 Manual Bank Transfer / Raast / Digital Wallet
- **Lifecycle:**
  1. Customer completes checkout; unique reference token generated (e.g. `REF-9214`).
  2. Customer deposits funds via banking app / Raast and submits transaction ID and optional receipt image.
  3. Order state becomes `PENDING_VERIFICATION`.
  4. Authorized store staff verifies transaction reference against bank statement.
  5. Staff approves payment -> Payment state becomes `PAID` -> Order transitions to `CONFIRMED`.
  6. Audit trail logs `verified_by_user_id` and timestamp.

### 2.3 Automated Gateway (JazzCash & Easypaisa)
- **Lifecycle:**
  1. Server initiates secure transaction token request with HMAC-SHA256 signature.
  2. Customer completes authentication on secure gateway hosted page / mobile app.
  3. Gateway sends server-to-server callback (IPN / Webhook) to `/api/webhooks/payments/{provider}`.
  4. Server validates HMAC-SHA256 hash using encrypted secret salt.
  5. Transaction recorded idempotently in `payments` and `financial_events`.
  6. Order confirmed; sync job scheduled for Odoo.

---

## 3. Discrepancy & Reconciliation Engine

The system runs scheduled reconciliation jobs comparing:
1. **SaaS Orders vs. Confirmed Payments:** Flags orders marked completed without corresponding `PAID` events.
2. **SaaS Payments vs. Gateway Webhooks:** Detects unhandled callback payloads or missing settlement batches.
3. **SaaS Financial Events vs. Odoo Invoices/Payments:** Detects outbox sync failures, missing invoices, or unposted payments.

Any discrepancy generates an entry in `reconciliation_runs` and alerts the store administrator.
