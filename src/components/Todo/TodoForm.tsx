import React, { useState } from 'react'
import { Settings } from 'lucide-react'
import type { Todo } from '../../types/todo'

interface TodoFormProps {
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  currentDate: Date
}

const TodoForm: React.FC<TodoFormProps> = ({ onAddTodo }) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]) // Default to today
  const [reminder, setReminder] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim() === '') return

    const today = new Date()
    today.setHours(23, 59, 59, 999) // Set to end of day for due date

    const newTodo: Omit<Todo, 'id' | 'createdAt'> = {
      text: text.trim(),
      description: description.trim() || undefined,
      completed: false,
      dueDate: dueDate ? createDateFromInput(dueDate) : today, // Always set due date, default to today
      reminderDays: reminder ? parseInt(reminder) : undefined,
      tags: []
    }

    onAddTodo(newTodo)
    
    // Reset form
    setText('')
    setDescription('')
    setDueDate(new Date().toISOString().split('T')[0]) // Reset to today
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

  // Create date from input string without timezone issues
  const createDateFromInput = (dateString: string) => {
    if (!dateString) return undefined
    // Parse YYYY-MM-DD as local date, not UTC
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day, 23, 59, 59, 999) // End of day local time
    return date
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
          <Settings className="w-5 h-5" />
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
