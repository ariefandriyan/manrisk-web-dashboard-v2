import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Space } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  TrophyOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const { Title, Text } = Typography;

interface HomeStats {
  totalEmployees: number;
  totalDepartments: number;
  totalAchievements: number;
  totalRoles: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<HomeStats>({
    totalEmployees: 0,
    totalDepartments: 0,
    totalAchievements: 0,
    totalRoles: 0,
  });

  useEffect(() => {
    fetchHomeStats();
  }, []);

  const fetchHomeStats = async () => {
    try {
      // Fetch employees count
      const employeesRes = await api.get('/employees');
      const totalEmployees = employeesRes.data.data?.length || 0;

      // Fetch departments count
      const departmentsRes = await api.get('/departments');
      const totalDepartments = departmentsRes.data.data?.length || 0;

      // Fetch achievements count
      const achievementsRes = await api.get('/achievements');
      const totalAchievements = achievementsRes.data.data?.length || 0;

      // Fetch roles count
      const rolesRes = await api.get('/roles');
      const totalRoles = rolesRes.data.data?.length || 0;

      setStats({
        totalEmployees,
        totalDepartments,
        totalAchievements,
        totalRoles,
      });
    } catch (error) {
      console.error('Error fetching home stats:', error);
    }
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const statCards = [
    {
      title: 'Total Pegawai',
      value: stats.totalEmployees,
      icon: <TeamOutlined style={{ fontSize: 40, color: '#006cb8' }} />,
      color: '#e6f4ff',
    },
    {
      title: 'Total Departemen',
      value: stats.totalDepartments,
      icon: <UserOutlined style={{ fontSize: 40, color: '#acc42a' }} />,
      color: '#f6ffed',
    },
    {
      title: 'Total Pencapaian',
      value: stats.totalAchievements,
      icon: <TrophyOutlined style={{ fontSize: 40, color: '#faad14' }} />,
      color: '#fffbe6',
    },
    {
      title: 'Total Role',
      value: stats.totalRoles,
      icon: <SafetyCertificateOutlined style={{ fontSize: 40, color: '#ed1b2f' }} />,
      color: '#fff1f0',
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* Welcome Section */}
      <Card 
        style={{ 
          marginBottom: 24, 
          background: 'linear-gradient(135deg, #006cb8 0%, #004d87 100%)',
          border: 'none'
        }}
      >
        <Space direction="vertical" size={4}>
          <Title 
            level={2} 
            style={{ 
              color: '#fff', 
              margin: 0,
              fontSize: 28,
              fontWeight: 600 
            }}
          >
            {getCurrentGreeting()}, {user?.name || 'User'}! 👋
          </Title>
          <Text style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 16 }}>
            Selamat datang di Dashboard Budaya Risiko Nusantara Regas
          </Text>
        </Space>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        {statCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              style={{
                borderRadius: 8,
                background: stat.color,
                border: 'none',
              }}
            >
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text style={{ fontSize: 14, color: '#666', display: 'block' }}>
                      {stat.title}
                    </Text>
                    <Title level={2} style={{ margin: '8px 0 0 0', fontSize: 32, fontWeight: 700 }}>
                      {stat.value}
                    </Title>
                  </div>
                  <div>
                    {stat.icon}
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Info Card */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card 
            title={<span style={{ fontSize: 18, fontWeight: 600 }}>Tentang Sistem</span>}
            style={{ borderRadius: 8 }}
          >
            <Space direction="vertical" size={12}>
              <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                Sistem Dashboard Budaya Risiko dirancang untuk membantu dalam pengelolaan dan monitoring 
                pencapaian budaya risiko di lingkungan Nusantara Regas.
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 1.6 }}>
                Silakan gunakan menu di sebelah kiri untuk mengakses berbagai fitur yang tersedia 
                sesuai dengan hak akses Anda.
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
