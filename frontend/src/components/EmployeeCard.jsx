import { Edit, Trash2, User } from 'lucide-react'

const EmployeeCard = ({ employee, onEdit, onDelete }) => {  return (
    <div className="bg-gray-300 rounded-lg p-6 shadow-md">
      {/* Employee Photo */}
      <div className="bg-gray-400 rounded-lg mb-4 h-32 flex items-center justify-center border-2 border-black overflow-hidden">
        {employee.profileImage ? (
          <img 
            src={employee.profileImage} 
            alt={`${employee.name}'s profile`}
            className="w-full h-full object-cover"
          />        ) : (
          <div className="text-center">
            <User className="w-8 h-8 mx-auto text-black" />
          </div>
        )}
      </div>

      {/* Employee Details */}
      <div className="space-y-2 mb-4">
        <p className="font-medium text-black">
          <span className="font-bold">Employee name:</span> {employee.name}
        </p>
        <p className="text-black">
          <span className="font-bold">Employee ID:</span> {employee.employeeId || 'N/A'}
        </p>
        <p className="text-black">
          <span className="font-bold">Employee Position:</span> {employee.position || employee.role}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => onEdit(employee)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors duration-200"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit Details
        </button>
        <button
          onClick={() => onDelete(employee._id)}
          className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete Employee
        </button>
      </div>
    </div>
  )
}

export default EmployeeCard
