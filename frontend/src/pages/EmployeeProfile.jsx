import { useState, useEffect } from 'react'
import { User, Mail, Phone, Calendar, MapPin, Briefcase, Upload, Trash2 } from 'lucide-react'
import axios from 'axios'

const EmployeeProfile = () => {  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [uploading, setUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData(data)
      } else {
        throw new Error('Failed to fetch profile')
      }
    } catch (err) {
      setError('Failed to load profile')
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditing(false)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (err) {
      setError('Failed to update profile')
      console.error('Error updating profile:', err)
    }
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      setFormData(prev => ({
        ...prev,
        profileImage: response.data.url
      }))
      
      setSelectedPhoto(null)
      setPhotoPreview('')
      // Reset file input
      const fileInput = document.getElementById('profile-photo-upload')
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      setError('Failed to upload photo')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: ''
    }))
    setPhotoPreview('')
    setSelectedPhoto(null)
    const fileInput = document.getElementById('profile-photo-upload')
    if (fileInput) fileInput.value = ''
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-8">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <button
          onClick={() => editing ? setEditing(false) : setEditing(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Profile Photo Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Photo
              </label>
              
              {/* Photo Preview/Placeholder */}
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-600 overflow-hidden">
                  {photoPreview || formData.profileImage || profile?.profileImage ? (
                    <img 
                      src={photoPreview || formData.profileImage || profile?.profileImage} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="profile-photo-upload" className="cursor-pointer px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                      Choose Photo
                    </label>
                    <input
                      id="profile-photo-upload"
                      type="file"
                      className="hidden"
                      onChange={handlePhotoSelect}
                      accept="image/*"
                    />
                    {(photoPreview || formData.profileImage || profile?.profileImage) && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG up to 10MB
                  </p>
                </div>
              </div>

              {/* Upload Button for Selected Photo */}
              {selectedPhoto && (
                <div className="bg-blue-50 bg-opacity-10 p-2 rounded flex items-center justify-between">
                  <span className="text-sm text-blue-300">{selectedPhoto.name}</span>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">            {/* Profile Header */}
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-500">
                {profile?.profileImage ? (
                  <img 
                    src={profile.profileImage} 
                    alt={`${profile.name}'s profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="text-gray-300 capitalize">{profile?.role}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">{profile?.email}</p>
                  </div>
                </div>

                {profile?.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Phone</p>
                      <p className="text-white">{profile.phone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Department</p>
                    <p className="text-white">{profile?.department || 'Not assigned'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Date Joined</p>
                    <p className="text-white">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {profile?.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-400">Address</p>
                      <p className="text-white">{profile.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeProfile