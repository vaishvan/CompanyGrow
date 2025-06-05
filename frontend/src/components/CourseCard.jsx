import { Edit, Trash2, BookOpen } from 'lucide-react'

const CourseCard = ({ course, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-300 rounded-lg p-6 shadow-md">      {/* Course Photo */}
      <div className="bg-gray-400 rounded-lg mb-4 h-32 flex items-center justify-center border-2 border-black overflow-hidden">
        {course.image ? (
          <img 
            src={course.image} 
            alt={`${course.name}'s photo`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <BookOpen className="w-8 h-8 mx-auto text-black" />
          </div>
        )}
      </div>

      {/* Course Details */}
      <div className="space-y-2 mb-4">
        <p className="font-medium text-black">
          <span className="font-bold">course name:</span> {course.name}
        </p>
        <p className="text-black">
          <span className="font-bold">course desc:</span> {course.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(course)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit Course
        </button>
        <button
          onClick={() => onDelete(course._id)}
          className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete Course
        </button>
      </div>
    </div>
  )
}

export default CourseCard
