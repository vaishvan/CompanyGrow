import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, User } from 'lucide-react'
import axios from 'axios'
import EmployeeModal from '../components/EmployeeModal'
import EmployeeCard from '../components/EmployeeCard'

const ManageEmployees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployees(response.data)
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddEmployee = () => {
    setSelectedEmployee(null)
    setShowModal(true)
  }

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee)
    setShowModal(true)
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:5000/api/users/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchEmployees()
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedEmployee(null)
  }

  const handleEmployeeSaved = () => {
    fetchEmployees()
    handleModalClose()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Manage Employees</h1>
        <button
          onClick={handleAddEmployee}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD EMPLOYEE
        </button>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee._id}
            employee={employee}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={handleModalClose}
          onSave={handleEmployeeSaved}
        />
      )}
    </div>
  )
}

export default ManageEmployees
