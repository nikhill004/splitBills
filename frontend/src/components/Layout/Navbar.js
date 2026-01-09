import { useAuth } from '../../context/AuthContext.js'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-dark-card border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Expense Splitter</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-dark-muted">Welcome, {user?.name}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar