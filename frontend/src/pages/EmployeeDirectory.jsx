import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import axios from 'axios'

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([])
  const [filteredEmployees, setFilteredEmployees] = useState([])  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchEmployees()
  }, [])  useEffect(() => {
    // Filter employees to exclude managers/admins
    const filtered = employees.filter(employee => {
      // Filter out managers and admins
      return employee.role !== 'manager' && employee.role !== 'admin'
    })
    setFilteredEmployees(filtered)
  }, [employees])
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleEmployeeClick = (employeeId) => {
    navigate(`/dashboard/employee-report/${employeeId}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Employee Reports</h1>
          <p className="text-gray-400 mt-1">View individual employee performance reports</p>
        </div>      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <div
            key={employee._id}
            onClick={() => handleEmployeeClick(employee._id)}
            className="bg-gray-700 rounded-lg p-6 hover:bg-gray-600 transition-colors cursor-pointer"
          >            {/* Employee Photo */}
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gray-600 rounded-lg flex items-center justify-center border-2 border-gray-500 overflow-hidden">
                {employee.profileImage ? (
                  <img 
                    src={employee.profileImage} 
                    alt={`${employee.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
            </div>

            {/* Employee Details */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
              <p className="text-sm text-gray-300">ID: {employee.employeeId}</p>
              <p className="text-sm text-gray-300">{employee.position}</p>
              <p className="text-sm text-gray-400">{employee.email}</p>
            </div>            {/* View Report Button */}
            <div className="mt-4 text-center">
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                View Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredEmployees.length === 0 && !loading && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />          <p className="text-gray-400 text-lg">
            No employees found.
          </p>
        </div>
      )}
    </div>
  )
}

export default EmployeeDirectory