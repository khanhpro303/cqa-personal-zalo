import assert from 'node:assert/strict';
import test from 'node:test';
import { createHmac } from 'node:crypto';
import { buildSignedImportRequest } from '../src/sync/cqa-client.js';

test('buildSignedImportRequest signs body with timestamp and request id', () => {
  const batch = {
    account: {
      id: 'acc-1',
      tenantId: 'tenant-1',
      channelId: 'channel-1',
      importEndpoint: 'http://localhost:8080/api/internal/imports/personal-zalo',
      importSecret: 'secret-1',
      accountExternalId: 'zalo-123',
      status: 'connected',
      displayName: 'Account 1',
      createdAt: '2026-04-08T00:00:00.000Z',
      updatedAt: '2026-04-08T00:00:00.000Z',
      threads: {},
    },
    conversations: [
      {
        threadKey: 'user:u-1',
        conversation: {
          external_id: 'u-1',
          thread_type: 'user',
          external_user_id: 'u-1',
          customer_name: 'Alice',
          last_message_at: '2026-04-08T00:00:00.000Z',
          metadata: {},
        },
        messages: [
          {
            external_id: 'm-1',
            sender_type: 'customer',
            sender_name: 'Alice',
            content: 'hello',
            content_type: 'text',
            attachments: [],
            sent_at: '2026-04-08T00:00:00.000Z',
            raw_data: {},
          },
        ],
      },
    ],
  };

  const request = buildSignedImportRequest(batch as any);
  const expected = createHmac('sha256', 'secret-1')
    .update(request.timestamp)
    .update('.')
    .update(request.requestId)
    .update('.')
    .update(request.body)
    .digest('hex');

  assert.equal(request.signature, expected);
  assert.equal(request.url, 'http://localhost:8080/api/internal/imports/personal-zalo');
});
