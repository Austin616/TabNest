import React, { useState, useEffect } from 'react'
import { ExternalLink, ClipboardList, Settings, Calendar, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTodos } from '../../contexts/TodoContext'
import { organizeTodosByDate, getEmptyStateMessage, isTaskReminderActive, formatTimeForDisplay } from '../../utils/todoDateUtils'
import type { Todo } from '../../types/todo'

type ViewMode = 'day' | 'week'

// Inline Edit Component
const TodoInlineEdit: React.FC<{
  todo: Todo
  onSave: (updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  onCancel: () => void
}> = ({ todo, onSave, onCancel }) => {
  const [text, setText] = useState(todo.text)
  const [description, setDescription] = useState(todo.description || '')
  const [dueTime, setDueTime] = useState(todo.dueTime || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSave({
        text: text.trim(),
        description: description.trim() || undefined,
        dueTime: dueTime.trim() || undefined
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-3 pb-1">
      <div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Task name"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          autoFocus
        />
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add notes..."
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
      </div>
      <div>
        <input
          type="time"
          value={dueTime}
          onChange={(e) => setDueTime(e.target.value)}
          placeholder="Due time..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div className="space-y-2 pb-1">
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex-1 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-sm bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-300 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            // Open dashboard with this specific todo for editing
            if (typeof chrome !== 'undefined' && chrome.tabs) {
              chrome.tabs.create({ 
                url: chrome.runtime.getURL(`index.html#/dashboard?edit=${todo.id}`) 
              })
            } else {
              // Fallback for development
              window.open(`/dashboard?edit=${todo.id}`, '_blank')
            }
          }}
          className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-1 py-1"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in dashboard for full edit
        </button>
      </div>
    </form>
  )
}

const Popup: React.FC = () => {
  const { todos, addTodo, toggleTodoComplete, editTodo } = useTodos()
  const [newTask, setNewTask] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('23:59')
  const [reminderDays, setReminderDays] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [dateFormat, setDateFormat] = useState<'relative' | 'absolute'>('relative')
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)

  // Create date from input string without timezone issues
  const createDateFromInput = (dateString: string) => {
    if (!dateString) return undefined
    // Parse YYYY-MM-DD as local date, not UTC
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day, 23, 59, 59, 999) // End of day local time
    return date
  }


  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Navigation functions
  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (viewMode === 'day') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
      } else {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      }
      return newDate
    })
  }

  // Format current date for display
  const formatCurrentDate = () => {
    if (viewMode === 'day') {
      const today = new Date()
      if (currentDate.toDateString() === today.toDateString()) {
        return 'Today'
      } else {
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      }
    } else {
      // Week view
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' })
      const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' })
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startOfWeek.getDate()}-${endOfWeek.getDate()}`
      } else {
        return `${startMonth} ${startOfWeek.getDate()} - ${endMonth} ${endOfWeek.getDate()}`
      }
    }
  }

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
      dueTime: dueTime.trim() || '23:59',
      reminderDays: reminderDays ? parseInt(reminderDays) : undefined,
      tags: []
    }

    addTodo(newTodo)
    
    // Reset form
    setNewTask('')
    setDescription('')
    setDueDate('')
    setDueTime('23:59')
    setReminderDays('')
    setShowAdvanced(false)
  }

  const toggleTodo = (id: string) => {
    toggleTodoComplete(id)
  }

  const handleEditTodo = (todo: Todo) => {
    console.log('handleEditTodo called with todo:', todo.text)
    // Toggle edit dropdown for this todo
    setEditingTodoId(editingTodoId === todo.id ? null : todo.id)
  }

  const openDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html#/') })
    } else {
      // Fallback for development
      window.open('/', '_blank')
    }
  }


  const formatCurrentTime = (date: Date) => {
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

  // Organize todos by date categories
  const organizedTodos = organizeTodosByDate(todos, currentDate, viewMode, dateFormat)
  const allFilteredTodos = organizedTodos.flatMap(group => group.todos)
  const activeTodos = allFilteredTodos.filter(todo => !todo.completed)

  return (
    <div className="w-80 min-h-96 max-h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden flex flex-col">
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

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Calendar className="w-3 h-3" />
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <CalendarDays className="w-3 h-3" />
              Week
            </button>
          </div>
        </div>

        {/* Date Format Toggle */}
        <div className="flex items-center justify-center mb-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setDateFormat('relative')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                dateFormat === 'relative'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Show relative dates (Today, Tomorrow, etc.)"
            >
              Relative
            </button>
            <button
              onClick={() => setDateFormat('absolute')}
              className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                dateFormat === 'absolute'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Show absolute dates (Oct 1, Sep 28, etc.)"
            >
              Absolute
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateDate('prev')}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
            title={`Previous ${viewMode}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {formatCurrentDate()}
          </div>
          
          <button
            onClick={() => navigateDate('next')}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
            title={`Next ${viewMode}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-semibold text-slate-800 dark:text-slate-200">
            {formatCurrentTime(currentTime)}
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
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    title="Due Time"
                  />
                </div>
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
          )}
        </form>
      </div>

      {/* Today's Tasks */}
      <div className="flex-1 p-4 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {viewMode === 'day' 
              ? (currentDate.toDateString() === new Date().toDateString() ? "Today's Tasks" : `${formatCurrentDate()} Tasks`)
              : "Week's Tasks"
            }
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {activeTodos.length} active
          </span>
        </div>

        <div className="space-y-4">
          {organizedTodos.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 dark:text-slate-500 mb-2">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-50" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {getEmptyStateMessage(currentDate, viewMode)}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Add a task above to get started
              </p>
            </div>
          ) : (
            organizedTodos.map((group, groupIndex) => (
              <div key={`${group.type}-${groupIndex}`} className="space-y-2">
                {/* Group Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h4 className={`text-xs font-semibold tracking-wide ${
                      group.type === 'overdue' 
                        ? 'text-red-600 dark:text-red-400'
                        : group.type === 'today'
                        ? 'text-blue-600 dark:text-blue-400'
                        : group.type === 'completed'
                        ? 'text-slate-500 dark:text-slate-500'
                        : group.title.includes('(Reminder)')
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {group.title}
                    </h4>
                    {group.title.includes('(Reminder)') && (
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    group.type === 'overdue'
                      ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                      : group.type === 'today'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                      : group.type === 'completed'
                      ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700'
                      : group.title.includes('(Reminder)')
                      ? 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30'
                      : 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700'
                  }`}>
                    {group.todos.length}
                  </span>
                </div>

                {/* Group Tasks */}
                <div className={`space-y-2 pl-2 border-l-2 ${
                  group.type === 'overdue'
                    ? 'border-red-300 dark:border-red-600'
                    : group.type === 'today'
                    ? 'border-blue-300 dark:border-blue-600'
                    : group.type === 'completed'
                    ? 'border-slate-200 dark:border-slate-700'
                    : group.title.includes('(Reminder)')
                    ? 'border-orange-300 dark:border-orange-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}>
                  {group.todos.map((todo) => {
                    const isOverdue = todo.dueDate && todo.dueDate < new Date() && !todo.completed
                    const isCompleted = todo.completed
                    const hasActiveReminder = isTaskReminderActive(todo, currentDate)
                    
                    return (
                      <div
                        key={todo.id}
                        className={`rounded-lg border transition-all duration-200 ${
                          isCompleted
                            ? 'bg-white/30 dark:bg-slate-700/30 border-slate-200/30 dark:border-slate-600/30 opacity-60'
                            : isOverdue 
                            ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-700' 
                            : hasActiveReminder
                            ? 'bg-orange-50/80 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 ring-2 ring-orange-200 dark:ring-orange-800'
                            : 'bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50'
                        } ${editingTodoId === todo.id ? 'ring-2 ring-blue-500/20' : ''}`}
                      >
                        {/* Todo Item */}
                        <div
                          className={`flex items-start gap-3 p-3 cursor-pointer transition-all duration-200 ${
                            editingTodoId !== todo.id ? 'hover:shadow-sm hover:bg-white/70 dark:hover:bg-slate-700/70' : ''
                          }`}
                          onClick={() => handleEditTodo(todo)}
                        >
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={(e) => {
                              e.stopPropagation()
                              toggleTodo(todo.id)
                            }}
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
                                  isCompleted
                                    ? 'text-slate-500 dark:text-slate-400 line-through'
                                    : isOverdue
                                    ? 'text-red-700 dark:text-red-300'
                                    : hasActiveReminder
                                    ? 'text-orange-700 dark:text-orange-300'
                                    : 'text-slate-800 dark:text-slate-200'
                                }`}
                              >
                                {hasActiveReminder && !isCompleted && (
                                  <span className="inline-flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mr-1">
                                    🔔
                                  </span>
                                )}
                                {todo.text}
                              </span>
                              
                              {todo.dueTime && todo.dueDate && (
                                <span
                                  className={`px-1.5 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                                    isCompleted
                                      ? 'bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400'
                                      : isOverdue
                                      ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  🕐 {formatTimeForDisplay(todo.dueTime, todo.dueDate, dateFormat)}
                                </span>
                              )}
                            </div>
                            
                            {todo.description && (
                              <p className={`text-xs truncate ${
                                isCompleted
                                  ? 'text-slate-400 dark:text-slate-500'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}>
                                {todo.description}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Inline Edit Dropdown */}
                        {editingTodoId === todo.id && (
                          <div className="border-t border-slate-200/50 dark:border-slate-700/50 px-3 pb-3 bg-slate-50/30 dark:bg-slate-800/30">
                            <TodoInlineEdit
                              todo={todo}
                              onSave={(updates) => {
                                editTodo(todo.id, updates)
                                setEditingTodoId(null)
                              }}
                              onCancel={() => setEditingTodoId(null)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
          
          {/* Bottom spacing to prevent overlap with footer */}
          <div className="h-4"></div>
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
