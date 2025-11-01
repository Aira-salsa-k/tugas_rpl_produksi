import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './components/Dashboard';
import Distributions from './features/distributions/Distributions';



function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function Layout() {
  const { signOut } = useAuth();
  
  return (
    <div className="flex flex-col min-h-screen">
      <h1>hello</h1>
    </div>
  );
}

export default App;
