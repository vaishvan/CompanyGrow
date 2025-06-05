import { LogOut } from 'lucide-react'

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-[#273142] border-b border-[#273142] px-6 py-4 h-15 flex justify-end-safe">
      <div className="flex justify-between items-center">
        <div className="flex-1">
          {/* Page title will be added by individual pages */}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* User Info */}
          <div className="text-right">
            <p className="text-s font-medium text-gray-50">{user.name}</p>
            <p className="text-xs text-gray-50 capitalize">{user.role}</p>
          </div>
          
          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center justify-between px-5 py-2 text-xs text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            <LogOut className="w-8 h-7 ml-5" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
