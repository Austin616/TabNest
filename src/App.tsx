import { useState, useEffect } from 'react'
import './App.css'
import Navbar from './components/globals/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'
import Popup from './pages/Popup/Popup'
import TodoModal from './components/Todo/TodoModal'
import TodoEditModal from './components/Todo/TodoEditModal'
import { TodoProvider, useTodos } from './contexts/TodoContext'
import type { Todo } from './types/todo'

const AppContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isPopupMode, setIsPopupMode] = useState(false)
  const { addTodo, editTodo, todos } = useTodos()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const openEditModal = (todo: Todo) => {
    setEditingTodo(todo)
    setIsEditModalOpen(true)
  }
  
  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingTodo(null)
  }

  // Detect if running as Chrome extension popup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const isExtension = urlParams.get('mode') === 'popup' || 
                       window.location.pathname.includes('popup') ||
                       (window.outerWidth <= 400 && window.outerHeight <= 600)
    setIsPopupMode(isExtension)
  }, [])

  // Check for edit parameter and auto-open edit modal
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const editTodoId = urlParams.get('edit')
    
    if (editTodoId && todos.length > 0 && !isPopupMode) {
      const todoToEdit = todos.find(todo => todo.id === editTodoId)
      if (todoToEdit) {
        console.log('Auto-opening edit modal for todo:', todoToEdit.text)
        openEditModal(todoToEdit)
        
        // Remove the edit parameter from URL to prevent re-opening on refresh
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.delete('edit')
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [todos, isPopupMode])

  // Render popup mode for Chrome extension
  if (isPopupMode) {
    return (
      <>
        <div className={isEditModalOpen ? 'blur-sm' : ''}>
          <Popup />
        </div>
        
        {/* Edit Modal for popup mode */}
        <TodoEditModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onSave={editTodo}
          todo={editingTodo}
        />
      </>
    )
  }

  // Render full dashboard
  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-300 ${isModalOpen || isEditModalOpen ? 'blur-sm' : ''}`}>
        <Navbar />
        <Dashboard onAddTaskClick={openModal} onEditTodo={openEditModal} />
      </div>
      
      {/* Global Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddTodo={addTodo}
        currentDate={new Date()}
      />

      {/* Edit Modal */}
      <TodoEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={editTodo}
        todo={editingTodo}
      />
    </>
  )
}

const App = () => {
  return (
    <TodoProvider>
      <AppContent />
    </TodoProvider>
  )
}

export default App
