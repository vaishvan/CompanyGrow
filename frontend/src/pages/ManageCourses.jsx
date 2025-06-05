import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import axios from 'axios'
import CourseCard from '../components/CourseCard'
import CourseModal from '../components/CourseModal'

const ManageCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/courses', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = () => {
    setSelectedCourse(null)
    setShowModal(true)
  }

  const handleEditCourse = (course) => {
    setSelectedCourse(course)
    setShowModal(true)
  }

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        const token = localStorage.getItem('token')
        await axios.delete(`http://localhost:5000/api/courses/${courseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchCourses()
      } catch (error) {
        console.error('Error deleting course:', error)
      }
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setSelectedCourse(null)
  }

  const handleCourseSaved = () => {
    fetchCourses()
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
        <h1 className="text-2xl font-bold text-white">Manage Courses</h1>
        <button
          onClick={handleAddCourse}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          ADD COURSE
        </button>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course._id}
            course={course}
            onEdit={handleEditCourse}
            onDelete={handleDeleteCourse}
          />
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <CourseModal
          course={selectedCourse}
          onClose={handleModalClose}
          onSave={handleCourseSaved}
        />
      )}
    </div>
  )
}

export default ManageCourses
