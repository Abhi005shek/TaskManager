import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { io } from 'socket.io-client'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

interface Notification {
  id: string
  message: string
  isRead: boolean
  createdAt: string
}

const Notifications = () => {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading, error } = useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/v1/notifications`, {
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications')
      }
      
      const result = await response.json()
      return result.data
    },
  })


  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await fetch(`${BACKEND_URL}/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${BACKEND_URL}/api/v1/notifications/mark-all-read`, {
        method: 'POST',
        credentials: 'include',
      })
      
      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      withCredentials: true,
    })

    console.log('Socket connecting to:', BACKEND_URL);

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    const getUserId = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/users/me`, {
          credentials: 'include',
        })
        if (response.ok) {
          const userData = await response.json()
          console.log('User data:', userData);
          socket.emit('joinUserRoom', userData.data.id)
          console.log('Joined room for user:', userData.data.id);
        }
      } catch (error) {
        console.error('Failed to get user ID:', error)
      }
    }

    getUserId()

    socket.on('newNotification', (notification: Notification) => {
      console.log('Received new notification:', notification);
      queryClient.setQueryData(['notifications'], (old: Notification[] = []) => [
        notification,
        ...old,
      ])
      
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Failed to load notifications
      </div>
    )
  }

  return (
    <div className="mx-auto bg-white rounded-lg shadow-md">
      <div className="p-2 border-b border-gray-200">
        <div className="flex justify-between items-center">
          {notifications.length > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
            </button>
          )}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No notifications
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  !notification.isRead ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                }`}
                onClick={() => !notification.isRead && markAsReadMutation.mutate(notification.id)}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${!notification.isRead ? 'font-medium' : ''} text-gray-900`}>
                    {notification.message}
                  </p>
                  {!notification.isRead && (
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Notifications