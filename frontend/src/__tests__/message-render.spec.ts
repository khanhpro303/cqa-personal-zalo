import { describe, expect, it } from 'vitest'
import { parseReminderPayload } from '../utils/message-render'

describe('parseReminderPayload', () => {
  it('parses reminder payload and extracts title', () => {
    const content = JSON.stringify({
      title: 'Lâm Khải tạo nhắc hẹn mới Mai quay ego kiếm cơm - 14/04/2026 13:00.',
      action: 'msginfo.actionlist',
      params: JSON.stringify({
        iconUrl: 'https://res-zalo.zadn.vn/upload/media/2018/4/19/chat_tip_icon_alarm_1524131586554.png',
        actions: [{ actionType: 'action.open.calendar.event' }],
      }),
    })

    expect(parseReminderPayload(content)).toEqual({
      title: 'Lâm Khải tạo nhắc hẹn mới Mai quay ego kiếm cơm - 14/04/2026 13:00.',
    })
  })

  it('returns null for non-reminder json with title', () => {
    const content = JSON.stringify({
      title: 'Thông báo hệ thống',
      action: 'msginfo.actionlist',
      params: JSON.stringify({
        actions: [{ actionType: 'action.open.profile' }],
      }),
    })

    expect(parseReminderPayload(content)).toBeNull()
  })

  it('returns null for non-json text content', () => {
    expect(parseReminderPayload('xin chao')).toBeNull()
  })

  it('supports reminder title when params is invalid json', () => {
    const content = JSON.stringify({
      title: 'A tạo nhắc hẹn mới B - 14/04/2026 13:00.',
      action: 'msginfo.actionlist',
      params: '{broken',
    })

    expect(parseReminderPayload(content)).toEqual({
      title: 'A tạo nhắc hẹn mới B - 14/04/2026 13:00.',
    })
  })
})
