import { useState } from 'react'
import { Task } from '../types'
import { Socket } from 'socket.io-client'

interface TaskListProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  socket: Socket | null
}

const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const [filter, setFilter] = useState({
    status: 'all',
    priority: 'all',
    sortBy: 'dueDate'
  })

  const filteredTasks = tasks
    ?.filter(task => {
      if (filter.status !== 'all' && task.status !== filter.status) return false
      if (filter.priority !== 'all' && task.priority !== filter.priority) return false
      return true
    })
    .sort((a, b) => {
      switch (filter.sortBy) {
        case 'dueDate':
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case 'priority':
          const priorityOrder = { 'URGENT': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'TODO': return 'bg-gray-100 text-gray-800'
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800'
      case 'REVIEW': return 'bg-purple-100 text-purple-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filter.priority}
              onChange={(e) => setFilter({ ...filter, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filter.sortBy}
              onChange={(e) => setFilter({ ...filter, sortBy: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Created Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200 overflow-x-auto">
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No tasks found matching your filters.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="p-6 hover:bg-gray-50 min-w-max">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 truncate">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                    {isOverdue(task.dueDate) && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex-shrink-0">
                        Overdue
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3 break-words">{task.description}</p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">Created by:</span> {task.creator?.name || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-medium">Assigned to:</span> {task.assignedTo?.name || 'Unassigned'}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                  <button
                    onClick={() => onEdit(task)}
                    className="text-indigo-600 hover:text-indigo-900 whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="text-red-600 hover:text-red-900 whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TaskList
