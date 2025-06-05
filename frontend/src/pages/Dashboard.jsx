import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import ManageEmployees from './ManageEmployees'
import ManageProjects from './ManageProjects'
import ManageCourses from './ManageCourses'
import DashboardHome from './DashboardHome'
import EmployeeDirectory from './EmployeeDirectory'
import EmployeeProfile from './EmployeeProfile'
import EmployeeReport from './EmployeeReport'
import Reports from './Reports'
import MyCourses from './MyCourses'
import MyProjects from './MyProjects'
import CourseDetail from './CourseDetail'
import BrowseCourses from './BrowseCourses'
import PaymentDashboard from './PaymentDashboard'

const Dashboard = ({ user, onLogout }) => {  return (
    <div className="h-screen bg-slate-800 flex">
      {/* Sidebar */}
      <Sidebar user={user} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header user={user} onLogout={onLogout} />
        
        {/* Page Content */}        <main className="flex-1 p-6">
          <Routes>
            {/* Admin routes */}
            {user?.role === 'admin' && (
              <>
                <Route path="/" element={<Navigate to="/dashboard/employees" replace />} />
                <Route path="/employees" element={<ManageEmployees />} />
              </>
            )}
              {/* Manager routes */}
            {user?.role === 'manager' && (
              <>
                <Route path="/" element={<Navigate to="/dashboard/employee-directory" replace />} />
                <Route path="/employee-directory" element={<EmployeeDirectory />} />
                <Route path="/employee/:id" element={<EmployeeProfile />} />
                <Route path="/employee-report/:id" element={<EmployeeReport />} />
                <Route path="/reports" element={<Reports />} />
              </>
            )}            {/* Employee routes */}
            {user?.role === 'employee' && (
              <>
                <Route path="/" element={<Navigate to="/dashboard/browse-courses" replace />} />
                <Route path="/browse-courses" element={<BrowseCourses />} />
                <Route path="/my-courses" element={<MyCourses />} />
                <Route path="/my-projects" element={<MyProjects />} />
                <Route path="/my-reports" element={<Reports />} />
                <Route path="/payments" element={<PaymentDashboard />} />
                <Route path="/course/:id" element={<CourseDetail />} />
              </>
            )}
            
            {/* Common routes for both admin and manager */}
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <Route path="/projects" element={<ManageProjects />} />
                <Route path="/courses" element={<ManageCourses />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default Dashboard
