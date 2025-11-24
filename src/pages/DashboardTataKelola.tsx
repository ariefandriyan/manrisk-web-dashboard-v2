import React from 'react';
import { Card, Typography, Space, Row, Col } from 'antd';
import { SafetyOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const DashboardTataKelola: React.FC = () => {
  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <SafetyOutlined style={{ fontSize: 48, color: '#006cb8' }} />
            <Title level={2}>Dashboard Tata Kelola Perusahaan</Title>
            <Paragraph type="secondary">
              Halaman ini akan menampilkan visualisasi data tata kelola perusahaan
            </Paragraph>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <Card style={{ textAlign: 'center', background: '#f0f2f5' }}>
                <Title level={4}>KPI Tata Kelola</Title>
                <Paragraph>Coming Soon</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card style={{ textAlign: 'center', background: '#f0f2f5' }}>
                <Title level={4}>Compliance Status</Title>
                <Paragraph>Coming Soon</Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <Card style={{ textAlign: 'center', background: '#f0f2f5' }}>
                <Title level={4}>Governance Score</Title>
                <Paragraph>Coming Soon</Paragraph>
              </Card>
            </Col>
          </Row>
        </Space>
      </Card>
    </div>
  );
};

export default DashboardTataKelola;
