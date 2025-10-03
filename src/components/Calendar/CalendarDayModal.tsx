import React, { useState } from 'react'
import { X, Plus, Clock, Calendar as CalendarIcon, Bell } from 'lucide-react'
import { useTodos } from '../../contexts/TodoContext'
import { shouldShowTaskForDate } from '../../utils/todoDateUtils'
import TodoModal from '../Todo/TodoModal'
import type { Todo } from '../../types/todo'

interface CalendarDayModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
}

const CalendarDayModal: React.FC<CalendarDayModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const { todos, addTodo, toggleTodoComplete } = useTodos()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  if (!isOpen || !selectedDate) return null

  const dayTodos = todos.filter(todo => shouldShowTaskForDate(todo, selectedDate))
  const completedTodos = dayTodos.filter(todo => todo.completed)
  const pendingTodos = dayTodos.filter(todo => !todo.completed)
  const overdueTodos = pendingTodos.filter(todo => 
    todo.dueDate && todo.dueDate < new Date() && !todo.completed
  )

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return null
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatReminderDate = (reminderDays: number, dueDate: Date) => {
    if (!reminderDays || !dueDate) return null
    const reminderDate = new Date(dueDate)
    reminderDate.setDate(dueDate.getDate() - reminderDays)
    return reminderDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: reminderDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    })
  }

  const handleAddTodo = (newTodo: Omit<Todo, 'id' | 'createdAt'>) => {
    addTodo(newTodo)
    setIsAddModalOpen(false)
  }

  const TaskItem: React.FC<{ todo: Todo }> = ({ todo }) => (
    <div className={`p-4 rounded-lg border transition-all hover:shadow-md ${
      todo.completed
        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
        : overdueTodos.includes(todo)
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
    }`}>
      <div className="flex items-start space-x-3">
        <button
          onClick={() => toggleTodoComplete(todo.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-slate-300 dark:border-slate-600 hover:border-green-400'
          }`}
        >
          {todo.completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-slate-900 dark:text-slate-100 ${
            todo.completed ? 'line-through opacity-60' : ''
          }`}>
            {todo.text}
          </h3>
          
          {todo.description && (
            <p className={`mt-1 text-sm text-slate-600 dark:text-slate-400 ${
              todo.completed ? 'line-through opacity-60' : ''
            }`}>
              {todo.description}
            </p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {todo.dueTime && (
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                <span>{formatTime(todo.dueTime)}</span>
              </div>
            )}
            
            {todo.dueDate && (
              <div className="flex items-center space-x-1 text-slate-500 dark:text-slate-400">
                <CalendarIcon className="w-3 h-3" />
                <span>Due: {todo.dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            )}
            
            {todo.reminderDays && todo.dueDate && (
              <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                <Bell className="w-3 h-3" />
                <span>Reminder: {formatReminderDate(todo.reminderDays, todo.dueDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {formatDate(selectedDate)}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {dayTodos.length === 0 
                  ? 'No tasks scheduled'
                  : `${dayTodos.length} task${dayTodos.length === 1 ? '' : 's'} • ${completedTodos.length} completed`
                }
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
            {dayTodos.length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No tasks scheduled for this day
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Task</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Overdue Tasks */}
                {overdueTodos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Overdue ({overdueTodos.length})
                    </h3>
                    <div className="space-y-3">
                      {overdueTodos.map(todo => (
                        <TaskItem key={todo.id} todo={todo} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Pending Tasks */}
                {pendingTodos.filter(todo => !overdueTodos.includes(todo)).length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Pending ({pendingTodos.filter(todo => !overdueTodos.includes(todo)).length})
                    </h3>
                    <div className="space-y-3">
                      {pendingTodos.filter(todo => !overdueTodos.includes(todo)).map(todo => (
                        <TaskItem key={todo.id} todo={todo} />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Completed Tasks */}
                {completedTodos.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Completed ({completedTodos.length})
                    </h3>
                    <div className="space-y-3">
                      {completedTodos.map(todo => (
                        <TaskItem key={todo.id} todo={todo} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <TodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTodo={handleAddTodo}
        currentDate={selectedDate}
      />
    </>
  )
}

export default CalendarDayModal
