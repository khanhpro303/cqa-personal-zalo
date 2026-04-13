export interface ReminderMessageView {
  title: string
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

export function parseReminderPayload(content: string): ReminderMessageView | null {
  const root = parseJsonObject(content)
  if (!root) return null

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
