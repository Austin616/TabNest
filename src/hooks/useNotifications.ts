import { useEffect, useCallback } from 'react'

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permission when the hook is first used
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/vite.svg',
        ...options
      })
    }
    return null
  }, [])

  const checkNotificationPermission = useCallback(() => {
    if ('Notification' in window) {
      return Notification.permission
    }
    return 'denied'
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      return await Notification.requestPermission()
    }
    return 'denied'
  }, [])

  return {
    showNotification,
    checkNotificationPermission,
    requestNotificationPermission
  }
}
