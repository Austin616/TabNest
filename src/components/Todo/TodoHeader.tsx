import React from 'react'
import { ViewMode, DateNavigation } from '../../types/todo'

interface TodoHeaderProps {
  navigation: DateNavigation
  onNavigateDate: (direction: 'prev' | 'next') => void
  onViewModeChange: (mode: ViewMode) => void
  onAddTask: () => void
}

const TodoHeader: React.FC<TodoHeaderProps> = ({
  navigation,
  onNavigateDate,
  onViewModeChange,
  onAddTask
}) => {
  const formatHeaderDate = () => {
    const { currentDate, viewMode } = navigation
    
    if (viewMode === 'day') {
      const isToday = currentDate.toDateString() === new Date().toDateString()
      if (isToday) return "Today's Tasks"
      
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
      })
    } else {
      // Week view - show week range
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateDate('prev')}
            className="p-2 rounded-lg bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
            aria-label={`Previous ${navigation.viewMode}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 min-w-[240px] text-center">
            {formatHeaderDate()}
          </h2>
          
          <button
            onClick={() => onNavigateDate('next')}
            className="p-2 rounded-lg bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
            aria-label={`Next ${navigation.viewMode}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-700/40 rounded-lg p-1 border border-slate-200/50 dark:border-slate-600/50">
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              navigation.viewMode === 'day'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              navigation.viewMode === 'week'
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <button
        onClick={onAddTask}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
        Add Task
      </button>
    </div>
  )
}

export default TodoHeader
