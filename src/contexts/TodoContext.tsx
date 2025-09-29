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

  // Load todos from localStorage on mount
  useEffect(() => {
    const savedTodos = localStorage.getItem('tabnest-todos')
    if (savedTodos) {
      try {
        const parsedTodos = JSON.parse(savedTodos).map((todo: Todo) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          reminderDays: todo.reminderDays || undefined
        }))
        setTodos(parsedTodos)
      } catch (error) {
        console.error('Failed to load todos from localStorage:', error)
      }
    }
  }, [])

  // Save todos to localStorage when todos change
  useEffect(() => {
    localStorage.setItem('tabnest-todos', JSON.stringify(todos))
  }, [todos])

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
