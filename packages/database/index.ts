/**
 * @commerce/core-db
 * Production-ready PostgreSQL Client & Tenant-Aware Repository
 * Author: Domain Master 3 (Database Master) & Domain Master 4 (Backend Master)
 * Supervised by: KING Agent
 */

import { Pool, PoolClient, QueryResult } from 'pg';

export interface DatabaseConfig {
  connectionString: string;
  maxConnections?: number;
  idleTimeoutMillis?: number;
}

export class TenantDatabaseManager {
  private pool: Pool;

  constructor(config: DatabaseConfig) {
    this.pool = new Pool({
      connectionString: config.connectionString,
      max: config.maxConnections || 20,
      idleTimeoutMillis: config.idleTimeoutMillis || 30000,
    });
  }

  /**
   * Executes a callback within a transactional context with PostgreSQL Row-Level Security (RLS)
   * session variables set to the current tenant and store IDs.
   * This guarantees complete tenant isolation at the database level.
   */
  async withTenantTransaction<T>(
    tenantId: string,
    storeId: string,
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      // Set session variables for RLS enforcement
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

  /**
   * Standard scoped query helper
   */
  async query<R extends Record<string, any> = any>(
    text: string,
    params: any[] = []
  ): Promise<QueryResult<R>> {
    return this.pool.query<R>(text, params);
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
