import React, { useState, useEffect } from 'react'
import type { Todo } from '../../types/todo'
 

const Popup: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTask, setNewTask] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Load todos from chrome storage
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['tabnest-todos'], (result) => {
        if (result['tabnest-todos']) {
          try {
            const parsedTodos = JSON.parse(result['tabnest-todos']).map((todo: Todo) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            }))
            setTodos(parsedTodos)
          } catch (error) {
            console.error('Failed to load todos from chrome storage:', error)
          }
        }
      })
    } else {
      // Fallback to localStorage for development
      const savedTodos = localStorage.getItem('tabnest-todos')
      if (savedTodos) {
        try {
          const parsedTodos = JSON.parse(savedTodos).map((todo: Todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          }))
          setTodos(parsedTodos)
        } catch (error) {
          console.error('Failed to load todos from localStorage:', error)
        }
      }
    }
  }, [])

  const addQuickTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTask.trim() === '') return

    const todo: Todo = {
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: newTask.trim(),
      completed: false,
      createdAt: new Date(),
      dueDate: new Date(), // Due today
      tags: []
    }

    const updatedTodos = [...todos, todo]
    setTodos(updatedTodos)
    
    // Save to chrome storage or localStorage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'tabnest-todos': JSON.stringify(updatedTodos) })
    } else {
      localStorage.setItem('tabnest-todos', JSON.stringify(updatedTodos))
    }
    
    setNewTask('')
  }

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
    setTodos(updatedTodos)
    
    // Save to storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'tabnest-todos': JSON.stringify(updatedTodos) })
    } else {
      localStorage.setItem('tabnest-todos', JSON.stringify(updatedTodos))
    }
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
    if (!todo.dueDate) return false
    return todo.dueDate.toDateString() === new Date().toDateString()
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
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12z" clipRule="evenodd" />
            </svg>
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
        <form onSubmit={addQuickTask} className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Quick add task..."
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            disabled={newTask.trim() === ''}
            className="px-3 py-2 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Add
          </button>
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
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
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
              {activeTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-700/50 rounded-lg border border-slate-200/50 dark:border-slate-600/50 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-all duration-200"
                >
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                  />
                  <span className="flex-1 text-sm text-slate-800 dark:text-slate-200 truncate">
                    {todo.text}
                  </span>
                </div>
              ))}

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
                      className="flex items-center gap-3 p-3 bg-white/30 dark:bg-slate-700/30 rounded-lg border border-slate-200/30 dark:border-slate-600/30 opacity-75"
                    >
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodo(todo.id)}
                        className="w-4 h-4 text-blue-600 bg-white dark:bg-slate-600 border-slate-300 dark:border-slate-500 rounded focus:ring-blue-500 focus:ring-2 transition-colors"
                      />
                      <span className="flex-1 text-sm text-slate-500 dark:text-slate-400 line-through truncate">
                        {todo.text}
                      </span>
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
