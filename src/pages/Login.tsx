import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import logoHorizontal from '../assets/logo-horizontal-color.webp';
import backgroundImage from '../assets/gambar_nr1.webp';
import './Login.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      const response = await api.post('/login', {
        username: values.username,
        password: values.password,
      });

      if (response.data.success) {
        // Use AuthContext login method to store auth data
        login(
          response.data.token,
          response.data.user,
          response.data.permissions || [],
          response.data.roles || []
        );

        message.success('Login berhasil!');
        
        // Redirect to dashboard
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        padding: '20px',
      }}
    >
      {/* Overlay untuk membuat background lebih gelap */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1,
        }}
      />
      
      <Card
        style={{
          width: 420,
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          borderRadius: '20px',
          zIndex: 2,
          background: '#ffffff',
          border: 'none',
          padding: '20px 10px',
        }}
        bodyStyle={{
          padding: '32px 36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ 
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <img 
              src={logoHorizontal} 
              alt="Nusantara Regas Logo" 
              style={{ 
                height: '100px',
                width: 'auto',
                objectFit: 'contain',
              }} 
            />
          </div>
          <h1 style={{ 
            fontSize: 24, 
            marginBottom: 6,
            color: '#1a1a1a',
            fontWeight: 700,
            letterSpacing: '-0.3px',
          }}>NR Enterprise Dashboard Data Management</h1>
          <p style={{ 
            color: '#8c8c8c', 
            fontSize: 14,
            fontWeight: 400,
            margin: 0,
          }}>Silakan login untuk melanjutkan</p>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label={<span style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 13 }}>Username</span>}
            name="username"
            rules={[{ required: true, message: 'Username wajib diisi!' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#006cb8', fontSize: 16 }} />}
              placeholder="Masukkan username"
              style={{
                borderRadius: '10px',
                height: '46px',
                fontSize: 14,
                border: '2px solid #e8e8e8',
                background: '#ffffff',
                color: '#1a1a1a',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#006cb8';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 108, 184, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e8e8';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#1a1a1a', fontWeight: 600, fontSize: 13 }}>Password</span>}
            name="password"
            rules={[{ required: true, message: 'Password wajib diisi!' }]}
            style={{ marginBottom: 28 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#006cb8', fontSize: 16 }} />}
              placeholder="Masukkan password"
              style={{
                borderRadius: '10px',
                height: '46px',
                fontSize: 14,
                border: '2px solid #e8e8e8',
                background: '#ffffff',
                color: '#1a1a1a',
                transition: 'all 0.3s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#006cb8';
                e.target.style.boxShadow = '0 0 0 3px rgba(0, 108, 184, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e8e8e8';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ 
                height: 48, 
                fontSize: 15, 
                fontWeight: 600,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #006cb8 0%, #005090 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 108, 184, 0.3)',
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 108, 184, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 108, 184, 0.3)';
              }}
            >
              Login
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ 
          textAlign: 'center', 
          marginTop: 28,
          paddingTop: 24,
          borderTop: '1px solid #f0f0f0',
        }}>
          <p style={{ 
            color: '#bfbfbf', 
            fontSize: 11,
            margin: 0,
            fontWeight: 400,
          }}>
            © 2025 PT Nusantara Regas. All rights reserved.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
