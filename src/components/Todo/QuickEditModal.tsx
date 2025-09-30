import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Todo } from '../../types/todo'

interface QuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void
  todo: Todo | null
}

const QuickEditModal: React.FC<QuickEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  todo
}) => {
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')

  // Reset form when modal opens with todo data
  useEffect(() => {
    if (isOpen && todo) {
      setText(todo.text)
      setDescription(todo.description || '')
    }
  }, [isOpen, todo])

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
    if (!todo || text.trim() === '') return

    const updates: Partial<Omit<Todo, 'id' | 'createdAt'>> = {
      text: text.trim(),
      description: description.trim() || undefined
    }

    onSave(todo.id, updates)
    onClose()
  }

  if (!isOpen || !todo) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200/20 dark:border-slate-700/50 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Quick Edit
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Task
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a quick note..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={text.trim() === ''}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default QuickEditModal
