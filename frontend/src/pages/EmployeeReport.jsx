import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { User, Mail, Briefcase, Calendar, BarChart3, BookOpen, FolderOpen, Download, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const EmployeeReport = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingPDF, setDownloadingPDF] = useState(false)

  useEffect(() => {
    fetchEmployeeReport()
  }, [id])

  const fetchEmployeeReport = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/reports/employee/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReport(data)
      } else if (response.status === 403) {
        setError('Access denied. Cannot view reports for managers or administrators.')
      } else if (response.status === 404) {
        setError('Employee not found.')
      } else {
        throw new Error('Failed to fetch employee report')
      }
    } catch (err) {
      setError('Failed to load employee report')
      console.error('Error fetching employee report:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      setDownloadingPDF(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/reports/employee/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${report.employee.name.replace(/\s+/g, '_')}_report.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Failed to generate PDF')
      }
    } catch (err) {
      console.error('Error downloading PDF:', err)
      alert('Failed to generate PDF report')
    } finally {
      setDownloadingPDF(false)
    }
  }

  const handleGoBack = () => {
    navigate('/dashboard/employee-directory')
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
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGoBack}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </button>
        </div>
        <div className="text-center text-red-600 py-8">
          <p className="text-xl mb-2">Access Denied</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No report data available</p>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Completed Courses',
      value: report.statistics.completedCourses,
      icon: BookOpen,
      color: 'bg-green-600',
      description: 'Courses successfully completed'
    },
    {
      title: 'Active Projects',
      value: report.statistics.activeProjects,
      icon: FolderOpen,
      color: 'bg-blue-600',
      description: 'Currently assigned projects'
    },
    {
      title: 'Skills Acquired',
      value: report.statistics.totalSkills,
      icon: BarChart3,
      color: 'bg-purple-600',
      description: 'Total skills in profile'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Back Button and PDF Download */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleGoBack}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </button>
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Employee Performance Report</h1>
          </div>
        </div>
        
        <button
          onClick={handleDownloadPDF}
          disabled={downloadingPDF}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4 mr-2" />
          {downloadingPDF ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      {/* Employee Profile Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-500">
            {report.employee.profileImage ? (
              <img 
                src={report.employee.profileImage} 
                alt={`${report.employee.name}'s profile`}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-gray-300" />
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{report.employee.name}</h2>
            <p className="text-gray-300">{report.employee.position}</p>
            <p className="text-gray-400">ID: {report.employee.employeeId}</p>
          </div>
        </div>

        {/* Employee Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">{report.employee.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Briefcase className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Position</p>
                <p className="text-white">{report.employee.position}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-400">Date Joined</p>
                <p className="text-white">
                  {report.employee.joinDate ? new Date(report.employee.joinDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
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
        <h2 className="text-xl font-bold text-white mb-4">Performance Overview</h2>
        
        {report.progress ? (
          <div className="space-y-4">
            {/* Overall Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Overall Progress</span>
                <span className="text-white font-bold">{report.progress.overall || 0}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${report.progress.overall || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Course Progress */}
            {report.progress.courses && report.progress.courses.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Course Progress</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {report.progress.courses.map((course, index) => (
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
                      {course.enrolledDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Enrolled: {course.enrolledDate !== 'N/A' ? new Date(course.enrolledDate).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Project Progress */}
            {report.progress.projects && report.progress.projects.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white mb-3">Project Progress</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {report.progress.projects.map((project, index) => (
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
                      {project.assignedDate && (
                        <p className="text-xs text-gray-400 mt-1">
                          Assigned: {project.assignedDate !== 'N/A' ? new Date(project.assignedDate).toLocaleDateString() : 'N/A'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <p className="text-xl mb-2">No performance data available</p>
            <p>Employee hasn't been assigned to any courses or projects yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeeReport
