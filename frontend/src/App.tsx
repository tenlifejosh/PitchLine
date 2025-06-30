import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PitcherDashboard from './pages/pitcher/Dashboard'
import DecisionMakerDashboard from './pages/decision-maker/Dashboard'
import BrowseDecisionMakers from './pages/pitcher/BrowseDecisionMakers'
import AdminDashboard from './pages/admin/Dashboard'

function App() {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'pitcher':
        return <PitcherDashboard />
      case 'decision_maker':
        return <DecisionMakerDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return <Navigate to="/login" replace />
    }
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={getDashboardRoute()} />
        
        {/* Pitcher routes */}
        {user?.role === 'pitcher' && (
          <>
            <Route path="/browse" element={<BrowseDecisionMakers />} />
            <Route path="/bookings" element={<div>Booking History</div>} />
          </>
        )}

        {/* Decision Maker routes */}
        {user?.role === 'decision_maker' && (
          <>
            <Route path="/profile" element={<div>Profile Management</div>} />
            <Route path="/availability" element={<div>Availability Settings</div>} />
            <Route path="/earnings" element={<div>Earnings Dashboard</div>} />
          </>
        )}

        {/* Admin routes */}
        {user?.role === 'admin' && (
          <>
            <Route path="/admin/users" element={<div>User Management</div>} />
            <Route path="/admin/analytics" element={<div>Analytics</div>} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App