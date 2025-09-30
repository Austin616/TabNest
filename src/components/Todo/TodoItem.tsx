import React from 'react'
import { Edit2, X } from 'lucide-react'
import type { Todo } from '../../types/todo'

interface TodoItemProps {
  todo: Todo
  onToggleComplete: (id: string) => void
  onDelete: (id: string) => void
  onEdit?: (todo: Todo) => void
  currentDate?: Date
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onEdit,
  currentDate = new Date()
}) => {
  const formatDueDate = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dueDate = new Date(date)
    dueDate.setHours(0, 0, 0, 0)
    
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return 'Due today'
    } else if (diffDays === 1) {
      return 'Due tomorrow'
    } else if (diffDays === -1) {
      return 'Due yesterday'
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`
    } else {
      return `Due on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
  }

  const isOverdue = todo.dueDate && todo.dueDate < new Date() && !todo.completed
  const isDueToday = todo.dueDate && todo.dueDate.toDateString() === new Date().toDateString()
  
  // Check if task is showing early due to reminder
  const isShowingEarly = todo.dueDate && todo.reminderDays && 
    currentDate.toDateString() !== todo.dueDate.toDateString() &&
    currentDate < todo.dueDate

  return (
    <div
      className={`group flex items-start gap-3 p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
        todo.completed
          ? 'bg-white/30 dark:bg-slate-700/30 border-slate-200/30 dark:border-slate-600/30 opacity-75'
          : 'bg-white/50 dark:bg-slate-700/50 border-slate-200/50 dark:border-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-700/70'
      } ${
        isOverdue ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/20' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo.id)}
        className={`mt-1 w-5 h-5 rounded focus:ring-2 transition-colors ${
          isOverdue && !todo.completed
            ? 'text-red-500 bg-white dark:bg-slate-600 border-red-300 dark:border-red-600 focus:ring-red-500'
            : 'text-blue-600 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 focus:ring-blue-500'
        }`}
      />
      
      <div 
        className="flex-1 min-w-0 cursor-pointer" 
        onClick={() => onEdit?.(todo)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onEdit?.(todo)
          }
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`font-medium transition-all duration-300 ${
              todo.completed
                ? 'text-slate-500 dark:text-slate-400 line-through'
                : isOverdue
                ? 'text-red-700 dark:text-red-300'
                : 'text-slate-800 dark:text-slate-200'
            }`}
          >
            {todo.text}
          </span>
          
          {todo.dueDate && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
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
          
          {isShowingEarly && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
              📋 Coming up
            </span>
          )}
        </div>
        
        {todo.description && (
          <p
            className={`text-sm transition-all duration-300 ${
              todo.completed
                ? 'text-slate-400 dark:text-slate-500'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {todo.description}
          </p>
        )}
        
        {todo.tags && todo.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {todo.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(todo)
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hover:scale-110"
            aria-label="Edit todo"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={() => onDelete(todo.id)}
            className="p-1.5 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors hover:scale-110"
          aria-label="Delete todo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default TodoItem
