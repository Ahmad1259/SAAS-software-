# DEPLOYMENT RUNBOOK & OPERATIONAL PROCEDURES

**Document Owner:** Domain Master 14 (DevOps, Reliability & Cost Master)  
**Supervised by:** KING Agent  
**Audited by:** Independent Red-Team Agent  
**Status:** Approved for Gate 9  
**Version:** 1.0.0

---

## 1. Hosting Architecture & Free-Tier Operational Strategy

To adhere strictly to the near-zero initial development and operational cost mandate:

1. **Application Layer (Next.js):**
   - Vercel Free Hobby Tier / Cloudflare Pages / Railway Starter.
   - Server-Side Rendering (SSR) for dynamic storefronts and dashboards.
2. **Database Layer (PostgreSQL):**
   - Supabase (Free tier: 500MB DB, automated backups) or Neon Serverless PostgreSQL.
   - Enforces SSL connection mode in production (`sslmode=require`).
3. **File & Media Storage:**
   - Cloudflare R2 (10 GB free monthly, zero egress bandwidth fees).
   - Public assets (store logos, product pictures) served via CDN.
   - Confidential documents (bank transfer slips) stored in private bucket with short-lived presigned URLs.
4. **Outbox Synchronization Engine:**
   - In-process Next.js background runner or free-tier Cron trigger (`/api/cron/process-outbox`) secured by `CRON_SECRET` bearer token.
   - Zero paid messaging queues required.

---

## 2. Environment Variables Specification (`.env.example`)

```bash
# APPLICATION
NODE_ENV=development
APP_URL=http://localhost:3000
PLATFORM_DOMAIN=commercecloud.pk
CRON_SECRET=generate_secure_random_hex_string_32_bytes

# DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/commerce_cloud?sslmode=prefer

# SECURITY & AUTH
JWT_SECRET=generate_secure_random_hex_string_64_bytes
ENCRYPTION_KEY=generate_secure_random_hex_string_32_bytes

# STORAGE (Cloudflare R2 / S3 Compatible)
STORAGE_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=r2_access_key
STORAGE_SECRET_ACCESS_KEY=r2_secret_key
STORAGE_PUBLIC_BUCKET=commerce-cloud-public
STORAGE_PRIVATE_BUCKET=commerce-cloud-private
STORAGE_PUBLIC_URL=https://assets.commercecloud.pk

# JAZZCASH GATEWAY (Merchant / Sandbox Defaults)
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_SALT=
JAZZCASH_RETURN_URL=https://commercecloud.pk/api/webhooks/payments/jazzcash

# EASYPAISA GATEWAY (Merchant / Sandbox Defaults)
EASYPAISA_STORE_ID=
EASYPAISA_HASH_KEY=
EASYPAISA_RETURN_URL=https://commercecloud.pk/api/webhooks/payments/easypaisa
```

---

## 3. Database Migration & Rollback Strategy

1. **Forward-Only, Non-Destructive Migrations:**
   - Schema alterations must never drop columns in active use. New columns must be added with defaults or nullable constraints.
2. **Pre-Deployment Backup Verification:**
   - Execute automated PostgreSQL snapshot dump prior to executing schema migration scripts.
3. **Rollback Plan:**
   - Every migration script `.sql` must have a corresponding `.down.sql` rollback script tested in staging.
