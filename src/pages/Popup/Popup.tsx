import React, { useState, useEffect } from 'react'
import { ExternalLink, ClipboardList, Settings } from 'lucide-react'
import { useTodos } from '../../contexts/TodoContext'
import type { Todo } from '../../types/todo'
 

const Popup: React.FC = () => {
  const { todos, addTodo, toggleTodoComplete } = useTodos()
  const [newTask, setNewTask] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminderDays, setReminderDays] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Create date from input string without timezone issues
  const createDateFromInput = (dateString: string) => {
    if (!dateString) return undefined
    // Parse YYYY-MM-DD as local date, not UTC
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day, 23, 59, 59, 999) // End of day local time
    return date
  }

  // Format due date for display
  const formatDueDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const addQuickTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim() === '') return

    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of day for due date

    const newTodo: Omit<Todo, 'id' | 'createdAt'> = {
      text: newTask.trim(),
      description: description.trim() || undefined,
      completed: false,
      dueDate: dueDate ? createDateFromInput(dueDate) : today, // Always set due date, default to today
      reminderDays: reminderDays ? parseInt(reminderDays) : undefined,
      tags: []
    }

    addTodo(newTodo)
    
    // Reset form
    setNewTask('')
    setDescription('')
    setDueDate('')
    setReminderDays('')
    setShowAdvanced(false)
  }

  const toggleTodo = (id: string) => {
    toggleTodoComplete(id)
  }

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') })
    } else {
      // Fallback for development
      window.open('/dashboard', '_blank')
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }

  const todayTodos = todos.filter(todo => {
    if (!todo.dueDate) return true // Show tasks without due dates
    const today = new Date()
    const todoDate = new Date(todo.dueDate)
    return todoDate.toDateString() === today.toDateString()
  })

  const activeTodos = todayTodos.filter(todo => !todo.completed)
  const completedTodos = todayTodos.filter(todo => todo.completed)

  return (
    <div className="w-80 min-h-96 max-h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-700/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            TabNest
          </div>
          <button
            onClick={openDashboard}
            className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-all duration-200"
            title="Open Dashboard"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            {formatTime(currentTime)}
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {formatDate(currentTime)}
          </div>
        </div>
      </div>

      {/* Quick Add Task */}
      <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50">
        <form onSubmit={addQuickTask} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Quick add task..."
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                showAdvanced
                  ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500'
                  : 'bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700'
              }`}
              aria-label="Toggle advanced options"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={newTask.trim() === ''}
              className="px-3 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              Add
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-white/20 dark:bg-slate-700/20 rounded-lg border border-slate-200/30 dark:border-slate-600/30">
              <div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    title="Due Date"
                  />
                </div>
                
                <div>
                  <select
                    value={reminderDays}
                    onChange={(e) => setReminderDays(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    title="Reminder"
                  >
                    <option value="">No reminder</option>
                    <option value="1">1 day before</option>
                    <option value="2">2 days before</option>
                    <option value="3">3 days before</option>
                    <option value="7">1 week before</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Today's Tasks */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Today's Tasks
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {activeTodos.length} active
          </span>
        </div>

        <div className="space-y-2">
          {todayTodos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No tasks for today
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Add a task above to get started
              </p>
            </div>
          ) : (
            <>
              {/* Active Tasks */}
              {activeTodos.map((todo) => {
                const isOverdue = todo.dueDate && todo.dueDate < new Date() && !todo.completed
                const isDueToday = todo.dueDate && todo.dueDate.toDateString() === new Date().toDateString()
                
                return (
                  <div
                    key={todo.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm ${
                      isOverdue 
                        ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-700' 
                        : 'bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className={`mt-0.5 w-4 h-4 rounded focus:ring-2 transition-colors ${
                        isOverdue 
                          ? 'text-red-500 bg-white dark:bg-slate-600 border-red-300 dark:border-red-600 focus:ring-red-500'
                          : 'text-blue-600 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-blue-500'
                      }`}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-sm font-medium truncate ${
                            isOverdue
                              ? 'text-red-700 dark:text-red-300'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {todo.text}
                        </span>
                        
                        {todo.dueDate && (
                          <span
                            className={`px-1.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                              isOverdue
                                ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                : isDueToday
                                ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                                : 'bg-slate-100 dark:bg-slate-600 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {formatDueDate(todo.dueDate)}
                          </span>
                        )}
                      </div>
                      
                      {todo.description && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {todo.description}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Completed Tasks */}
              {completedTodos.length > 0 && (
                <>
                  <div className="mt-4 mb-2">
                    <h4 className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                      Completed ({completedTodos.length})
                    </h4>
                  </div>
                  {completedTodos.map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-start gap-3 p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg border border-slate-200/30 dark:border-slate-600/30 opacity-75"
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="mt-0.5 w-4 h-4 text-blue-600 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-slate-500 dark:text-slate-400 line-through truncate">
                            {todo.text}
                          </span>
                          
                          {todo.dueDate && (
                            <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400 flex-shrink-0">
                              {formatDueDate(todo.dueDate)}
                            </span>
                          )}
                        </div>
                        
                        {todo.description && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                            {todo.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40">
        <button
          onClick={openDashboard}
          className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          Open Full Dashboard
        </button>
      </div>
    </div>
  )
}

export default Popup
