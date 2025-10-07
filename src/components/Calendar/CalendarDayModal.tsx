import React, { useState } from 'react'
import { X, Plus, Clock, Calendar as CalendarIcon, Bell } from 'lucide-react'
import { useTodos } from '../../contexts/TodoContext'
import type { Todo } from '../../types/todo'

interface CalendarDayModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
}

const CalendarDayModal: React.FC<CalendarDayModalProps> = ({ isOpen, onClose, selectedDate }) => {
  const { todos, addTodo, toggleTodoComplete, editTodo } = useTodos()
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Todo | null>(null)
  const [newTask, setNewTask] = useState({
    text: '',
    description: '',
    dueTime: '',
    reminderDays: ''
  })
  const [editTask, setEditTask] = useState({
    text: '',
    description: '',
    dueTime: '',
    reminderDays: ''
  })

  if (!isOpen || !selectedDate) return null

  // Only show tasks on their exact due date (no reminder logic)
  const dayTodos = todos.filter(todo => {
    // Show tasks without due dates everywhere
    if (!todo.dueDate) return true
    
    // For tasks with due dates, only show on the exact due date
    const dueDate = new Date(todo.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    const checkDate = new Date(selectedDate)
    checkDate.setHours(0, 0, 0, 0)
    
    return dueDate.getTime() === checkDate.getTime()
  })
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

  const handleAddTask = () => {
    if (newTask.text.trim() === '') return

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const newTodo: Omit<Todo, 'id' | 'createdAt'> = {
      text: newTask.text.trim(),
      description: newTask.description.trim() || undefined,
      completed: false,
      dueDate: selectedDate || today,
      dueTime: newTask.dueTime.trim() || undefined,
      reminderDays: newTask.reminderDays ? parseInt(newTask.reminderDays) : undefined,
      tags: []
    }

    addTodo(newTodo)
    setNewTask({ text: '', description: '', dueTime: '', reminderDays: '' })
    setIsAddingTask(false)
  }

  const handleCancelAdd = () => {
    setNewTask({ text: '', description: '', dueTime: '', reminderDays: '' })
    setIsAddingTask(false)
  }

  const handleClose = () => {
    // Reset all form states when closing
    setIsAddingTask(false)
    setEditingTask(null)
    setNewTask({ text: '', description: '', dueTime: '', reminderDays: '' })
    setEditTask({ text: '', description: '', dueTime: '', reminderDays: '' })
    onClose()
  }

  const handleEditTask = (todo: Todo) => {
    setEditingTask(todo)
    setEditTask({
      text: todo.text,
      description: todo.description || '',
      dueTime: todo.dueTime || '',
      reminderDays: todo.reminderDays?.toString() || ''
    })
  }

  const handleSaveEdit = () => {
    if (!editingTask || editTask.text.trim() === '') return

    editTodo(editingTask.id, {
      text: editTask.text.trim(),
      description: editTask.description.trim() || undefined,
      dueTime: editTask.dueTime.trim() || undefined,
      reminderDays: editTask.reminderDays ? parseInt(editTask.reminderDays) : undefined
    })

    setEditingTask(null)
    setEditTask({ text: '', description: '', dueTime: '', reminderDays: '' })
  }

  const handleCancelEdit = () => {
    setEditingTask(null)
    setEditTask({ text: '', description: '', dueTime: '', reminderDays: '' })
  }

  const TaskItem: React.FC<{ todo: Todo }> = ({ todo }) => {
    const isEditing = editingTask?.id === todo.id

    if (isEditing) {
      return (
        <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Task <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editTask.text}
                onChange={(e) => setEditTask(prev => ({ ...prev, text: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description
              </label>
              <textarea
                value={editTask.description}
                onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Due Time
                </label>
                <input
                  type="time"
                  value={editTask.dueTime}
                  onChange={(e) => setEditTask(prev => ({ ...prev, dueTime: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Show in advance
                </label>
                <select
                  value={editTask.reminderDays}
                  onChange={(e) => setEditTask(prev => ({ ...prev, reminderDays: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Only on due date</option>
                  <option value="1">1 day before</option>
                  <option value="2">2 days before</option>
                  <option value="3">3 days before</option>
                  <option value="7">1 week before</option>
                  <option value="14">2 weeks before</option>
                  <option value="30">1 month before</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                disabled={editTask.text.trim() === ''}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div 
        className={`p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
          todo.completed
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : overdueTodos.includes(todo)
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
        }`}
        onClick={() => handleEditTask(todo)}
      >
        <div className="flex items-start space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleTodoComplete(todo.id)
            }}
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
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <div 
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
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
              {!isAddingTask && (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              )}
              
              <button
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
          </div>

          {/* Inline Add Task Form */}
          {isAddingTask && (
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Task <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTask.text}
                    onChange={(e) => setNewTask(prev => ({ ...prev, text: e.target.value }))}
                    placeholder="What needs to be done?"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Add more details (optional)..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Due Time
                    </label>
                    <input
                      type="time"
                      value={newTask.dueTime}
                      onChange={(e) => setNewTask(prev => ({ ...prev, dueTime: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Show in advance
                    </label>
                    <select
                      value={newTask.reminderDays}
                      onChange={(e) => setNewTask(prev => ({ ...prev, reminderDays: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Only on due date</option>
                      <option value="1">1 day before</option>
                      <option value="2">2 days before</option>
                      <option value="3">3 days before</option>
                      <option value="7">1 week before</option>
                      <option value="14">2 weeks before</option>
                      <option value="30">1 month before</option>
                    </select>
                  </div>

                  <div className="flex items-end space-x-2">
                    <button
                      onClick={handleAddTask}
                      disabled={newTask.text.trim() === ''}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Add Task
                    </button>
                    <button
                      onClick={handleCancelAdd}
                      className="px-4 py-2 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
            {dayTodos.length === 0 && !isAddingTask ? (
              <div className="text-center py-12">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No tasks scheduled for this day
                </p>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Your First Task</span>
                </button>
              </div>
            ) : dayTodos.length > 0 ? (
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
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

export default CalendarDayModal
