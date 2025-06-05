import { Edit, Trash2 } from 'lucide-react'

const ProjectCard = ({ project, onEdit, onDelete }) => {
  return (
    <div className="bg-gray-300 rounded-lg p-6 shadow-md">
      {/* Project Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-black mb-2">PROJECT NAME</h3>
        <p className="text-sm text-black mb-1">
          <span className="font-bold">Project desc:</span> {project.description}
        </p>
        <p className="text-sm text-black">
          <span className="font-bold">Skills Required:</span> {project.skillsRequired?.join(', ') || 'N/A'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(project)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit Project
        </button>
        <button
          onClick={() => onDelete(project._id)}
          className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete Project
        </button>
      </div>
    </div>
  )
}

export default ProjectCard
