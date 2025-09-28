import React, { useState } from 'react'
import { Todo } from '../../types/todo'

interface TodoFormProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  currentDate: Date
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo, currentDate }) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminder, setReminder] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() === '') return

    const newTodo: Omit<Todo, 'id' | 'createdAt'> = {
      text: text.trim(),
      description: description.trim() || undefined,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      reminder: reminder ? new Date(reminder) : undefined,
      tags: []
    }

    onAddTodo(newTodo)
    
    // Reset form
    setText('')
    setDescription('')
    setDueDate('')
    setReminder('')
    setShowAdvanced(false)
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const formatDateTimeForInput = (date: Date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().slice(0, 16)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-6">
      <div className="flex gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
        />
        
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-3 rounded-lg font-medium transition-all duration-200 border ${
            showAdvanced
              ? 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-500'
              : 'bg-white/60 dark:bg-slate-700/60 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700'
          }`}
          aria-label="Toggle advanced options"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
        
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={text.trim() === ''}
        >
          Add
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white/30 dark:bg-slate-700/30 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={formatDateForInput(new Date())}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Reminder
            </label>
            <input
              type="datetime-local"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              min={formatDateTimeForInput(new Date())}
              className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-sm"
            />
          </div>
        </div>
      )}
    </form>
  )
}

export default TodoForm
