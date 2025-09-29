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

// Helper function to safely parse dates
const parseDate = (dateValue: any): Date | undefined => {
  console.log('parseDate called with:', dateValue, 'type:', typeof dateValue)
  
  if (!dateValue || dateValue === '' || dateValue === 'undefined' || dateValue === 'null') {
    console.log('parseDate: returning undefined for empty/null value')
    return undefined
  }
  
  // Handle empty objects that Chrome storage creates from Date objects
  if (typeof dateValue === 'object' && Object.keys(dateValue).length === 0) {
    console.log('parseDate: empty object detected, returning undefined')
    return undefined
  }
  
  // If it's already a Date object, return it
  if (dateValue instanceof Date) {
    // Check if it's a valid date
    if (isNaN(dateValue.getTime())) {
      console.log('parseDate: invalid Date object')
      return undefined
    }
    console.log('parseDate: returning existing Date object')
    return dateValue
  }
  
  // Try parsing as string/number (should be ISO string from our serialization)
  const parsed = new Date(dateValue)
  
  // Check if the date is valid
  if (isNaN(parsed.getTime())) {
    console.warn('parseDate: Invalid date value:', dateValue, 'parsed to:', parsed)
    return undefined
  }
  
  console.log('parseDate: successfully parsed', dateValue, 'to', parsed)
  return parsed
}

export const TodoProvider: React.FC<TodoProviderProps> = ({ children }) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load todos from Chrome storage on mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        // Check if chrome.storage is available
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          console.log('Using Chrome storage API')
          chrome.storage.local.get(['tabnest-todos'], (result) => {
              console.log('Loaded from Chrome storage:', result)
              const savedTodos = result['tabnest-todos']
              console.log('Raw saved todos before parsing:', savedTodos[0])
              if (savedTodos[0]) {
                console.log('Due date field type:', typeof savedTodos[0].dueDate)
                console.log('Due date value:', savedTodos[0].dueDate)
                console.log('Created at field type:', typeof savedTodos[0].createdAt)
                console.log('Created at value:', savedTodos[0].createdAt)
              }
            if (savedTodos && Array.isArray(savedTodos) && savedTodos.length > 0) {
              const parsedTodos = savedTodos.map((todo: any) => {
                const parsedDueDate = parseDate(todo.dueDate)
                const parsedCreatedAt = parseDate(todo.createdAt) || new Date()
                
                console.log('Parsing todo:', todo.id)
                console.log('  Original dueDate:', todo.dueDate, 'Parsed:', parsedDueDate)
                console.log('  Original createdAt:', todo.createdAt, 'Parsed:', parsedCreatedAt)
                
                return {
                  id: todo.id,
                  text: todo.text,
                  description: todo.description,
                  completed: todo.completed || false,
                  createdAt: parsedCreatedAt,
                  dueDate: parsedDueDate,
                  reminderDays: todo.reminderDays,
                  tags: todo.tags || []
                }
              })
              setTodos(parsedTodos)
              console.log('Parsed todos:', parsedTodos)
            } else {
              console.log('No todos found in Chrome storage')
              setTodos([])
            }
            setIsLoaded(true)
          })
        } else {
          // Fallback to localStorage for development
          console.log('Chrome storage not available, using localStorage')
          const savedTodos = localStorage.getItem('tabnest-todos')
          if (savedTodos) {
            const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
              id: todo.id,
              text: todo.text,
              description: todo.description,
              completed: todo.completed || false,
              createdAt: parseDate(todo.createdAt) || new Date(),
              dueDate: parseDate(todo.dueDate),
              reminderDays: todo.reminderDays,
              tags: todo.tags || []
            }))
            setTodos(parsedTodos)
            console.log('Loaded from localStorage:', parsedTodos)
          }
          setIsLoaded(true)
        }
      } catch (error) {
        console.error('Failed to load todos:', error)
        setIsLoaded(true)
      }
    }

    loadTodos()
  }, [])

  // Save todos to Chrome storage when todos change
  useEffect(() => {
    const saveTodos = () => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          // Serialize dates to strings for Chrome storage
          const serializedTodos = todos.map(todo => ({
            ...todo,
            createdAt: todo.createdAt.toISOString(),
            dueDate: todo.dueDate ? todo.dueDate.toISOString() : undefined
          }))
          
          chrome.storage.local.set({ 'tabnest-todos': serializedTodos }, () => {
            if (chrome.runtime.lastError) {
              console.error('Chrome storage error:', chrome.runtime.lastError)
            } else {
              console.log('Saved to Chrome storage (serialized):', serializedTodos)
              console.log('Sample serialized todo:', serializedTodos[0])
            }
          })
        } else {
          // Fallback to localStorage for development
          localStorage.setItem('tabnest-todos', JSON.stringify(todos))
          console.log('Saved to localStorage:', todos)
        }
      } catch (error) {
        console.error('Failed to save todos:', error)
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
    console.log('Adding new todo:', newTodo)
    setTodos(prevTodos => {
      const updated = [...prevTodos, newTodo]
      console.log('Updated todos array:', updated)
      return updated
    })
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
