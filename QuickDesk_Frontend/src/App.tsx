import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { store } from './Redux_mnagement/store/store';
import { useAuth } from './hooks/useauth';

// Components
import Layout from './components/Layout/Layout';
import Login from './components/auth/login';
import Register from './components/auth/reg_form';
import Dashboard from './components/dashboard_controlfile/UserDashboard';
// import TicketList from './components/Tickets/TicketList';
// import CreateTicket from './components/Tickets/CreateTicket';
// import TicketDetail from './components/Tickets/TicketDetail';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Auth Route Component (redirect if already authenticated)
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppContent: React.FC = () => {
  return (
    // <Router>
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        <AuthRoute>
          <Login />
        </AuthRoute>
      } />
      <Route path="/register" element={
        <AuthRoute>
          <Register />
        </AuthRoute>
      } />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        {/* <Route path="tickets" element={<TicketList />} />
          <Route path="tickets/new" element={<CreateTicket />} />
          <Route path="tickets/all" element={<TicketList />} />
          <Route path="tickets/:id" element={<TicketDetail />} /> */}
        <Route path="users" element={<div className="card-glass p-8 text-center">User Management Coming Soon</div>} />
        <Route path="analytics" element={<div className="card-glass p-8 text-center">Analytics Dashboard Coming Soon</div>} />
        <Route path="notifications" element={<div className="card-glass p-8 text-center">Notifications Coming Soon</div>} />
        <Route path="settings" element={<div className="card-glass p-8 text-center">Settings Coming Soon</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>

  );
};

function App() {
  return (
    // <Provider store={store}>
    <AppContent />
    // </Provider>
  );
}

export default App;