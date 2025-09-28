import TodoList from '../../components/Todo/TodoList'

interface DashboardProps {
  onAddTaskClick: () => void
}

const Dashboard: React.FC<DashboardProps> = ({ onAddTaskClick }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 bg-clip-text text-transparent mb-8">
          Dashboard
        </h1>

        <TodoList onAddTaskClick={onAddTaskClick} />
      </div>
    </div>
  )
}

export default Dashboard
