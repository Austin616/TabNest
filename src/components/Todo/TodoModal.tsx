import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Todo } from '../../types/todo'

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  currentDate?: Date
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onAddTodo,
  currentDate
}) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]) // Default to today
  const [dueTime, setDueTime] = useState('23:59')
  const [reminderDays, setReminderDays] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('')
      setDescription('')
      // Use currentDate if provided, otherwise default to today
      setDueDate(formatDateForInput(currentDate || new Date()))
      setDueTime('23:59')
      setReminderDays('')
    }
  }, [isOpen, currentDate])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

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
      dueTime: dueTime.trim() || '23:59',
      reminderDays: reminderDays ? parseInt(reminderDays) : undefined,
      tags: []
    }

    onAddTodo(newTodo)
    onClose()
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  // Create date from input string without timezone issues
  const createDateFromInput = (dateString: string) => {
    if (!dateString) return undefined
    // Parse YYYY-MM-DD as local date, not UTC
    const [year, month, day] = dateString.split('-').map(Number)
    const date = new Date(year, month - 1, day, 23, 59, 59, 999) // End of day local time
    return date
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200/20 dark:border-slate-700/50 p-8 transform transition-all duration-300 ease-out scale-100 opacity-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Add New Task
          </h3>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-slate-700/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 transition-all duration-200 hover:scale-110"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 text-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details (optional)..."
              rows={3}
              className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200 resize-none"
            />
          </div>

          {/* Due Date, Time, and Reminder in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={formatDateForInput(new Date())}
                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200"
              />
            </div>

            {/* Reminder */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Show in advance
              </label>
              <select
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full px-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-600 transition-all duration-200"
              >
                <option value="">Only on due date</option>
                <option value="1">1 day before</option>
                <option value="2">2 days before</option>
                <option value="3">3 days before</option>
                <option value="7">1 week before</option>
                <option value="14">2 weeks before</option>
                <option value="30">1 month before</option>
              </select>
            </div>
          </div>
          
          <div className="bg-blue-50/80 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">💡</span>
              Tasks with "show in advance" will appear in your daily view starting from the selected number of days before the due date
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 border border-slate-200 dark:border-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={text.trim() === ''}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TodoModal
