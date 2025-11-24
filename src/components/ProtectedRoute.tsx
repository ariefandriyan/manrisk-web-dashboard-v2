import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Result, Button, Spin } from 'antd';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredPermission }) => {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Memuat..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Result
          status="403"
          title="403"
          subTitle="Maaf, Anda tidak memiliki akses ke halaman ini."
          extra={
            <Button type="primary" href="/">
              Kembali ke Dashboard
            </Button>
          }
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
