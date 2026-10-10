/**
 * @commerce/outbox-worker (CommonJS)
 * Reliable Transactional Outbox Worker & Asynchronous Odoo Sync Dispatcher
 * Author: Domain Master 8 (Odoo Master) & Domain Master 9 (Accounting Master)
 * Supervised by: KING Agent
 * Audited by: Domain Master 16 (Red-Team Auditor)
 */

class ReliableOutboxWorker {
  static calculateBackoffDelay(attempt, baseDelayMs = 2000, maxDelayMs = 3600000) {
    const delay = baseDelayMs * Math.pow(2, attempt - 1);
    return Math.min(delay, maxDelayMs);
  }

  static async processJob(job, odooClient) {
    job.status = 'PROCESSING';
    job.attemptCount += 1;

    try {
      const auth = await odooClient.authenticate();
      if (!auth.isConnected) {
        throw new Error('Could not establish connection to Odoo server');
      }

      const existingId = await odooClient.searchExistingRecord('sale.order', [
        ['client_order_ref', '=', job.payload.id || job.internalRecordId],
      ]);

      if (existingId) {
        job.status = 'SUCCEEDED';
        job.externalRecordId = String(existingId);
        return { success: true, externalId: String(existingId) };
      }

      const orderLines = (job.payload.items || []).map((item) => [
        0,
        0,
        {
          name: item.name,
          product_uom_qty: item.qty,
          price_unit: Number(item.priceMinor || 0) / 100,
        },
      ]);

      const odooValues = {
        client_order_ref: job.payload.id || job.internalRecordId,
        note: `Customer: ${job.payload.customerName} (${job.payload.customerPhone})\nAddress: ${job.payload.address}`,
        order_line: orderLines,
      };

      const createdId = await odooClient.createRecord('sale.order', odooValues);

      job.status = 'SUCCEEDED';
      job.externalRecordId = String(createdId);
      return { success: true, externalId: String(createdId) };
    } catch (err) {
      job.lastError = err.message || 'Unknown synchronization error';

      if (job.attemptCount >= job.maxAttempts) {
        job.status = 'NEEDS_ATTENTION';
      } else {
        job.status = 'RETRY_SCHEDULED';
        const delay = this.calculateBackoffDelay(job.attemptCount);
        job.nextRetryAt = new Date(Date.now() + delay);
      }

      return { success: false, error: job.lastError };
    }
  }
}

module.exports = { ReliableOutboxWorker };
