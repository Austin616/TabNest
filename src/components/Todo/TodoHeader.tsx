import React from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import type { ViewMode, DateNavigation } from '../../types/todo'

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
            className="p-2 rounded-lg bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
            aria-label={`Previous ${navigation.viewMode}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 min-w-[240px] text-center">
            {formatHeaderDate()}
          </h2>
          
          <button
            onClick={() => onNavigateDate('next')}
            className="p-2 rounded-lg bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-slate-700/80 hover:text-slate-800 dark:hover:text-slate-200 transition-all duration-200 hover:scale-110 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
            aria-label={`Next ${navigation.viewMode}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-700/40 rounded-lg p-1 border border-slate-200/50 dark:border-slate-600/50">
          <button
            onClick={() => onViewModeChange('day')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              navigation.viewMode === 'day'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => onViewModeChange('week')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              navigation.viewMode === 'week'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            Week
          </button>
        </div>
      </div>

      <button
        onClick={onAddTask}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
      >
        <Plus className="w-5 h-5" />
        Add Task
      </button>
    </div>
  )
}

export default TodoHeader
