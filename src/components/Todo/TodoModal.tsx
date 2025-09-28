import React, { useState, useEffect } from 'react'
import { Todo } from '../../types/todo'

interface TodoModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void
  currentDate: Date
}

const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  onAddTodo,
  currentDate
}) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [reminderDays, setReminderDays] = useState('')

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setText('')
      setDescription('')
      setDueDate('')
      setReminderDays('')
    }
  }, [isOpen])

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

    const newTodo: Omit<Todo, 'id' | 'createdAt'> = {
      text: text.trim(),
      description: description.trim() || undefined,
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      reminderDays: reminderDays ? parseInt(reminderDays) : undefined,
      tags: []
    }

    onAddTodo(newTodo)
    onClose()
  }

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-200/50 dark:border-slate-700/50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            Add New Task
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hover:scale-110"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Task <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details (optional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={formatDateForInput(new Date())}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Show in advance
            </label>
            <select
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            >
              <option value="">Only on due date</option>
              <option value="1">1 day before</option>
              <option value="2">2 days before</option>
              <option value="3">3 days before</option>
              <option value="7">1 week before</option>
              <option value="14">2 weeks before</option>
              <option value="30">1 month before</option>
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Start showing this task in your daily view this many days before it's due
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 font-medium rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={text.trim() === ''}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
