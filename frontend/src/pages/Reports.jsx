import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, BookOpen, FolderOpen } from 'lucide-react'

const Reports = () => {
  const [reports, setReports] = useState({
    myProgress: null,
    completedCourses: 0,
    activeProjects: 0,
    totalSkills: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])
  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/reports/employee-dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReports(data)
      } else {
        throw new Error('Failed to fetch reports')
      }
    } catch (err) {
      setError('Failed to load reports')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
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

  const statCards = [
    {
      title: 'Completed Courses',
      value: reports.completedCourses,
      icon: BookOpen,
      color: 'bg-green-600',
      description: 'Courses successfully completed'
    },
    {
      title: 'Active Projects',
      value: reports.activeProjects,
      icon: FolderOpen,
      color: 'bg-blue-600',
      description: 'Currently assigned projects'
    },
    {
      title: 'Skills Acquired',
      value: reports.totalSkills,
      icon: TrendingUp,
      color: 'bg-purple-600',
      description: 'Total skills in your profile'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-8 h-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-white">My Progress Reports</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div key={index} className="bg-gray-800 rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{card.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{card.description}</p>
                </div>
                <div className={`${card.color} rounded-full p-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Progress Overview */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Learning Progress Overview</h2>
        
        {reports.myProgress ? (
          <div className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-white font-bold">{reports.myProgress.overall || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${reports.myProgress.overall || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Course Progress */}
            {reports.myProgress.courses && reports.myProgress.courses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Course Progress</h3>
                <div className="space-y-3">
                  {reports.myProgress.courses.map((course, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{course.name}</span>
                        <span className="text-gray-300">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Progress */}
            {reports.myProgress.projects && reports.myProgress.projects.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Project Progress</h3>
                <div className="space-y-3">
                  {reports.myProgress.projects.map((project, index) => (
                    <div key={index} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{project.name}</span>
                        <span className="text-gray-300">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-xl mb-2">No progress data available</p>
            <p>Start taking courses and working on projects to see your progress here.</p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="text-center text-gray-400 py-8">
          <p>Activity tracking coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Reports