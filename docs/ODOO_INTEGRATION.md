# ODOO ERP INTEGRATION ARCHITECTURE & VERSION COMPATIBILITY

**Document Owner:** Domain Master 8 (Odoo Integration Master)  
**Supervised by:** KING Agent  
**Audited by:** Domain Master 9 (Accounting Master)  
**Status:** Approved for Gate 6  
**Version:** 1.0.0

---

## 1. Dual Integration Modes

### Mode A: Client-Owned Odoo
- The merchant enters their own external Odoo instance URL (e.g., `https://myerp.clientcompany.com`).
- **Security Check:** Pre-flight URL validator strictly prohibits SSRF by denying:
  - Loopback (`127.0.0.1`, `localhost`)
  - Private subnet ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)
  - Cloud provider metadata IPs (`169.254.169.254`)
  - Non-standard/internal ports
- Verifies XML-RPC `/xmlrpc/2/common` and `/xmlrpc/2/object` (or JSON-RPC for newer endpoints).
- Probes user permissions and installed modules (`sale`, `account`, `stock`).

### Mode B: Centrally Managed Odoo
- SaaS Operator provides an Odoo instance.
- Supports dedicated database per tenant or shared database with strict multi-company record rules.
- Automatically discovers and maps the tenant's dedicated company record.

---

## 2. Version Compatibility Matrix (Odoo 14 – 18)

| Feature / Model | Odoo 14 | Odoo 15 | Odoo 16 | Odoo 17 | Odoo 18 | Adapter Implementation |
|---|---|---|---|---|---|---|
| **API Protocol** | XML-RPC | XML-RPC | XML-RPC / JSON-RPC | XML-RPC / JSON-RPC | JSON-RPC / XML-RPC | `UniversalRpcClient` with protocol auto-negotiation |
| **Sales Orders** | `sale.order` | `sale.order` | `sale.order` | `sale.order` | `sale.order` | Standard `createSalesDocument` |
| **Invoices** | `account.move` (`type='out_invoice'`) | `account.move` (`move_type='out_invoice'`) | `account.move` (`move_type='out_invoice'`) | `account.move` (`move_type='out_invoice'`) | `account.move` (`move_type='out_invoice'`) | Field adapter handles `type` vs `move_type` field migration |
| **Payment Register** | `account.payment.register` wizard | `account.payment.register` wizard | `account.payment.register` wizard | `account.payment.register` wizard | `account.payment.register` wizard | Reconciles invoice with selected payment journal |
| **Taxes** | `account.tax` (id array) | `account.tax` (command tuple) | `account.tax` (`[(6, 0, ids)]`) | `account.tax` (`[(6, 0, ids)]`) | `account.tax` (`[(6, 0, ids)]`) | Command tuple generation abstraction |

---

## 3. Pre-Flight Mapping Wizard & Invariants

Production synchronization is **strictly blocked** until an administrator confirms the following mappings:
1. **Target Company:** Odoo Company ID.
2. **Sales Journal:** Verified customer invoice journal (type: `sale`).
3. **Payment Journals:** Mapped journals for JazzCash, Easypaisa, Bank Transfer, and Cash/COD.
4. **Tax Mapping:** Valid tax rates configured for line items.
5. **Customer Mapping Strategy:** Map by phone/email or create new `res.partner`.
6. **Product Mapping Strategy:** Map by SKU or Barcode.

---

## 4. Reliable Outbox & Idempotency Safeguards

To prevent duplicate sales orders, invoices, or payment registrations:
1. Each outbound sync payload is generated with a unique deterministic `idempotency_key`:  
   `odoo_sync:{store_id}:{event_type}:{internal_record_id}`
2. Before dispatching a creation call, the adapter queries Odoo for existing records matching our external reference:  
   `search([('client_order_ref', '=', order_number)])`
3. If an existing record is found (e.g. from a previous timed-out attempt), the worker immediately records the external Odoo ID, transitions the job to `SUCCEEDED`, and avoids duplicate creation.
4. Transient connection drops trigger bounded exponential backoff (1m, 5m, 15m, 1h, 4h).
5. Permanent errors (e.g. invalid journal ID, inactive account) immediately move the job to `NEEDS_ATTENTION` and alert the store administrator without infinite retries.
