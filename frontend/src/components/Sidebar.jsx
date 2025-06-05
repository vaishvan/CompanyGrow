import { NavLink } from 'react-router-dom'
import { Users, FolderOpen, BookOpen, FileText, BarChart3, User, Coins } from 'lucide-react'

const Sidebar = ({ user }) => {
  // Admin navigation items
  const adminNavItems = [
    {
      name: 'Manage Employees',
      path: '/dashboard/employees',
      icon: Users
    },
    {
      name: 'Manage Projects',
      path: '/dashboard/projects',
      icon: FolderOpen
    },
    {
      name: 'Manage Courses',
      path: '/dashboard/courses',
      icon: BookOpen
    }
  ]  // Manager navigation items
  const managerNavItems = [
    {
      name: 'Employee Reports',
      path: '/dashboard/employee-directory',
      icon: Users
    },
    {
      name: 'Manage Projects',
      path: '/dashboard/projects',
      icon: FolderOpen
    },
    {
      name: 'Manage Courses',
      path: '/dashboard/courses',
      icon: BookOpen
    }
  ]  // Employee navigation items
  const employeeNavItems = [
    {
      name: 'Browse Courses',
      path: '/dashboard/browse-courses',
      icon: BookOpen
    },
    {
      name: 'My Courses',
      path: '/dashboard/my-courses',
      icon: BookOpen
    },
    {
      name: 'My Projects',
      path: '/dashboard/my-projects',
      icon: FolderOpen
    },
    {
      name: 'My Reports',
      path: '/dashboard/my-reports',
      icon: BarChart3
    },
    {
      name: 'Payment Dashboard',
      path: '/dashboard/payments',
      icon: Coins
    }
  ]

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return adminNavItems
      case 'manager':
        return managerNavItems
      case 'employee':
        return employeeNavItems
      default:
        return []
    }
  }

  const navItems = getNavItems()
  return (
    <div className="w-65 h-full bg-[#273142] text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#273142] ">
        <h1 className="text-2xl font-bold text-white">CompanyGrow</h1>
      </div>

      {/* Navigation */}
      <nav className="flex justify-center-safe px-4 py-5">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar
