import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config, stateFilePath } from './config.js';
import { logger } from './logger.js';
import { registerAccountRoutes } from './routes/accounts.js';
import { GatewayStore } from './store/file-store.js';
import { SyncService } from './sync/sync-service.js';
import { ZaloAccountPool } from './zalo/account-pool.js';

async function bootstrap(): Promise<void> {
  const app = Fastify({ logger: false });
  const store = new GatewayStore(stateFilePath());
  await store.init();

  const syncService = new SyncService(
    store,
    config.syncIntervalMs,
    config.maxBatchConversations,
    config.maxMessagesPerConversation,
    config.requestTimeoutMs,
  );
  const pool = new ZaloAccountPool(store);

  await app.register(cors, { origin: true });
  await registerAccountRoutes(app, { store, syncService, pool });

  app.get('/health', async () => ({
    status: 'ok',
    service: 'personal-zalo-gateway',
    timestamp: new Date().toISOString(),
  }));

  app.setErrorHandler((error, _request, reply) => {
    logger.error('request failed', error);
    reply.status(500).send({
      error: error instanceof Error ? error.message : 'internal_error',
    });
  });

  await app.listen({ host: config.host, port: config.port });
  logger.info(`personal-zalo-gateway listening on http://${config.host}:${config.port}`);

  await pool.bootstrapReconnects();
  syncService.start();

  const shutdown = async () => {
    syncService.stop();
    await app.close();
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown();
  });
  process.on('SIGTERM', () => {
    void shutdown();
  });
}

void bootstrap();
