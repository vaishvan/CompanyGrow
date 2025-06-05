import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, CheckCircle } from 'lucide-react'

const MyCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchMyCourses()
  }, [])
  const fetchMyCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/courses/my-courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error('Failed to fetch courses')
      }
    } catch (err) {
      setError('Failed to load courses')
      console.error('Error fetching courses:', err)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold text-white">My Courses</h1>
      </div>

      {courses.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-xl mb-2">No courses assigned yet</p>
          <p>Contact your manager to get courses assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-gray-300 rounded-lg p-6 shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => handleCourseClick(course._id)}
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
              </div>              {/* Completion Status */}
              <div className="flex items-center justify-between">
                <span className="text-black font-bold">Completion %:</span>
                <div className="flex items-center">
                  <span className="text-black font-bold mr-2">
                    {course.progress?.percentage || 0}%
                  </span>
                  {course.progress?.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyCourses