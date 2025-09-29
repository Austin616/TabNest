import React from 'react'
import { ChevronDown } from 'lucide-react'
import type { TodoFilters as TodoFiltersType, FilterMode } from '../../types/todo'

interface TodoFiltersProps {
  filters: TodoFiltersType
  onFilterModeChange: (mode: FilterMode) => void
  onToggleFilters: () => void
  activeTodoCount: number
  completedTodoCount: number
  totalTodoCount: number
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  filters,
  onFilterModeChange,
  onToggleFilters,
  activeTodoCount,
  completedTodoCount,
  totalTodoCount
}) => {
  return (
    <div className="space-y-3">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {activeTodoCount} of {totalTodoCount} tasks remaining
        </div>
        
        {totalTodoCount > 0 && (
          <button
            onClick={onToggleFilters}
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center gap-1"
          >
            {filters.showFilters ? 'Hide' : 'Show'} filters
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${filters.showFilters ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Filter Options */}
      {filters.showFilters && totalTodoCount > 0 && (
        <div className="flex items-center gap-2 bg-white/40 dark:bg-slate-700/40 rounded-lg p-1 border border-slate-200/50 dark:border-slate-600/50">
          <button
            onClick={() => onFilterModeChange('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              filters.mode === 'all'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            All ({totalTodoCount})
          </button>
          
          <button
            onClick={() => onFilterModeChange('active')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              filters.mode === 'active'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            Active ({activeTodoCount})
          </button>
          
          <button
            onClick={() => onFilterModeChange('completed')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              filters.mode === 'completed'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-600/60'
            }`}
          >
            Completed ({completedTodoCount})
          </button>
        </div>
      )}
    </div>
  )
}

export default TodoFilters
