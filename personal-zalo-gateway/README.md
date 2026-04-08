# Personal Zalo Gateway

Sidecar mỏng cho `chat-quality-agent` để ingest `Zalo cá nhân`.

## Trách nhiệm

- QR login bằng `zca-js`
- lưu session cục bộ
- auto reconnect khi listener rớt
- normalize message thành contract import của CQA
- flush theo batch có HMAC signing sang `/api/internal/imports/personal-zalo`

## API v1

- `GET /health`
- `GET /api/v1/accounts`
- `GET /api/v1/accounts/:accountId`
- `POST /api/v1/accounts`
- `PUT /api/v1/accounts/:accountId`
- `POST /api/v1/accounts/:accountId/login/qr`
- `POST /api/v1/accounts/:accountId/reconnect`
- `POST /api/v1/accounts/:accountId/sync`

## Account payload

```json
{
  "tenantId": "tenant-uuid",
  "channelId": "channel-uuid",
  "importEndpoint": "http://app:8080/api/internal/imports/personal-zalo",
  "importSecret": "secret-from-cqa-channel",
  "accountExternalId": "",
  "displayName": "Sales Admin 01"
}
```

`accountExternalId` có thể để trống lúc đầu. Sau khi login thành công, gateway sẽ bind bằng `ownId` của tài khoản Zalo.
