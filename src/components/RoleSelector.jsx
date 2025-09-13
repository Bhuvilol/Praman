import { useNavigate } from 'react-router-dom'

function RoleSelector() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full">
      <div className="group cursor-pointer" onClick={() => navigate('/contributor')}>
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-blue-500">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
            👥
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Contributor
          </h2>
          <p className="text-lg font-medium text-gray-700">
            Share your expertise and contribute to the community
          </p>
        </div>
      </div>
      
      <div className="group cursor-pointer">
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 text-center border-2 border-transparent hover:border-green-500">
          <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
            🛍️
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Consumer
          </h2>
          <p className="text-lg font-medium text-gray-700">
            Access services and solutions from contributors
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelector
