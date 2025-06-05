import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle, Users } from 'lucide-react'

const BrowseCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registering, setRegistering] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCourses()
  }, [])
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('Token:', token ? 'exists' : 'missing')
      
      const response = await fetch('http://localhost:5000/api/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', response.headers)

      if (response.ok) {
        const data = await response.json()
        console.log('Courses data:', data)
        setCourses(data)
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error(`Failed to fetch courses: ${response.status}`)
      }
    } catch (err) {
      setError(`Failed to load courses: ${err.message}`)
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
    }
  }
  const handleRegister = async (courseId) => {
    setRegistering(courseId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/courses/${courseId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('Successfully registered for course!')
      } else {
        throw new Error('Failed to register for course')
      }
    } catch (err) {
      setError('Failed to register for course')
      console.error('Error registering for course:', err)
    } finally {
      setRegistering(null)
    }
  }

  const handleCourseClick = (courseId) => {
    navigate(`/dashboard/course/${courseId}`)
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
        <h1 className="text-3xl font-bold text-white">Browse Courses</h1>
      </div>

      {courses.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-xl mb-2">No courses available</p>
          <p>Check back later for new courses.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
            >              {/* Course Photo */}
              <div className="bg-gray-400 rounded-lg mb-4 h-32 flex items-center justify-center border-2 border-black overflow-hidden">
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

              {/* Course Details */}
              <div className="space-y-2 mb-4">
                <p className="font-medium text-black">
                  <span className="font-bold">course name</span>
                </p>
                <p className="text-lg font-semibold text-black">{course.name}</p>
                <p className="text-black">
                  <span className="font-bold">course desc.</span>
                </p>
                <p className="text-sm text-black">{course.description}</p>
                
                {/* Study Materials Info */}
                {course.studyMaterials && course.studyMaterials.length > 0 && (
                  <div className="flex items-center text-sm text-black">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>{course.studyMaterials.length} study material{course.studyMaterials.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Skills Required */}
                {course.skillsRequired && course.skillsRequired.length > 0 && (
                  <div className="text-sm text-black">
                    <span className="font-bold">Skills: </span>
                    {course.skillsRequired.join(', ')}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleCourseClick(course._id)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleRegister(course._id)}
                  disabled={registering === course._id}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {registering === course._id ? 'Registering...' : 'Register'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BrowseCourses
