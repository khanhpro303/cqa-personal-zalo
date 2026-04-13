export interface ReminderMessageView {
  title?: string
  description?: string
  imageUrl?: string
}

export interface ImageMessageView {
  title?: string
  imageUrl: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJsonObject(value: unknown): Record<string, unknown> | null {
  if (isRecord(value)) return value
  if (typeof value !== 'string' || value.trim() === '') return null
  try {
    const parsed = JSON.parse(value)
    return isRecord(parsed) ? parsed : null
  } catch {
    return null
  }
}

function extractCalendarAction(params: Record<string, unknown> | null): boolean {
  if (!params) return false
  const actions = params.actions
  if (!Array.isArray(actions)) return false
  return actions.some((action) => isRecord(action) && action.actionType === 'action.open.calendar.event')
}

function parseType8Reminder(root: Record<string, unknown>): ReminderMessageView | null {
  const messageType = typeof root.type === 'string' || typeof root.type === 'number'
    ? String(root.type).trim()
    : ''
  if (messageType !== '8') return null

  const action = typeof root.action === 'string' ? root.action.trim() : ''
  if (action !== 'show.profile') return null

  const paramsRaw = typeof root.params === 'string' ? root.params : ''
  const reminderSignal = paramsRaw.includes('action.open.reminder') || paramsRaw.includes('remind_topic')
  if (!reminderSignal) return null

  const description = typeof root.description === 'string' ? root.description.trim() : ''
  const imageUrl = [root.thumb, root.href].find((value) => typeof value === 'string' && value.trim().length > 0) as string | undefined

  if (!description && !imageUrl) return null
  return { description, imageUrl }
}

function isLikelyImageUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(lower) ||
    /\/(jpg|jpeg|png|gif|webp)\//.test(lower) ||
    (lower.includes('zdn.vn') && (lower.includes('/jpg/') || lower.includes('/jpeg/') || lower.includes('/png/') || lower.includes('/gif/') || lower.includes('/webp/')))
  )
}

export function parseImageMessagePayload(content: string): ImageMessageView | null {
  const root = parseJsonObject(content)
  if (!root) return null

  const action = typeof root.action === 'string' ? root.action.trim() : ''
  if (action === 'rtf' || action === 'msginfo.actionlist') return null

  const messageType = typeof root.type === 'string' || typeof root.type === 'number'
    ? String(root.type).trim()
    : ''
  if (action === 'show.profile' && messageType === '8') return null

  const params = parseJsonObject(root.params)
  const candidates = [root.thumb, root.href, params?.hd].filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
  const imageUrl = candidates.find((url) => isLikelyImageUrl(url.trim()))?.trim()
  if (!imageUrl) return null

  const title = typeof root.title === 'string' ? root.title.replace(/\r\n/g, '\n').trim() : ''
  return { title, imageUrl }
}

export function parseStructuredMessageText(content: string): string | null {
  const root = parseJsonObject(content)
  if (!root) return null

  const action = typeof root.action === 'string' ? root.action.trim() : ''
  if (action !== 'rtf') return null

  const title = typeof root.title === 'string' ? root.title.replace(/\r\n/g, '\n').trim() : ''
  if (!title) return null

  return title
}

export function parseReminderPayload(content: string): ReminderMessageView | null {
  const root = parseJsonObject(content)
  if (!root) return null

  const type8Reminder = parseType8Reminder(root)
  if (type8Reminder) return type8Reminder

  const title = typeof root.title === 'string' ? root.title.trim() : ''
  if (!title) return null

  const params = parseJsonObject(root.params)
  const hasCalendarAction = extractCalendarAction(params)
  const action = typeof root.action === 'string' ? root.action.trim() : ''
  const iconUrl = typeof params?.iconUrl === 'string' ? params.iconUrl : ''
  const titleLooksLikeReminder = /nhắc hẹn|reminder/i.test(title)
  const iconLooksLikeReminder = /alarm|calendar/i.test(iconUrl)
  const isReminderAction = action === 'msginfo.actionlist'

  if ((isReminderAction && (hasCalendarAction || titleLooksLikeReminder || iconLooksLikeReminder)) || hasCalendarAction) {
    return { title }
  }

  return null
}
