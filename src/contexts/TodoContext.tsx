import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Todo } from '../types/todo'

interface TodoContextType {
  todos: Todo[]
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  toggleTodoComplete: (id: string) => void
  deleteTodo: (id: string) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export const useTodos = () => {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}

interface TodoProviderProps {
  children: ReactNode
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load todos from Chrome storage on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const result = await chrome.storage.local.get(['tabnest-todos'])
        const savedTodos = result['tabnest-todos']
        if (savedTodos && Array.isArray(savedTodos)) {
          const parsedTodos = savedTodos.map((todo: Todo) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
            reminderDays: todo.reminderDays || undefined
          }))
          setTodos(parsedTodos)
        }
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load todos from Chrome storage:', error)
        setIsLoaded(true)
      }
    }

    loadTodos()
  }, [])

  // Save todos to Chrome storage when todos change
  useEffect(() => {
    const saveTodos = async () => {
      try {
        await chrome.storage.local.set({ 'tabnest-todos': todos })
      } catch (error) {
        console.error('Failed to save todos to Chrome storage:', error)
      }
    }

    // Only save after initial load to avoid overwriting with empty array
    if (isLoaded) {
      saveTodos()
    }
  }, [todos, isLoaded])

  const addTodo = (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: `todo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date()
    }
    setTodos(prevTodos => [...prevTodos, newTodo])
  }

  const toggleTodoComplete = (id: string) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
  }

  const value: TodoContextType = {
    todos,
    addTodo,
    toggleTodoComplete,
    deleteTodo
  }

  return (
    <TodoContext.Provider value={value}>
      {children}
    </TodoContext.Provider>
  )
}
