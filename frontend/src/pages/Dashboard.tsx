import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { io } from 'socket.io-client'
import TaskList from '../components/TaskList'
import TaskForm from '../components/TaskForm'
import { Task, SocketType, User } from '../types'

const Dashboard = () => {
  const [socket, setSocket] = useState<SocketType | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000', {
      withCredentials: true,
    })
    setSocket(newSocket)

    newSocket.on('task:updated', (updatedTask: Task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.setQueryData(['task', updatedTask.id], updatedTask)
    })

    newSocket.on('task:created', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    })

    newSocket.on('task:deleted', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    })

    return () => {
      newSocket.close()
    }
  }, [queryClient])

  const { data: response } = useQuery<{status: string, data: User}>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/users/me`, {
        credentials: 'include'
      })
      if (!response.ok) throw new Error('Failed to fetch user')
      return response.json()
    }
  })

  const currentUser = response?.data

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/tasks`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const res = await response.json();
      return Array.isArray(res) ? res : res?.data || [];
    },
    enabled: !!currentUser,
  })

  
  const stats = tasks && currentUser ? {
    assignedToMe: tasks.filter(task => task.assignedToId === currentUser.id).length,
    createdByMe: tasks.filter(task => task.creatorId === currentUser.id).length,
    overdue: tasks.filter(task => new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED').length
  } : null

  const deleteTaskMutation = useMutation({
  mutationFn: async (taskId: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/tasks/${taskId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    )

    if (!response.ok) {
      throw new Error('Failed to delete task')
    }

    return { success: true }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] })
    socket?.emit('task:deleted')
  },
})


  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId)
    }
  }

  const handleTaskFormClose = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Task Dashboard</h1>
              <p className="text-slate-600">Manage your tasks and stay productive</p>
            </div>
            <button
              onClick={() => setShowTaskForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Task
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500">Assigned to Me</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.assignedToMe || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Tasks to complete</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500">Created by Me</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.createdByMe || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Tasks created</p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-slate-500">Overdue</span>
              </div>
              <p className="text-3xl font-bold text-slate-900">{stats?.overdue || 0}</p>
              <p className="text-sm text-slate-600 mt-1">Need attention</p>
            </div>
          </div>
        </div>

        <TaskList 
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          socket={socket}
        />

        {showTaskForm && (
          <TaskForm
            task={editingTask}
            onClose={handleTaskFormClose}
            socket={socket}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
