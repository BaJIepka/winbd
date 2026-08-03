import { beforeEach, describe, expect, it } from 'vitest'

import { useNotificationsStore } from './notificationsStore'

beforeEach(() => {
  useNotificationsStore.setState({ notifications: [] })
})

describe('useNotificationsStore', () => {
  it('starts with empty notifications', () => {
    expect(useNotificationsStore.getState().notifications).toHaveLength(0)
  })

  it('addNotification prepends a new item with id, createdAt, and read=false', () => {
    useNotificationsStore.getState().addNotification({
      type: 'news:created',
      message: 'Статья создана',
      newsId: 'n1',
      newsTitle: 'Title',
    })
    const { notifications } = useNotificationsStore.getState()
    expect(notifications).toHaveLength(1)
    const n = notifications[0]
    expect(n.type).toBe('news:created')
    expect(n.newsId).toBe('n1')
    expect(n.read).toBe(false)
    expect(n.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(n.createdAt).toBeTruthy()
  })

  it('addNotification prepends (newest first)', () => {
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:created', message: 'A', newsId: '1', newsTitle: 'First' })
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:updated', message: 'B', newsId: '2', newsTitle: 'Second' })
    const { notifications } = useNotificationsStore.getState()
    expect(notifications[0].newsTitle).toBe('Second')
    expect(notifications[1].newsTitle).toBe('First')
  })

  it('markAllRead sets all notifications to read=true', () => {
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:created', message: 'A', newsId: '1', newsTitle: 'T1' })
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:updated', message: 'B', newsId: '2', newsTitle: 'T2' })
    useNotificationsStore.getState().markAllRead()
    const { notifications } = useNotificationsStore.getState()
    expect(notifications.every((n) => n.read)).toBe(true)
  })

  it('clearAll empties the list', () => {
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:deleted', message: 'X', newsId: '1', newsTitle: 'T' })
    useNotificationsStore.getState().clearAll()
    expect(useNotificationsStore.getState().notifications).toHaveLength(0)
  })

  it('unread count is correct', () => {
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:created', message: 'A', newsId: '1', newsTitle: 'T1' })
    useNotificationsStore
      .getState()
      .addNotification({ type: 'news:updated', message: 'B', newsId: '2', newsTitle: 'T2' })
    const unread = useNotificationsStore.getState().notifications.filter((n) => !n.read).length
    expect(unread).toBe(2)
    useNotificationsStore.getState().markAllRead()
    const unreadAfter = useNotificationsStore.getState().notifications.filter((n) => !n.read).length
    expect(unreadAfter).toBe(0)
  })
})
