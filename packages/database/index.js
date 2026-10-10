/**
 * @commerce/core-db
 * Production-ready PostgreSQL Client & Tenant-Aware Repository (CommonJS)
 */

const { Pool } = require('pg');

class TenantDatabaseManager {
  constructor(config) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections || 10,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
      ssl: { rejectUnauthorized: false }
    });
  }

  async withTenantTransaction(tenantId, storeId, callback) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [tenantId]);
      await client.query("SELECT set_config('app.current_store_id', $1, true)", [storeId]);
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async query(text, params = []) {
    return this.pool.query(text, params);
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = { TenantDatabaseManager };
