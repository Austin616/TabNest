import React, { useState, useMemo, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react'
import TodoList from '../../components/Todo/TodoList'
import CalendarDayModal from '../../components/Calendar/CalendarDayModal'
import { useTodos } from '../../contexts/TodoContext'
import type { Todo } from '../../types/todo'

type ViewMode = 'list' | 'month' | 'week' | 'day'

interface DashboardProps {
  onAddTaskClick: () => void
  onEditTodo: (todo: Todo) => void
}

const Dashboard: React.FC<DashboardProps> = ({ onAddTaskClick, onEditTodo }) => {
  const { todos } = useTodos()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isDayModalOpen, setIsDayModalOpen] = useState(false)

  // Calendar utility functions
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    
    return days
  }

  const monthDays = useMemo(() => getMonthDays(currentDate), [currentDate])
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])

  // Get todos for a specific date - only show tasks on their exact due date
  const getTodosForDate = (date: Date): Todo[] => {
    return todos.filter(todo => {
      if (!todo.dueDate) return true
      
      const dueDate = new Date(todo.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)
      
      return dueDate.getTime() === checkDate.getTime()
    })
  }

  const getTodosForWeek = useCallback((startDate: Date) => {
    const weekTodos: { [key: string]: Todo[] } = {}
    const weekDays = getWeekDays(startDate)
    
    weekDays.forEach(day => {
      weekTodos[day.toDateString()] = getTodosForDate(day)
    })
    
    return weekTodos
  }, [todos])

  const weekTodos = useMemo(() => getTodosForWeek(weekDays[0]), [weekDays, getTodosForWeek])

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getOverdueCountForDate = (date: Date) => {
    const dayTodos = getTodosForDate(date)
    return dayTodos.filter(todo => 
      todo.dueDate && todo.dueDate < new Date() && !todo.completed
    ).length
  }

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 7)
      } else {
        newDate.setDate(prev.getDate() + 7)
      }
      return newDate
    })
  }

  const navigateDay = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setDate(prev.getDate() - 1)
      } else {
        newDate.setDate(prev.getDate() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsDayModalOpen(true)
  }

  const closeDayModal = () => {
    setIsDayModalOpen(false)
    setSelectedDate(null)
  }

  const renderCalendarContent = () => {
    if (viewMode === 'month') {
      return (
        <div className="space-y-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="p-4 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((date, index) => {
              const dayTodos = getTodosForDate(date)
              const overdueCount = getOverdueCountForDate(date)
              
              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(date)}
                  className={`p-4 h-24 rounded-lg transition-all hover:shadow-md text-left ${
                    isToday(date)
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                      : isCurrentMonth(date)
                      ? 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                      : 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  <div className={`text-lg font-semibold ${
                    isToday(date) 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : isCurrentMonth(date)
                      ? 'text-slate-900 dark:text-slate-100'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {date.getDate()}
                  </div>
                  
                  {dayTodos.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {dayTodos.slice(0, 2).map(todo => (
                        <div
                          key={todo.id}
                          className={`text-xs p-1 rounded truncate ${
                            todo.completed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                              : todo.dueDate && todo.dueDate < new Date() && !todo.completed
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {todo.text}
                        </div>
                      ))}
                      {dayTodos.length > 2 && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          +{dayTodos.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                  
                  {overdueCount > 0 && (
                    <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )
    } else if (viewMode === 'week') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-7 gap-6">
            {weekDays.map((date, index) => {
              const dayTodos = weekTodos[date.toDateString()] || []
              
              return (
                <div key={index} className="space-y-3">
                  <button
                    onClick={() => handleDayClick(date)}
                    className={`w-full text-center p-4 rounded-lg transition-all hover:shadow-md ${
                      isToday(date)
                        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                        : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>
                    <div className={`text-2xl font-bold ${
                      isToday(date) 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </button>
                  
                  <div className="space-y-2 min-h-[300px]">
                    {dayTodos.length > 0 ? (
                      dayTodos.map(todo => (
                        <div
                          key={todo.id}
                          className={`p-3 rounded-lg text-sm transition-all hover:shadow-md cursor-pointer ${
                            todo.completed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 line-through'
                              : todo.dueDate && todo.dueDate < new Date() && !todo.completed
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40'
                          }`}
                          onClick={() => handleDayClick(date)}
                        >
                          <div className="font-medium">{todo.text}</div>
                          {todo.dueTime && (
                            <div className="text-xs opacity-75 mt-1">
                              {todo.dueTime}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-12">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    } else if (viewMode === 'day') {
      const dayTodos = getTodosForDate(currentDate)
      const completedTodos = dayTodos.filter(todo => todo.completed)
      const pendingTodos = dayTodos.filter(todo => !todo.completed)
      const overdueTodos = pendingTodos.filter(todo => 
        todo.dueDate && todo.dueDate < new Date() && !todo.completed
      )
      
      return (
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {currentDate.getDate()}
              </div>
              <div className="text-xl text-slate-600 dark:text-slate-400">
                {currentDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="space-y-4">
              {overdueTodos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                    Overdue Tasks ({overdueTodos.length})
                  </h3>
                  <div className="space-y-2">
                    {overdueTodos.map(todo => (
                      <div
                        key={todo.id}
                        className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:shadow-md cursor-pointer transition-all"
                        onClick={() => handleDayClick(currentDate)}
                      >
                        <div className="font-medium">{todo.text}</div>
                        {todo.description && (
                          <div className="text-sm opacity-75 mt-1">{todo.description}</div>
                        )}
                        {todo.dueTime && (
                          <div className="text-sm opacity-75 mt-1">
                            Due at {todo.dueTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {pendingTodos.filter(todo => !overdueTodos.includes(todo)).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    Today's Tasks ({pendingTodos.filter(todo => !overdueTodos.includes(todo)).length})
                  </h3>
                  <div className="space-y-2">
                    {pendingTodos.filter(todo => !overdueTodos.includes(todo)).map(todo => (
                      <div
                        key={todo.id}
                        className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:shadow-md cursor-pointer transition-all"
                        onClick={() => handleDayClick(currentDate)}
                      >
                        <div className="font-medium">{todo.text}</div>
                        {todo.description && (
                          <div className="text-sm opacity-75 mt-1">{todo.description}</div>
                        )}
                        {todo.dueTime && (
                          <div className="text-sm opacity-75 mt-1">
                            Due at {todo.dueTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {completedTodos.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Completed Tasks ({completedTodos.length})
                  </h3>
                  <div className="space-y-2">
                    {completedTodos.map(todo => (
                      <div
                        key={todo.id}
                        className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg line-through opacity-75"
                      >
                        <div className="font-medium">{todo.text}</div>
                        {todo.description && (
                          <div className="text-sm opacity-75 mt-1">{todo.description}</div>
                        )}
                        {todo.dueTime && (
                          <div className="text-sm opacity-75 mt-1">
                            Completed at {todo.dueTime}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {dayTodos.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-slate-400 dark:text-slate-500 text-lg mb-2">
                    No tasks for this day
                  </div>
                  <div className="text-slate-400 dark:text-slate-500 text-sm">
                    Click anywhere to add a task
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center">
              <button
                onClick={() => handleDayClick(currentDate)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Add Task for Today
              </button>
            </div>
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
        {/* Header with view toggles */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <List className="w-4 h-4" />
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center space-x-2 ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'day'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Navigation (only show for calendar views) */}
        {viewMode !== 'list' && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={
                  viewMode === 'month' 
                    ? () => navigateMonth('prev') 
                    : viewMode === 'week' 
                    ? () => navigateWeek('prev')
                    : () => navigateDay('prev')
                }
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
              
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                {viewMode === 'month' 
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : viewMode === 'week'
                  ? `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                  : currentDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })
                }
              </h2>
              
              <button
                onClick={
                  viewMode === 'month' 
                    ? () => navigateMonth('next') 
                    : viewMode === 'week' 
                    ? () => navigateWeek('next')
                    : () => navigateDay('next')
                }
                className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <button
              onClick={goToToday}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Today
            </button>
          </div>
        )}

        {/* Content */}
        {viewMode === 'list' ? (
          <TodoList onAddTaskClick={onAddTaskClick} onEditTodo={onEditTodo} />
        ) : (
          renderCalendarContent()
        )}
      </div>

      {/* Calendar Day Modal */}
      <CalendarDayModal
        isOpen={isDayModalOpen}
        onClose={closeDayModal}
        selectedDate={selectedDate}
      />
    </div>
  )
}

export default Dashboard
