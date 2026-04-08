import { logger } from '../logger.js';
import { sendImportBatch } from './cqa-client.js';
import type { GatewayStore } from '../store/file-store.js';

export class SyncService {
  private timer: NodeJS.Timeout | null = null;
  private inFlight = new Set<string>();

  constructor(
    private readonly store: GatewayStore,
    private readonly intervalMs: number,
    private readonly maxConversations: number,
    private readonly maxMessagesPerConversation: number,
    private readonly timeoutMs: number,
  ) {}

  start(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      void this.syncAll();
    }, this.intervalMs);
  }

  stop(): void {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  }

  async syncAll(): Promise<void> {
    const accounts = await this.store.listAccounts();
    for (const account of accounts) {
      if (!account.accountExternalId && !account.zaloUid) {
        continue;
      }
      await this.syncAccount(account.id);
    }
  }

  async syncAccount(accountId: string): Promise<void> {
    if (this.inFlight.has(accountId)) return;
    this.inFlight.add(accountId);

    try {
      while (true) {
        const batch = await this.store.nextSyncBatch(
          accountId,
          this.maxConversations,
          this.maxMessagesPerConversation,
        );
        if (!batch) {
          return;
        }

        const response = await sendImportBatch(batch, this.timeoutMs);
        const syncedAt = new Date().toISOString();
        await this.store.markBatchSynced(
          accountId,
          Object.fromEntries(
            batch.conversations.map((conv) => [
              conv.threadKey,
              conv.messages.map((message) => message.external_id),
            ]),
          ),
          syncedAt,
        );
        logger.info(
          `[sync] account=${accountId} request=${response.request_id} conversations=${response.conversations} inserted=${response.messages_inserted} deduped=${response.messages_deduplicated}`,
        );
      }
    } finally {
      this.inFlight.delete(accountId);
    }
  }
}
