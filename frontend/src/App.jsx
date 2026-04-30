import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import WorkerDashboard from './pages/WorkerDashboard';
import ClientDashboard from './pages/ClientDashboard';
import WorkerProfile from './pages/WorkerProfile';
import EditProfile from './pages/EditProfile';
import Search from './pages/Search';
import ReviewPage from './pages/ReviewPage';
import JobHistory from './pages/JobHistory';
import IDVerification from './pages/IDVerification';
import BookingPage from './pages/BookingPage';
import ClientBookings from './pages/ClientBookings';
import WorkerBookings from './pages/WorkerBookings';
import BottomNav from './components/BottomNav';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-surface">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/auth" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-surface text-gray-900 dark:text-white transition-colors duration-300">
      <Routes>
        <Route path="/" element={user ? <Navigate to={user.role === 'worker' ? '/dashboard' : '/discover'} /> : <Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth />} />

        {/* Worker routes */}
        <Route path="/dashboard" element={<ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute role="worker"><EditProfile /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute role="worker"><JobHistory /></ProtectedRoute>} />
        <Route path="/verify-id" element={<ProtectedRoute role="worker"><IDVerification /></ProtectedRoute>} />
        <Route path="/worker-bookings" element={<ProtectedRoute role="worker"><WorkerBookings /></ProtectedRoute>} />

        {/* Client routes */}
        <Route path="/discover" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute role="client"><ClientBookings /></ProtectedRoute>} />
        <Route path="/book/:workerId" element={<ProtectedRoute role="client"><BookingPage /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<WorkerProfile />} />

        {/* Public — QR review */}
        <Route path="/review/:qrToken" element={<ReviewPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Bottom nav shown only for logged-in users */}
      {user && <BottomNav />}
    </div>
  );
}

