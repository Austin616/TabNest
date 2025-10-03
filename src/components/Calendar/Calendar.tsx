import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { useTodos } from '../../contexts/TodoContext'
import { shouldShowTaskForDate } from '../../utils/todoDateUtils'
import type { Todo } from '../../types/todo'

interface CalendarProps {
  // Props can be added here if needed for future functionality
}

type CalendarView = 'month' | 'week'

const Calendar: React.FC<CalendarProps> = () => {
  const { todos } = useTodos()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<CalendarView>('month')

  // Get todos for a specific date
  const getTodosForDate = (date: Date): Todo[] => {
    return todos.filter(todo => shouldShowTaskForDate(todo, date))
  }

  // Get todos for a week
  const getTodosForWeek = (startDate: Date): { [key: string]: Todo[] } => {
    const weekTodos: { [key: string]: Todo[] } = {}
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateKey = date.toDateString()
      weekTodos[dateKey] = getTodosForDate(date)
    }
    return weekTodos
  }

  // Month view helpers
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  // Week view helpers
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
  const weekTodos = useMemo(() => getTodosForWeek(weekDays[0]), [weekDays, todos])

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

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const getTodoCountForDate = (date: Date): number => {
    return getTodosForDate(date).length
  }

  const getCompletedCountForDate = (date: Date): number => {
    return getTodosForDate(date).filter(todo => todo.completed).length
  }

  const getOverdueCountForDate = (date: Date): number => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    return getTodosForDate(date).filter(todo => 
      !todo.completed && todo.dueDate && todo.dueDate < today
    ).length
  }

  return (
    <div className="w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Calendar View
            </h2>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'month'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                  viewMode === 'week'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Content */}
        <div className="p-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={viewMode === 'month' ? () => navigateMonth('prev') : () => navigateWeek('prev')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {viewMode === 'month' 
                  ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : `${weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                }
              </h3>
              
              <button
                onClick={viewMode === 'month' ? () => navigateMonth('next') : () => navigateWeek('next')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            
            <button
              onClick={goToToday}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Calendar Grid */}
          {viewMode === 'month' ? (
            <div className="space-y-4">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Month grid */}
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date, index) => {
                  const todoCount = getTodoCountForDate(date)
                  const completedCount = getCompletedCountForDate(date)
                  const overdueCount = getOverdueCountForDate(date)
                  
                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border border-slate-200 dark:border-slate-700 rounded-lg ${
                        isToday(date)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                          : isCurrentMonth(date)
                          ? 'bg-white dark:bg-slate-800'
                          : 'bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          isToday(date) 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : isCurrentMonth(date)
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {date.getDate()}
                        </span>
                        
                        {todoCount > 0 && (
                          <div className="flex space-x-1">
                            {overdueCount > 0 && (
                              <span className="w-2 h-2 bg-red-500 rounded-full" title={`${overdueCount} overdue`} />
                            )}
                            {completedCount > 0 && (
                              <span className="w-2 h-2 bg-green-500 rounded-full" title={`${completedCount} completed`} />
                            )}
                            {todoCount - completedCount - overdueCount > 0 && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full" title={`${todoCount - completedCount - overdueCount} pending`} />
                            )}
                          </div>
                        )}
                      </div>
                      
                      {todoCount > 0 && (
                        <div className="space-y-1">
                          {getTodosForDate(date).slice(0, 3).map(todo => (
                            <div
                              key={todo.id}
                              className={`text-xs p-1 rounded truncate ${
                                todo.completed
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 line-through'
                                  : todo.dueDate && todo.dueDate < new Date() && !todo.completed
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              {todo.text}
                            </div>
                          ))}
                          {todoCount > 3 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              +{todoCount - 3} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Week view */}
              <div className="grid grid-cols-7 gap-4">
              {weekDays.map((date, index) => {
                const dayTodos = weekTodos[date.toDateString()] || []
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className={`text-center p-3 rounded-lg ${
                        isToday(date)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-600'
                          : 'bg-slate-50 dark:bg-slate-700/50'
                      }`}>
                        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-semibold ${
                          isToday(date) 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {date.getDate()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {date.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      </div>
                      
                      <div className="space-y-2 min-h-[200px]">
                        {dayTodos.length > 0 ? (
                          dayTodos.map(todo => (
                            <div
                              key={todo.id}
                              className={`p-3 rounded-lg text-sm ${
                                todo.completed
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 line-through'
                                  : todo.dueDate && todo.dueDate < new Date() && !todo.completed
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                              }`}
                            >
                              <div className="font-medium truncate">{todo.text}</div>
                              {todo.dueTime && (
                                <div className="text-xs opacity-75 mt-1">
                                  {todo.dueTime}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-slate-400 dark:text-slate-500 text-sm py-8">
                            No tasks
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
    </div>
  )
}

export default Calendar

