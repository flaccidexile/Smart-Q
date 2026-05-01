import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import RequestPage    from './pages/RequestPage';
import TrackingPage   from './pages/TrackingPage';
import KioskPage      from './pages/KioskPage';
import Dashboard      from './pages/admin/Dashboard';
import RequestsView   from './pages/admin/RequestsView';
import CalendarPage   from './pages/admin/CalendarPage';
import ReportsPage    from './pages/admin/ReportsPage';
import UserManagement from './pages/admin/UserManagement';
import AppointmentPage from './pages/AppointmentPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<LandingPage />} />
          <Route path="/login"   element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/kiosk"   element={<KioskPage />} />
          <Route path="/appointment" element={<AppointmentPage />} />

          {/* Protected – Customer */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<RequestPage />} />
          </Route>

          {/* Protected – Admin */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin"              element={<Dashboard />} />
            <Route path="/admin/requests"     element={<RequestsView />} />
            <Route path="/admin/calendar"     element={<CalendarPage />} />
            <Route path="/admin/reports"      element={<ReportsPage />} />
            <Route path="/admin/users"        element={<UserManagement />} />
            <Route path="/track"              element={<TrackingPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
