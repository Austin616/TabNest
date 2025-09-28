import './App.css'
import Navbar from './components/globals/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'

const App = () => {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100'>
      <Navbar />
      <Dashboard />
    </div>
  )
}

export default App
