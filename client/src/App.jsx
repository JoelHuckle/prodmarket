// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/Layout/Layout';

// Pages (create these as you build)
import HomePage from './pages/HomePage';
// import BrowsePage from './pages/BrowsePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
// import ServiceDetailPage from './pages/ServiceDetailPage';
// import DashboardPage from './pages/DashboardPage';
// import OrdersPage from './pages/OrdersPage';
// import SubscriptionsPage from './pages/SubscriptionsPage';
// import SettingsPage from './pages/SettingsPage';

// Design System Preview (optional - remove in production)
import DesignSystem from './pages/DesignSystem';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Main Layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              {/* <Route path="browse" element={<BrowsePage />} /> */}
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              {/* <Route path="services/:id" element={<ServiceDetailPage />} /> */}
              {/* <Route path="dashboard" element={<DashboardPage />} /> */}
              {/* <Route path="orders" element={<OrdersPage />} /> */}
              {/* <Route path="subscriptions" element={<SubscriptionsPage />} /> */}
              {/* <Route path="settings" element={<SettingsPage />} /> */}
              
              {/* Design System Preview */}
              <Route path="design-system" element={<DesignSystem />} />
            </Route>
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}