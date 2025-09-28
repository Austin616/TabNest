import { useState } from 'react'
import './App.css'
import Navbar from './components/globals/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'
import TodoModal from './components/Todo/TodoModal'
import { TodoProvider, useTodos } from './contexts/TodoContext'

const AppContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { addTodo } = useTodos()

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-all duration-300 ${isModalOpen ? 'blur-sm' : ''}`}>
        <Navbar />
        <Dashboard onAddTaskClick={openModal} />
      </div>
      
      {/* Global Modal */}
      <TodoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddTodo={addTodo}
        currentDate={new Date()}
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
