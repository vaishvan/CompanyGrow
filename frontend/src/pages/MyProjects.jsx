import { useState, useEffect } from 'react'
import { FolderOpen, Calendar, Users, Coins, CheckCircle, Clock } from 'lucide-react'

const MyProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [completingProject, setCompletingProject] = useState(null)
  useEffect(() => {
    fetchMyProjects()
  }, [])

  const fetchMyProjects = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/projects/my-projects', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        throw new Error('Failed to fetch projects')
      }
    } catch (err) {
      setError('Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteProject = async (projectId) => {
    try {
      setCompletingProject(projectId)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: true })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.tokensAwarded > 0) {
          alert(`Congratulations! Project completed! You earned ${result.tokensAwarded} tokens.`)
        }
        fetchMyProjects() // Refresh the projects list
      } else {
        throw new Error('Failed to complete project')
      }
    } catch (error) {
      console.error('Error completing project:', error)
      alert('Failed to complete project. Please try again.')
    } finally {
      setCompletingProject(null)
    }
  }

  const isProjectCompleted = (project) => {
    const currentUser = JSON.parse(localStorage.getItem('user'))
    return project.assignedEmployees?.some(emp => 
      emp.employee === currentUser?.id && emp.completed
    )
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in progress':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
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
        <h1 className="text-3xl font-bold text-white">My Projects</h1>
      </div>

      {projects.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <p className="text-xl mb-2">No projects assigned yet</p>
          <p>You will see your assigned projects here once they are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="bg-gray-300 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {/* Project Header */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-black">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                    {project.status || 'Pending'}
                  </span>
                </div>
                
                <p className="text-sm text-black mb-3">
                  <span className="font-bold">Project desc:</span> {project.description}
                </p>
                
                <p className="text-sm text-black mb-3">
                  <span className="font-bold">Skills Required:</span> {project.skillsRequired?.join(', ') || 'N/A'}
                </p>

                {/* Project Timeline */}
                {(project.startDate || project.endDate) && (
                  <div className="flex items-center text-sm text-black mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {project.startDate && new Date(project.startDate).toLocaleDateString()} 
                      {project.startDate && project.endDate && ' - '}
                      {project.endDate && new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Team Members */}
                {project.assignedEmployees && project.assignedEmployees.length > 0 && (
                  <div className="flex items-center text-sm text-black">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{project.assignedEmployees.length} team member{project.assignedEmployees.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>              {/* Progress Indicator */}
              {project.progress !== undefined && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-black">Progress</span>
                    <span className="text-sm font-bold text-black">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Tokens and Completion */}
              <div className="mt-4 pt-4 border-t border-gray-400">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-black">
                    <Coins className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="font-bold">{project.tokens || 0} tokens</span>
                  </div>
                  
                  {isProjectCompleted(project) ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="text-sm font-semibold">Completed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCompleteProject(project._id)}
                      disabled={completingProject === project._id}
                      className="flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {completingProject === project._id ? (
                        <>
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                          <span className="text-sm">Completing...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          <span className="text-sm">Complete</span>
                        </>
                      )}
                    </button>
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

export default MyProjects