import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Task, User, SocketType } from '../types'
import { taskFormSchema, TaskFormValues } from '../lib/validations'

interface TaskFormProps {
  task?: Task | null
  onClose: () => void
  socket: SocketType | null
}

const TaskForm = ({ task, onClose, socket }: TaskFormProps) => {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIUM',
      status: 'TODO',
      assignedToId: ''
    }
  })

  const { data: response } = useQuery<{ status: string; data: User[] }>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/users`,
        {
          credentials: 'include'
        }
      )
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    }
  })

  const users = response?.data || []

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const taskData = {
        title: data.title.trim(),
        description: data.description?.trim() || ' ', 
        dueDate: new Date(data.dueDate).toISOString(),
        priority: data.priority, 
        status: data.status, 
        assignedToId: data.assignedToId || null
      }

      console.log('Submitting task data (create):', JSON.stringify(taskData))

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(taskData)
        }
      )

      if (!response.ok) throw new Error('Failed to create task')
      return response.json()
    },
    onSuccess: newTask => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      socket?.emit('task:created', newTask)
      onClose()
    }
  })

  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      
      const taskData = {
        title: data.title.trim(),
        description: data.description?.trim() || ' ', 
        dueDate: new Date(data.dueDate).toISOString(),
        priority: data.priority, 
        status: data.status, 
        assignedToId: data.assignedToId || null 
};

      console.log('Submitting task data (update):', JSON.stringify(taskData))

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api/v1/tasks/${task!.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(taskData)
        }
      )

      if (!response.ok) throw new Error('Failed to update task')
      return response.json()
    },
    onSuccess: updatedTask => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      socket?.emit('task:updated', updatedTask)
      onClose()
    }
  })

  useEffect(() => {
    if (task) {
      setValue('title', task.title)
      setValue('description', task.description)
      setValue('dueDate', task.dueDate.split('T')[0])
      setValue('priority', task.priority)
      setValue('status', task.status)
      setValue('assignedToId', task.assignedToId || '')
    }
  }, [task, setValue])

  const onSubmit = (data: TaskFormValues) => {
    try {
      console.log('Form raw values:', data)

      if (task) {
        updateTaskMutation.mutate(data)
      } else {
        createTaskMutation.mutate(data)
      }
    } catch (error) {
      console.error('Error creating task data:', error)
    }
  }

  const isPending = createTaskMutation.isPending || updateTaskMutation.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                {...register('title')}
                type="text"
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter task title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter task description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  {...register('dueDate', { required: 'Due date is required' })}
                  type="date"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.dueDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  {...register('priority', { required: 'Priority is required' })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.priority ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.priority.message}
                  </p>
                )}
              </div>
            </div>

            {task && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  {...register('status', { required: 'Status is required' })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.status ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.status.message}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To *
              </label>
              <select
                {...register('assignedToId', {
                  required: 'Please assign to a user'
                })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.assignedToId ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {errors.assignedToId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.assignedToId.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isPending ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TaskForm
