import React, { useState, useMemo } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  DashboardOutlined,
  SettingOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  TeamOutlined,
  IdcardOutlined,
  ApartmentOutlined,
  ControlOutlined,
  SafetyOutlined,
  LogoutOutlined,
  UserOutlined,
  TrophyOutlined,
  SunOutlined,
  MoonOutlined,
  ThunderboltOutlined,
  HeartOutlined,
  AimOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import logoVerticalWhite from '../../assets/logo-vertical-white.webp';
import logoVerticalColor from '../../assets/logo-vertical-color.webp';
import logoHorizontalColor from '../../assets/logo-horizontal-color.webp';
import logoHorizontalWhite from '../../assets/3. LOGO PNR HORIZONTAL - WHITE-02.webp';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  
  // Filter menu items based on user permissions
  const menuItems = useMemo(() => {
    const items = [];

    // Home menu - always visible, no permission check
    items.push({
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Home</Link>,
    });

    // Dashboard submenu
    const dashboardChildren = [];
    if (hasPermission('dashboard-tata-kelola')) {
      dashboardChildren.push({
        key: '/dashboard/tata-kelola',
        icon: <SafetyOutlined />,
        label: <Link to="/dashboard/tata-kelola">Tata Kelola Perusahaan</Link>,
      });
    }
    if (hasPermission('dashboard-kapabilitas-risiko')) {
      dashboardChildren.push({
        key: '/dashboard/kapabilitas-risiko',
        icon: <ThunderboltOutlined />,
        label: <Link to="/dashboard/kapabilitas-risiko">Kapabilitas Risiko</Link>,
      });
    }
    if (hasPermission('dashboard-budaya')) {
      dashboardChildren.push({
        key: '/dashboard/budaya',
        icon: <HeartOutlined />,
        label: <Link to="/dashboard/budaya">Budaya</Link>,
      });
    }
    if (dashboardChildren.length > 0) {
      items.push({
        key: 'dashboard',
        icon: <BarChartOutlined />,
        label: 'Dashboard',
        children: dashboardChildren,
      });
    }

    // Master Data submenu
    const masterDataChildren = [];
    if (hasPermission('master-data-departments')) {
      masterDataChildren.push({
        key: '/master/department',
        icon: <ApartmentOutlined />,
        label: <Link to="/master/department">Departemen</Link>,
      });
    }
    if (hasPermission('master-data-positions')) {
      masterDataChildren.push({
        key: '/master/position',
        icon: <IdcardOutlined />,
        label: <Link to="/master/position">Jabatan</Link>,
      });
    }
    if (hasPermission('master-data-employees')) {
      masterDataChildren.push({
        key: '/master/employee',
        icon: <TeamOutlined />,
        label: <Link to="/master/employee">Pegawai</Link>,
      });
    }
    if (masterDataChildren.length > 0) {
      items.push({
        key: 'master-data',
        icon: <DatabaseOutlined />,
        label: 'Master Data',
        children: masterDataChildren,
      });
    }

    // Achievements menu
    if (hasPermission('achievements')) {
      items.push({
        key: '/achievements',
        icon: <TrophyOutlined />,
        label: <Link to="/achievements">Pencapaian</Link>,
      });
    }

    // Settings submenu
    const settingsChildren = [];
    if (hasPermission('settings-app')) {
      settingsChildren.push({
        key: '/settings/app',
        icon: <ControlOutlined />,
        label: <Link to="/settings/app">Pengaturan Aplikasi</Link>,
      });
    }
    if (hasPermission('settings-access')) {
      settingsChildren.push({
        key: '/settings/access',
        icon: <SafetyOutlined />,
        label: <Link to="/settings/access">Hak Akses</Link>,
      });
    }
    if (hasPermission('settings-targets')) {
      settingsChildren.push({
        key: '/settings/targets',
        icon: <AimOutlined />,
        label: <Link to="/settings/targets">Target Sertifikasi & Learning Hours</Link>,
      });
    }
    if (settingsChildren.length > 0) {
      items.push({
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Pengaturan',
        children: settingsChildren,
      });
    }

    if (hasPermission('reports')) {
      items.push({
        key: '/reports',
        icon: <BarChartOutlined />,
        label: <Link to="/reports">Reports</Link>,
      });
    }

    return items;
  }, [hasPermission]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        width={250}
        collapsed={collapsed}
        onBreakpoint={(broken) => {
          setCollapsed(broken);
        }}
        onCollapse={(collapsed) => {
          setCollapsed(collapsed);
        }}
        style={{
          background: isDarkMode ? '#001529' : '#ffffff',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          zIndex: 2,
          boxShadow: isDarkMode ? 'none' : '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="logo" style={{
          background: isDarkMode ? '#001529' : '#ffffff',
          borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f0f0f0'
        }}>
          <img 
            src={isDarkMode ? logoVerticalWhite : logoVerticalColor} 
            alt="Nusantara Regas Logo" 
            style={{ 
              width: '140px',
              height: 'auto',
              objectFit: 'contain'
            }} 
          />
        </div>
        <Menu
          theme={isDarkMode ? 'dark' : 'light'}
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout 
        style={{ 
          marginLeft: collapsed ? 0 : 250,
          transition: 'margin-left 0.2s',
          background: isDarkMode ? '#0a0f1a' : '#f5f5f5'
        }}
      >
        <Header style={{ 
          background: isDarkMode ? '#0f1419' : '#fff', 
          padding: '0 24px',
          boxShadow: isDarkMode ? 'none' : '0 2px 8px rgba(0,0,0,0.1)',
          borderBottom: isDarkMode ? '1px solid #1a2332' : 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '64px',
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          lineHeight: '64px'
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{
                fontSize: '18px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#082313',
                marginRight: '16px',
              }}
            />
            <img 
              src={isDarkMode ? logoHorizontalWhite : logoHorizontalColor} 
              alt="Nusantara Regas Logo" 
              style={{ 
                height: '40px',
                width: 'auto',
                objectFit: 'contain'
              }} 
            />
            <div style={{
              marginLeft: '16px',
              paddingLeft: '16px',
              borderLeft: isDarkMode ? '1px solid #1a2332' : '1px solid #f0f0f0',
              lineHeight: '64px'
            }}>
              <span style={{ 
                fontSize: '18px',
                fontWeight: 600,
                color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#082313',
              }}>NR Enterprise Dashboard Data Management</span>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            height: '64px'
          }}>
            {/* Theme Toggle */}
            <Button
              type="text"
              icon={isDarkMode ? <MoonOutlined /> : <SunOutlined />}
              onClick={toggleTheme}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '40px',
                padding: '0 16px',
                borderRadius: '8px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#082313',
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : '#f5f5f5',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Button>

            <div style={{ 
              textAlign: 'right',
              paddingRight: '12px',
              borderRight: isDarkMode ? '1px solid #1a2332' : '1px solid #f0f0f0'
            }}>
              <div style={{ 
                fontWeight: 500, 
                fontSize: '14px',
                color: isDarkMode ? 'rgba(255, 255, 255, 0.85)' : '#001529',
                lineHeight: '20px'
              }}>{user?.name}</div>
              <div style={{ 
                fontSize: '12px', 
                color: isDarkMode ? 'rgba(255, 255, 255, 0.45)' : '#8c8c8c',
                lineHeight: '20px'
              }}>{user?.email}</div>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button 
                type="text" 
                style={{ 
                  height: 48, 
                  width: 48, 
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Avatar 
                  size={40}
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#006cb8' }} 
                />
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ 
          margin: '24px 16px',
          overflow: 'initial'
        }}>
          <div style={{ 
            padding: 24, 
            background: isDarkMode ? '#0f1419' : '#fff',
            minHeight: 360,
            borderRadius: '8px',
            boxShadow: isDarkMode ? 'none' : '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
