import { describe, expect, it } from 'vitest'
import {
  parseImageMessagePayload,
  parseReminderPayload,
  parseStructuredMessageText,
  parseThirdPartyLinkMessagePayload,
} from '../utils/message-render'

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

  it('parses type 8 reminder payload and extracts description + image', () => {
    const content = JSON.stringify({
      title: '⏰ Mai quay ego kiếm cơm',
      description: 'Thứ Ba, 14 tháng 4 lúc 13:00',
      href: 'https://res-zalo.zadn.vn/upload/media/2018/8/3/reminder_02_1533262270131_116972.png',
      thumb: 'https://res-zalo.zadn.vn/upload/media/2018/8/3/reminder_02_1533262270131_116972.png',
      action: 'show.profile',
      params: '{"actions":[{"actionId":"action.open.reminder","data":"{\\"act\\":\\"remind_topic\\"}"}]}',
      type: '8',
    })

    expect(parseReminderPayload(content)).toEqual({
      description: 'Thứ Ba, 14 tháng 4 lúc 13:00',
      imageUrl: 'https://res-zalo.zadn.vn/upload/media/2018/8/3/reminder_02_1533262270131_116972.png',
    })
  })
})

describe('parseStructuredMessageText', () => {
  it('extracts title from rtf payload', () => {
    const content = JSON.stringify({
      title: 'Alo ca nha\nLink: https://example.com/group',
      action: 'rtf',
      params: '{"styles":[],"ver":0}',
      type: '',
    })

    expect(parseStructuredMessageText(content)).toBe('Alo ca nha\nLink: https://example.com/group')
  })

  it('returns null for non-rtf payload', () => {
    const content = JSON.stringify({
      title: 'Thong bao',
      action: 'show.profile',
      type: '8',
    })

    expect(parseStructuredMessageText(content)).toBeNull()
  })

  it('extracts readable text from third-party link payload', () => {
    const content = JSON.stringify({
      title: 'Tham gia đặt đơn nhóm từ Crane Tea - Bến Vân Đồn nào cả nhà!',
      description: 'https://r.grab.com/o/AFVnUrQj',
      href: 'https://r.grab.com/o/AFVnUrQj',
      action: 'recommened.link',
      params: JSON.stringify({
        mediaTitle: 'https://r.grab.com/o/AFVnUrQj',
        src: 'r.grab.com',
      }),
    })

    expect(parseStructuredMessageText(content)).toBe(
      'Tham gia đặt đơn nhóm từ Crane Tea - Bến Vân Đồn nào cả nhà!\nhttps://r.grab.com/o/AFVnUrQj',
    )
  })
})

describe('parseImageMessagePayload', () => {
  it('parses image payload and extracts title + image url', () => {
    const content = JSON.stringify({
      title: 'ủa sao đợt này có a Bảo z',
      description: '',
      href: 'https://photo-stal-33.zdn.vn/gr/jpg/ff48736b3d8bf3d5aa9a/4394592309092551016.jpg',
      thumb: 'https://photo-stal-33.zdn.vn/gr/jpg/ff48736b3d8bf3d5aa9a/4394592309092551016.jpg',
      action: '',
      params: '{"width":722,"convertible":"jxl","hd":"https://photo-stal-33.zdn.vn/gr/jpg/ff48736b3d8bf3d5aa9a/4394592309092551016.jpg","height":399}',
      type: '',
    })

    expect(parseImageMessagePayload(content)).toEqual({
      title: 'ủa sao đợt này có a Bảo z',
      imageUrl: 'https://photo-stal-33.zdn.vn/gr/jpg/ff48736b3d8bf3d5aa9a/4394592309092551016.jpg',
    })
  })

  it('returns null for non-image payload', () => {
    const content = JSON.stringify({
      title: 'Thong bao',
      action: 'rtf',
      href: '',
      thumb: '',
      type: '',
    })

    expect(parseImageMessagePayload(content)).toBeNull()
  })

  it('does not treat third-party link payload as image payload', () => {
    const content = JSON.stringify({
      title: 'Join order',
      action: 'recommened.link',
      href: 'https://r.grab.com/o/AFVnUrQj',
      thumb: 'https://photo-link-talk.zadn.vn/photolinkv2/720/zlv2704413789a1776050478aHR0cHM6Ly9hLmNvbS9iLnBuZw==',
      type: '',
    })

    expect(parseImageMessagePayload(content)).toBeNull()
  })
})

describe('parseThirdPartyLinkMessagePayload', () => {
  it('parses third-party link payload for rendering card', () => {
    const content = JSON.stringify({
      title: 'Tham gia đặt đơn nhóm từ Crane Tea - Bến Vân Đồn nào cả nhà! Thoải mái chọn món yêu thích và sẵn sàng nhập tiệc ăn uống thôi!',
      description: 'https://r.grab.com/o/AFVnUrQj',
      href: 'https://r.grab.com/o/AFVnUrQj',
      thumb: 'https://photo-link-talk.zadn.vn/photolinkv2/720/zlv2704413789a1776050478aHR0cHM6Ly9yZXMtemFsby56YWRuLnZuL3VwbG9hZC9tZWRpYS8yMDE5LzEwLzE1L2ZlZWRfdGh1bWJfbGlua19fMV9fMTU3MTEzMzEyMjc3OF85Mzc4MC5wbmc=',
      action: 'recommened.link',
      params: JSON.stringify({
        mediaTitle: 'https://r.grab.com/o/AFVnUrQj',
        src: 'r.grab.com',
        stream_icon: '',
      }),
    })

    expect(parseThirdPartyLinkMessagePayload(content)).toEqual({
      title: 'Tham gia đặt đơn nhóm từ Crane Tea - Bến Vân Đồn nào cả nhà! Thoải mái chọn món yêu thích và sẵn sàng nhập tiệc ăn uống thôi!',
      imageUrl: 'https://photo-link-talk.zadn.vn/photolinkv2/720/zlv2704413789a1776050478aHR0cHM6Ly9yZXMtemFsby56YWRuLnZuL3VwbG9hZC9tZWRpYS8yMDE5LzEwLzE1L2ZlZWRfdGh1bWJfbGlua19fMV9fMTU3MTEzMzEyMjc3OF85Mzc4MC5wbmc=',
      href: 'https://r.grab.com/o/AFVnUrQj',
      source: 'r.grab.com',
    })
  })
})
