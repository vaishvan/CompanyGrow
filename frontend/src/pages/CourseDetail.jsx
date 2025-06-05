import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, Clock, CheckCircle, FileText, Film, Download } from 'lucide-react'

const CourseDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [userProgress, setUserProgress] = useState(null)

  useEffect(() => {
    fetchCourseDetail()
  }, [id])

  const fetchCourseDetail = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        
        // Find user's progress in the course
        const user = JSON.parse(localStorage.getItem('user'))
        const userEnrollment = data.enrolledUsers?.find(enrollment => 
          enrollment.user === user._id || enrollment.user._id === user._id
        )
        setUserProgress(userEnrollment)
      } else {
        setError('Failed to fetch course details')
      }
    } catch (err) {
      setError('Error fetching course details')
  } finally {
      setLoading(false)
    }
  }

  const handleMaterialClick = async (materialIndex) => {
    const material = course.studyMaterials[materialIndex]
    
    // Open the material if it has a URL
    if (material.url) {
      // For file materials, create a download link with proper filename
      if (material.type === 'file' && material.filename) {
        // Create a temporary anchor element to trigger download with proper filename
        const link = document.createElement('a')
        link.href = material.url
        link.download = material.filename
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For other materials or if no filename, just open in new tab
        window.open(material.url, '_blank')
      }
    }
    
    // Update progress when user clicks on study material
    try {
      const token = localStorage.getItem('token')
      await fetch(`http://localhost:5000/api/courses/${id}/progress`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          materialIndex,
          progress: Math.min(((materialIndex + 1) / course.studyMaterials.length) * 100, 100)
        })
      })
        // Refresh course data to get updated progress
      fetchCourseDetail()
    } catch (err) {
      console.error('Error updating progress:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Course not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Courses
        </button>
        
        <div className="flex items-start space-x-6">          {/* Course Image */}
          <div className="bg-gray-400 rounded-lg h-32 w-48 flex items-center justify-center border-2 border-black flex-shrink-0 overflow-hidden">
            {course.image ? (
              <img 
                src={course.image} 
                alt={`${course.name}'s photo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-black" />
                <span className="text-black font-bold text-sm">COURSE PHOTO</span>
              </div>
            )}
          </div>
          
          {/* Course Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{course.name}</h1>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-gray-300">Completion: {userProgress?.progress || 0}%</span>
              {userProgress?.completed && (
                <div className="flex items-center text-green-400">
                  <CheckCircle className="w-5 h-5 mr-1" />
                  Completed
                </div>
              )}
            </div>
            <p className="text-gray-300 mb-4">{course.description}</p>
          </div>
        </div>
      </div>

      {/* Study Materials */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Study Materials</h2>
          {course.studyMaterials && course.studyMaterials.length > 0 ? (
          course.studyMaterials.map((material, index) => (
            <div
              key={index}
              onClick={() => handleMaterialClick(index)}
              className={`bg-slate-700 border-2 border-white rounded-lg p-6 cursor-pointer hover:bg-slate-600 transition-colors duration-200 ${
                material.url ? 'hover:border-blue-400' : 'opacity-75'
              }`}
            >              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    {material.title || `STUDY MATERIAL ${index + 1}`}
                  </h3>
                  {material.url && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded flex items-center">
                      <Download className="w-3 h-3 mr-1" />
                      Available
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {material.type === 'file' ? (
                    material.filename?.toLowerCase().includes('.pdf') ? (
                      <FileText className="w-4 h-4 text-red-400" />
                    ) : material.filename?.toLowerCase().match(/\.(mp4|avi|mov|mkv)$/) ? (
                      <Film className="w-4 h-4 text-purple-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-blue-400" />
                    )
                  ) : (
                    <Clock className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-400 text-sm capitalize">
                    {material.type === 'file' && material.filename 
                      ? material.filename.split('.').pop()?.toUpperCase() || 'FILE'
                      : material.type || 'document'
                    }
                  </span>
                </div>
              </div>
              
              {material.content && (
                <p className="text-gray-300 mt-2">{material.content}</p>
              )}
              
              {!material.url && (
                <p className="text-yellow-400 text-sm mt-2">
                  ⚠️ Material not yet uploaded
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No study materials available for this course yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail