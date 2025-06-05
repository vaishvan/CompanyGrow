import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import axios from 'axios'

const ProjectModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    tokens: '',
    assignedEmployees: []
  })
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showEmployeeSelect, setShowEmployeeSelect] = useState(false)

  useEffect(() => {
    fetchEmployees()
    if (project) {
      setFormData({
        name: project.name || '',
        tokens: project.tokens || '',
        assignedEmployees: project.assignedEmployees || []
      })
    }
  }, [project])

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setEmployees(response.data.filter(user => user.role !== 'admin'))
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (project) {
        // Update existing project
        await axios.put(`http://localhost:5000/api/projects/${project._id}`, {
          name: formData.name,
          tokens: parseInt(formData.tokens),
          description: formData.name // Using name as description for simplicity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create new project
        await axios.post('http://localhost:5000/api/projects', {
          name: formData.name,
          tokens: parseInt(formData.tokens),
          description: formData.name // Using name as description for simplicity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      onSave()
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAssignEmployee = async (employeeId) => {
    if (!project) return
    
    try {
      const token = localStorage.getItem('token')
      await axios.post(`http://localhost:5000/api/projects/${project._id}/assign`, {
        employeeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowEmployeeSelect(false)
      // Refresh the project data
      onSave()
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to assign employee')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {project ? 'Edit Project' : 'Add Project'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              No. of Tokens
            </label>
            <input
              type="number"
              name="tokens"
              value={formData.tokens}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter number of tokens"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employees Assigned
            </label>
            <input
              type="text"
              value={formData.assignedEmployees.length > 0 ? `${formData.assignedEmployees.length} employees assigned` : 'No employees assigned'}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          {project && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowEmployeeSelect(!showEmployeeSelect)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                ASSIGN NEW EMPLOYEE
              </button>
            </div>
          )}

          {showEmployeeSelect && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="font-medium mb-2">Select Employee:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {employees.map((employee) => (
                  <button
                    key={employee._id}
                    type="button"
                    onClick={() => handleAssignEmployee(employee._id)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                  >
                    {employee.name} ({employee.employeeId})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ProjectModal
