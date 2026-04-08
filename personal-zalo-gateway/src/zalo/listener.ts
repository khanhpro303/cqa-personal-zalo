import { logger } from '../logger.js';
import type { GatewayStore } from '../store/file-store.js';
import type { ThreadType } from '../types.js';
import { detectContentType, messageContentToString } from './helpers.js';

async function resolveZaloName(api: any, uid: string): Promise<{ zaloName: string; avatar: string }> {
  try {
    const result = await api.getUserInfo(uid);
    const profiles = result?.changed_profiles || {};
    const profile = profiles[uid] || profiles[`${uid}_0`];
    return {
      zaloName:
        profile?.zaloName ||
        profile?.zalo_name ||
        profile?.displayName ||
        profile?.display_name ||
        '',
      avatar: profile?.avatar || '',
    };
  } catch (error) {
    logger.warn(`[zalo] getUserInfo failed for ${uid}`, error);
    return { zaloName: '', avatar: '' };
  }
}

async function resolveGroupName(api: any, groupId: string): Promise<string> {
  try {
    const result = await api.getGroupInfo(groupId);
    return result?.gridInfoMap?.[groupId]?.name || '';
  } catch (error) {
    logger.warn(`[zalo] getGroupInfo failed for ${groupId}`, error);
    return '';
  }
}

export interface ListenerContext {
  accountId: string;
  api: any;
  store: GatewayStore;
  onDisconnected: (accountId: string) => void;
}

async function persistMessage(
  store: GatewayStore,
  accountId: string,
  api: any,
  message: any,
): Promise<void> {
  const isGroup = message.type === 1;
  const threadType: ThreadType = isGroup ? 'group' : 'user';
  const senderUid = String(message.data?.uidFrom || '');
  let senderName = message.data?.dName || '';

  if (!message.isSelf && senderUid && api.getUserInfo) {
    const userInfo = await resolveZaloName(api, senderUid);
    if (userInfo.zaloName) {
      senderName = userInfo.zaloName;
    }
  }

  let groupName: string | undefined;
  if (isGroup && message.threadId) {
    groupName = await resolveGroupName(api, message.threadId);
  }

  const rawContent = message.data?.content;
  await store.recordIncomingMessage(accountId, {
    senderUid,
    senderName,
    content: messageContentToString(rawContent),
    contentType: detectContentType(message.data?.msgType, rawContent),
    msgId: String(message.data?.msgId || ''),
    timestamp: Number.parseInt(message.data?.ts || `${Date.now()}`, 10),
    isSelf: Boolean(message.isSelf),
    threadId: String(message.threadId || ''),
    threadType,
    groupName,
    attachments: [],
    rawData: {
      message_type: message.data?.msgType || '',
    },
  });
}

export function attachZaloListener(ctx: ListenerContext): void {
  const { accountId, api, store, onDisconnected } = ctx;
  const listener = api.listener;

  listener.on('connected', () => {
    logger.info(`[zalo:${accountId}] listener connected`);
    setTimeout(() => {
      try {
        listener.requestOldMessages(0);
        listener.requestOldMessages(1);
      } catch (error) {
        logger.warn(`[zalo:${accountId}] requestOldMessages failed`, error);
      }
    }, 1000);
  });

  listener.on('message', async (message: any) => {
    try {
      await persistMessage(store, accountId, api, message);
    } catch (error) {
      logger.error(`[zalo:${accountId}] message listener failed`, error);
    }
  });

  listener.on('old_messages', async (messages: any[]) => {
    try {
      for (const message of messages) {
        await persistMessage(store, accountId, api, message);
      }
      logger.info(`[zalo:${accountId}] bootstrapped ${messages.length} old messages`);
    } catch (error) {
      logger.error(`[zalo:${accountId}] old_messages listener failed`, error);
    }
  });

  listener.on('undo', async (data: any) => {
    const msgId = String(data?.data?.msgId || data?.msgId || '');
    if (!msgId) return;
    await store.markMessageDeleted(accountId, msgId);
  });

  listener.on('closed', (code: number, reason: string) => {
    logger.warn(`[zalo:${accountId}] listener closed code=${code} reason=${reason}`);
    onDisconnected(accountId);
  });

  listener.on('error', (error: unknown) => {
    logger.error(`[zalo:${accountId}] listener error`, error);
  });

  listener.start({ retryOnClose: true });
}
