import './App.css'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard/Dashboard'

const App = () => {
  return (
    <div className='text-3xl font-bold underline'>
      <Navbar />
      <Dashboard />
    </div>
  )
}

export default App
