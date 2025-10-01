import React, { useState, useMemo } from 'react'
import { ClipboardList } from 'lucide-react'
import type { Todo, ViewMode, FilterMode, DateNavigation, TodoFilters } from '../../types/todo'
import { useTodos } from '../../contexts/TodoContext'
import { organizeTodosByDate, getEmptyStateMessage, isTaskReminderActive } from '../../utils/todoDateUtils'
import TodoHeader from './TodoHeader'
import TodoItem from './TodoItem'
import TodoFiltersComponent from './TodoFilters'

interface TodoListProps {
  onAddTaskClick: () => void
  onEditTodo: (todo: Todo) => void
}

const TodoList: React.FC<TodoListProps> = ({ onAddTaskClick, onEditTodo }) => {
  const { todos, toggleTodoComplete, deleteTodo } = useTodos()
  const [navigation, setNavigation] = useState<DateNavigation>({
    currentDate: new Date(),
    viewMode: 'day',
    dateFormat: 'relative'
  })
  const [filters, setFilters] = useState<TodoFilters>({
    mode: 'all',
    showFilters: false
  })



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

  const changeDateFormat = (dateFormat: 'relative' | 'absolute') => {
    setNavigation(prev => ({ ...prev, dateFormat }))
  }

  const changeFilterMode = (mode: FilterMode) => {
    setFilters(prev => ({ ...prev, mode }))
  }

  const toggleFilters = () => {
    setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))
  }


  // Organize todos by date categories
  const organizedTodos = useMemo(() => {
    let todosToOrganize = todos

    // Filter by completion status first if needed
    if (filters.mode === 'active') {
      todosToOrganize = todosToOrganize.filter(todo => !todo.completed)
    } else if (filters.mode === 'completed') {
      todosToOrganize = todosToOrganize.filter(todo => todo.completed)
    }

    return organizeTodosByDate(todosToOrganize, navigation.currentDate, navigation.viewMode, navigation.dateFormat)
  }, [todos, navigation.currentDate, navigation.viewMode, navigation.dateFormat, filters.mode])

  // Get all todos from organized groups for counts
  const allFilteredTodos = organizedTodos.flatMap(group => group.todos)
  
  // Calculate counts based on current view (filtered todos)
  const viewActiveTodoCount = allFilteredTodos.filter(todo => !todo.completed).length
  const viewCompletedTodoCount = allFilteredTodos.filter(todo => todo.completed).length
  const viewTotalTodoCount = allFilteredTodos.length

  return (
    <div className="space-y-6">
      <TodoHeader
        navigation={navigation}
        onNavigateDate={navigateDate}
        onViewModeChange={changeViewMode}
        onDateFormatChange={changeDateFormat}
        onAddTask={onAddTaskClick}
      />

      <TodoFiltersComponent
        filters={filters}
        onFilterModeChange={changeFilterMode}
        onToggleFilters={toggleFilters}
        activeTodoCount={viewActiveTodoCount}
        completedTodoCount={viewCompletedTodoCount}
        totalTodoCount={viewTotalTodoCount}
      />

      <div className="space-y-6">
        {organizedTodos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 dark:text-slate-500 mb-2">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 italic">
              {filters.mode === 'completed' 
                ? 'No completed tasks'
                : filters.mode === 'active'
                ? 'No active tasks'
                : getEmptyStateMessage(navigation.currentDate, navigation.viewMode)
              }
            </p>
            {filters.mode !== 'all' && (
              <button
                onClick={() => changeFilterMode('all')}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Show all tasks
              </button>
            )}
          </div>
        ) : (
          organizedTodos.map((group, groupIndex) => (
            <div key={`${group.type}-${groupIndex}`} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-semibold tracking-wide ${
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
                  </h3>
                  {group.title.includes('(Reminder)') && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
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
              <div className={`space-y-3 pl-4 border-l-2 ${
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
                  const hasActiveReminder = isTaskReminderActive(todo, navigation.currentDate)
                  return (
                    <div key={todo.id} className={`${
                      hasActiveReminder ? 'ring-2 ring-orange-200 dark:ring-orange-800 rounded-lg' : ''
                    } ${group.type === 'completed' ? 'opacity-60' : ''}`}>
                      <TodoItem
                        todo={todo}
                        onToggleComplete={toggleTodoComplete}
                        onDelete={deleteTodo}
                        onEdit={onEditTodo}
                        currentDate={navigation.currentDate}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick stats for week view */}
      {navigation.viewMode === 'week' && allFilteredTodos.length > 0 && (
        <div className="flex justify-center">
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400 bg-white/40 dark:bg-slate-700/40 rounded-lg px-4 py-2 border border-slate-200/50 dark:border-slate-600/50">
            <span>Total: {allFilteredTodos.length}</span>
            <span>Active: {allFilteredTodos.filter(t => !t.completed).length}</span>
            <span>Completed: {allFilteredTodos.filter(t => t.completed).length}</span>
          </div>
        </div>
      )}

    </div>
  )
}

export default TodoList
