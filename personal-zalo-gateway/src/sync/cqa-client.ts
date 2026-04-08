import { createHmac, randomUUID } from 'node:crypto';
import { logger } from '../logger.js';
import type { AccountSyncBatch } from '../types.js';

export interface CQAImportResponse {
  request_id: string;
  conversations: number;
  messages_processed: number;
  messages_inserted: number;
  messages_deduplicated: number;
}

export function buildSignedImportRequest(accountBatch: AccountSyncBatch): {
  url: string;
  requestId: string;
  timestamp: string;
  signature: string;
  body: string;
} {
  const requestId = randomUUID();
  const timestamp = `${Math.floor(Date.now() / 1000)}`;
  const payload = {
    schema_version: '2026-04-08',
    request_id: requestId,
    tenant_id: accountBatch.account.tenantId,
    channel_id: accountBatch.account.channelId,
    account_external_id: accountBatch.account.accountExternalId || accountBatch.account.zaloUid || '',
    imported_at: new Date().toISOString(),
    conversations: accountBatch.conversations.map(({ conversation, messages }) => ({
      conversation,
      messages,
    })),
  };
  const body = JSON.stringify(payload);
  const signature = createHmac('sha256', accountBatch.account.importSecret)
    .update(timestamp)
    .update('.')
    .update(requestId)
    .update('.')
    .update(body)
    .digest('hex');

  return {
    url: accountBatch.account.importEndpoint,
    requestId,
    timestamp,
    signature,
    body,
  };
}

export async function sendImportBatch(
  accountBatch: AccountSyncBatch,
  timeoutMs: number,
): Promise<CQAImportResponse> {
  const request = buildSignedImportRequest(accountBatch);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CQA-Request-Id': request.requestId,
        'X-CQA-Timestamp': request.timestamp,
        'X-CQA-Signature': request.signature,
      },
      body: request.body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`cqa_import_failed:${response.status}:${text}`);
    }

    return await response.json() as CQAImportResponse;
  } catch (error) {
    logger.error('[sync] sendImportBatch failed', error);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
