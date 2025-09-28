import React, { useState, useMemo } from 'react'
import { Todo, ViewMode, FilterMode, DateNavigation, TodoFilters } from '../../types/todo'
import { useTodos } from '../../contexts/TodoContext'
import TodoHeader from './TodoHeader'
import TodoItem from './TodoItem'
import TodoFiltersComponent from './TodoFilters'

interface TodoListProps {
  onAddTaskClick: () => void
}

const TodoList: React.FC<TodoListProps> = ({ onAddTaskClick }) => {
  const { todos, toggleTodoComplete, deleteTodo } = useTodos()
  const [navigation, setNavigation] = useState<DateNavigation>({
    currentDate: new Date(),
    viewMode: 'day'
  })
  const [filters, setFilters] = useState<TodoFilters>({
    mode: 'all',
    showFilters: false
  })

  // Helper function to check if a task should be shown based on reminder days
  const shouldShowTask = (todo: Todo, targetDate: Date) => {
    if (!todo.dueDate) {
      // Tasks without due dates only show on today
      return targetDate.toDateString() === new Date().toDateString()
    }

    const dueDate = new Date(todo.dueDate)
    dueDate.setHours(0, 0, 0, 0)
    
    const checkDate = new Date(targetDate)
    checkDate.setHours(0, 0, 0, 0)

    if (todo.reminderDays) {
      // Show task from reminderDays before due date until due date
      const reminderStartDate = new Date(dueDate)
      reminderStartDate.setDate(dueDate.getDate() - todo.reminderDays)
      
      return checkDate >= reminderStartDate && checkDate <= dueDate
    } else {
      // No reminder - only show on due date
      return checkDate.getTime() === dueDate.getTime()
    }
  }


  const navigateDate = (direction: 'prev' | 'next') => {
    setNavigation(prev => {
      const newDate = new Date(prev.currentDate)
      if (prev.viewMode === 'day') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
      } else {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
      }
      return { ...prev, currentDate: newDate }
    })
  }

  const changeViewMode = (viewMode: ViewMode) => {
    setNavigation(prev => ({ ...prev, viewMode }))
  }

  const changeFilterMode = (mode: FilterMode) => {
    setFilters(prev => ({ ...prev, mode }))
  }

  const toggleFilters = () => {
    setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))
  }


  // Filter todos based on current view and filters
  const filteredTodos = useMemo(() => {
    let filtered = todos

    // Filter by date based on view mode
    if (navigation.viewMode === 'day') {
      filtered = todos.filter(todo => shouldShowTask(todo, navigation.currentDate))
    } else {
      // Week view - show tasks for the current week
      const startOfWeek = new Date(navigation.currentDate)
      startOfWeek.setDate(navigation.currentDate.getDate() - navigation.currentDate.getDay())
      
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      filtered = todos.filter(todo => {
        // Check each day of the week to see if task should be shown
        for (let i = 0; i < 7; i++) {
          const checkDate = new Date(startOfWeek)
          checkDate.setDate(startOfWeek.getDate() + i)
          if (shouldShowTask(todo, checkDate)) {
            return true
          }
        }
        return false
      })
    }

    // Filter by completion status
    if (filters.mode === 'active') {
      filtered = filtered.filter(todo => !todo.completed)
    } else if (filters.mode === 'completed') {
      filtered = filtered.filter(todo => todo.completed)
    }

    // Sort: active tasks first, then by due date, then by creation date
    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime()
      }
      
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }, [todos, navigation, filters])

  const activeTodoCount = todos.filter(todo => !todo.completed).length
  const completedTodoCount = todos.filter(todo => todo.completed).length

  return (
    <div className="space-y-6">
      <TodoHeader
        navigation={navigation}
        onNavigateDate={navigateDate}
        onViewModeChange={changeViewMode}
        onAddTask={onAddTaskClick}
      />

      <TodoFiltersComponent
        filters={filters}
        onFilterModeChange={changeFilterMode}
        onToggleFilters={toggleFilters}
        activeTodoCount={activeTodoCount}
        completedTodoCount={completedTodoCount}
        totalTodoCount={todos.length}
      />

      <div className="space-y-3">
        {filteredTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-2">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 italic">
              {filters.mode === 'completed' 
                ? 'No completed tasks'
                : filters.mode === 'active'
                ? 'No active tasks'
                : navigation.viewMode === 'day'
                ? 'No tasks for this day'
                : 'No tasks for this week'
              }
            </p>
            {filters.mode !== 'all' && (
              <button
                onClick={() => changeFilterMode('all')}
                className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
              >
                Show all tasks
              </button>
            )}
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggleComplete={toggleTodoComplete}
              onDelete={deleteTodo}
              currentDate={navigation.currentDate}
            />
          ))
        )}
      </div>

      {/* Quick stats for week view */}
      {navigation.viewMode === 'week' && filteredTodos.length > 0 && (
        <div className="flex justify-center">
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-700/40 rounded-lg px-4 py-2 border border-slate-200/50 dark:border-slate-600/50">
            <span>Total: {filteredTodos.length}</span>
            <span>Active: {filteredTodos.filter(t => !t.completed).length}</span>
            <span>Completed: {filteredTodos.filter(t => t.completed).length}</span>
          </div>
        </div>
      )}

    </div>
  )
}

export default TodoList
