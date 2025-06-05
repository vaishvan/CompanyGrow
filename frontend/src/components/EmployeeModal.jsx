import { useState, useEffect } from 'react'
import { X, Upload, User, Trash2 } from 'lucide-react'
import axios from 'axios'

const EmployeeModal = ({ employee, onClose, onSave }) => {  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    username: '',
    password: '',
    position: '',
    role: 'employee',
    profileImage: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        employeeId: employee.employeeId || '',
        username: employee.username || '',
        password: '', // Don't populate password for edit
        position: employee.position || '',
        role: employee.role || 'employee',
        profileImage: employee.profileImage || ''
      })
      setPhotoPreview(employee.profileImage || '')
    }
  }, [employee])
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      const userData = {
        name: formData.name,
        employeeId: formData.employeeId,
        position: formData.position,
        profileImage: formData.profileImage
      }

      if (employee) {
        // Update existing employee
        await axios.put(`http://localhost:5000/api/users/${employee._id}`, userData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create new employee - include additional fields for registration
        const newUserData = {
          ...userData,
          username: formData.username,
          password: formData.password,
          role: formData.role
        }
        await axios.post('http://localhost:5000/api/auth/register', newUserData, {
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

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedPhoto(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async () => {
    if (!selectedPhoto) return

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const photoFormData = new FormData()
      photoFormData.append('file', selectedPhoto)

      const response = await axios.post('http://localhost:5000/api/upload/upload', photoFormData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      // Update form data with uploaded photo URL
      setFormData({
        ...formData,
        profileImage: response.data.url
      })
      
      setSelectedPhoto(null)
      // Reset file input
      const fileInput = document.getElementById('photo-upload')
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = () => {
    setFormData({
      ...formData,
      profileImage: ''
    })
    setPhotoPreview('')
    setSelectedPhoto(null)
    const fileInput = document.getElementById('photo-upload')
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {employee ? 'Edit Details' : 'Add Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            
            {/* Photo Preview/Placeholder */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300 overflow-hidden">
                {photoPreview || formData.profileImage ? (
                  <img 
                    src={photoPreview || formData.profileImage} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <label htmlFor="photo-upload" className="cursor-pointer px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Choose Photo
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    className="hidden"
                    onChange={handlePhotoSelect}
                    accept="image/*"
                  />
                  {(photoPreview || formData.profileImage) && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG up to 50MB
                </p>
              </div>
            </div>

            {/* Upload Button for Selected Photo */}
            {selectedPhoto && (
              <div className="bg-blue-50 p-2 rounded flex items-center justify-between">
                <span className="text-sm text-blue-700">{selectedPhoto.name}</span>
                <button
                  type="button"
                  onClick={uploadPhoto}
                  disabled={uploading}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter employee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee ID
            </label>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter employee ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Role
            </label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter employee role/position"
            />
          </div>

          {!employee && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </>
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

export default EmployeeModal
