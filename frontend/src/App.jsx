import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentJobs from './pages/StudentJobs';
import StudentProfile from './pages/StudentProfile';
import StudentApplications from './pages/StudentApplications';
import PostJob from './pages/PostJob';
import RecruiterDashboard from './pages/RecruiterDashboard';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'student' ? '/jobs' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/jobs" element={
            <ProtectedRoute role="student"><StudentJobs /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute role="student"><StudentApplications /></ProtectedRoute>
          } />

          <Route path="/dashboard" element={
            <ProtectedRoute role="recruiter"><RecruiterDashboard /></ProtectedRoute>
          } />
          <Route path="/post-job" element={
            <ProtectedRoute role="recruiter"><PostJob /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
