import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link 
            to="/cakes" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Cakes Management</h2>
            <p className="text-gray-600">View, create, update, and delete cake information</p>
          </Link>
          
          <Link 
            to="/ingredients" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Ingredients Management</h2>
            <p className="text-gray-600">Track ingredients and manage stock levels</p>
          </Link>
          
          <Link 
            to="/recipes" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Recipe Management</h2>
            <p className="text-gray-600">Define recipes with ingredients and quantities</p>
          </Link>
          
          <Link 
            to="/productions" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Production Runs</h2>
            <p className="text-gray-600">Start production runs and track costs</p>
          </Link>
          
          <Link 
            to="/distributions" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-red-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Distribution Tracking</h2>
            <p className="text-gray-600">Manage cake shipments and locations</p>
          </Link>
          
          <Link 
            to="/reports" 
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-500"
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Reports</h2>
            <p className="text-gray-600">View production summaries and financial data</p>
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-gray-600">Total Cakes</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-gray-600">Ingredients</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">0</p>
              <p className="text-gray-600">Recipes</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-gray-600">Production Runs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}