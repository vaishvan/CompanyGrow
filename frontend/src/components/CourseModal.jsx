import { useState, useEffect } from 'react'
import { X, Plus, Upload, File, Trash2, BookOpen } from 'lucide-react'
import axios from 'axios'

const CourseModal = ({ course, onClose, onSave }) => {  const [formData, setFormData] = useState({
    name: '',
    tokens: '',
    image: '',
    studyMaterials: []
  })
  const [newMaterial, setNewMaterial] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState('')
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name || '',
        tokens: course.tokens || '',
        image: course.image || '',
        studyMaterials: course.studyMaterials || []
      })
      setPhotoPreview(course.image || '')
    }
  }, [course])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
        const courseData = {
        name: formData.name,
        tokens: parseInt(formData.tokens),
        description: formData.name, // Using name as description for simplicity
        image: formData.image,
        studyMaterials: formData.studyMaterials
      }

      if (course) {
        // Update existing course
        await axios.put(`http://localhost:5000/api/courses/${course._id}`, courseData, {
          headers: { Authorization: `Bearer ${token}` }
        })
      } else {
        // Create new course
        await axios.post('http://localhost:5000/api/courses', courseData, {
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

    setUploadingPhoto(true)
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
        image: response.data.url
      })
      
      setSelectedPhoto(null)
      // Reset file input
      const fileInput = document.getElementById('course-photo-upload')
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const removePhoto = () => {
    setFormData({
      ...formData,
      image: ''
    })
    setPhotoPreview('')
    setSelectedPhoto(null)
    const fileInput = document.getElementById('course-photo-upload')
    if (fileInput) fileInput.value = ''
  }
  const addStudyMaterial = () => {
    if (newMaterial.trim()) {
      setFormData({
        ...formData,
        studyMaterials: [...formData.studyMaterials, { title: newMaterial.trim(), type: 'document' }]
      })
      setNewMaterial('')
    }
  }

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0])
  }

  const uploadFile = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const token = localStorage.getItem('token')
      const formDataUpload = new FormData()
      formDataUpload.append('file', selectedFile)

      const response = await axios.post('http://localhost:5000/api/upload/upload', formDataUpload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })      // Add uploaded file to study materials
      setFormData({
        ...formData,
        studyMaterials: [...formData.studyMaterials, {
          title: selectedFile.name,
          type: 'file',
          url: response.data.url,
          public_id: response.data.public_id,
          filename: response.data.filename,
          format: response.data.format
        }]
      })
      
      setSelectedFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-upload')
      if (fileInput) fileInput.value = ''
      
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const deleteMaterial = async (index, material) => {
    try {
      // If it's an uploaded file, delete from Cloudinary
      if (material.public_id) {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:5000/api/upload/delete/${material.public_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
      
      // Remove from local state
      removeStudyMaterial(index)
    } catch (error) {
      console.error('Error deleting file:', error)
      // Still remove from local state even if cloud deletion fails
      removeStudyMaterial(index)
    }
  }

  const removeStudyMaterial = (index) => {
    setFormData({
      ...formData,
      studyMaterials: formData.studyMaterials.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {course ? 'Edit Course' : 'Add Course'}
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
          )}          {/* Course Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Photo
            </label>
            
            {/* Photo Preview/Placeholder */}
            <div className="flex items-center space-x-4 mb-3">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center border-2 border-gray-300 overflow-hidden">
                {photoPreview || formData.image ? (
                  <img 
                    src={photoPreview || formData.image} 
                    alt="Course preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BookOpen className="w-10 h-10 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <label htmlFor="course-photo-upload" className="cursor-pointer px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Choose Photo
                  </label>
                  <input
                    id="course-photo-upload"
                    type="file"
                    className="hidden"
                    onChange={handlePhotoSelect}
                    accept="image/*"
                  />
                  {(photoPreview || formData.image) && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
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
                  disabled={uploadingPhoto}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingPhoto ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter course name"
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
          </div>          {/* Study Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Materials
            </label>
            
            {/* File Upload Section */}
            <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-700">
                      Upload course materials
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.avi,.mov,.mkv,.jpg,.jpeg,.png,.gif,.txt"
                    />
                  </label>                  <p className="mt-1 text-xs text-gray-500">
                    PDF, DOC, PPT, XLS, Videos, Images up to 50MB
                  </p>
                </div>
              </div>
              
              {selectedFile && (
                <div className="mt-3 flex items-center justify-between bg-blue-50 p-2 rounded">
                  <span className="text-sm text-blue-700">{selectedFile.name}</span>
                  <button
                    type="button"
                    onClick={uploadFile}
                    disabled={uploading}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              )}
            </div>

            {/* Existing Materials */}
            <div className="space-y-2">
              {formData.studyMaterials.map((material, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                  <div className="flex items-center">
                    <File className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm font-medium">{material.title}</span>
                    {material.url && (
                      <a 
                        href={material.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        (View)
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteMaterial(index, material)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Manual Material Entry */}
            <div className="flex mt-3">
              <input
                type="text"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                placeholder="Or enter material title manually"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addStudyMaterial}
                className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

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

export default CourseModal
