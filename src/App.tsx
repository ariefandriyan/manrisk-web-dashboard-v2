import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import DashboardTataKelola from './pages/DashboardTataKelola';
import DashboardKapabilitasRisiko from './pages/DashboardKapabilitasRisiko';
import DashboardBudaya from './pages/DashboardBudaya';
import MasterDepartment from './pages/MasterDepartment';
import MasterPosition from './pages/MasterPosition';
import MasterEmployee from './pages/MasterEmployee';
import Achievements from './pages/Achievements';
import Settings from './pages/Settings';
import AccessManagement from './pages/AccessManagement';
import TargetSettings from './pages/TargetSettings';
import Login from './pages/Login';
import ptmnTheme, { ptmnDarkTheme } from './theme/ptmnTheme';
import './App.css';

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <ConfigProvider theme={isDarkMode ? ptmnDarkTheme : ptmnTheme}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Dashboard />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Dashboard Routes */}
            <Route
              path="/dashboard/tata-kelola"
              element={
                <ProtectedRoute requiredPermission="dashboard-tata-kelola">
                  <MainLayout>
                    <DashboardTataKelola />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/kapabilitas-risiko"
              element={
                <ProtectedRoute requiredPermission="dashboard-kapabilitas-risiko">
                  <MainLayout>
                    <DashboardKapabilitasRisiko />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/budaya"
              element={
                <ProtectedRoute requiredPermission="dashboard-budaya">
                  <MainLayout>
                    <DashboardBudaya />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            
          <Route
            path="/master/department"
            element={
              <ProtectedRoute requiredPermission="master-data-departments">
                <MainLayout>
                  <MasterDepartment />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/position"
            element={
              <ProtectedRoute requiredPermission="master-data-positions">
                <MainLayout>
                  <MasterPosition />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/employee"
            element={
              <ProtectedRoute requiredPermission="master-data-employees">
                <MainLayout>
                  <MasterEmployee />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/achievements"
            element={
              <ProtectedRoute requiredPermission="achievements">
                <MainLayout>
                  <Achievements />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/app"
            element={
              <ProtectedRoute requiredPermission="settings-app">
                <MainLayout>
                  <Settings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/access"
            element={
              <ProtectedRoute requiredPermission="settings-access">
                <MainLayout>
                  <AccessManagement />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/targets"
            element={
              <ProtectedRoute requiredPermission="settings-targets">
                <MainLayout>
                  <TargetSettings />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredPermission="reports">
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
    </ConfigProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;

