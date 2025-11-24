import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Progress,
  Table,
  Spin,
  Button,
  Typography,
  Space,
  message,
} from 'antd';
import {
  TrophyOutlined,
  BookOutlined,
  TeamOutlined,
  ApartmentOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
} from 'recharts';
import axios from 'axios';
import './DashboardKapabilitasRisiko.css';

const { Title, Text } = Typography;
const { Option } = Select;

interface DashboardData {
  year: number;
  summary: {
    totalLearningHours: number;
    totalLearningHoursTarget: number;
    learningHoursProgress: number;
    totalCertifications: number;
    totalCertificationsTarget: number;
    certificationsProgress: number;
    totalEmployees: number;
    totalDepartments: number;
  };
  departmentData: Array<{
    departmentId: string;
    departmentName: string;
    learningHours: number;
    learningHoursTarget: number;
    certifications: number;
    certificationsTarget: number;
    employeeCount: number;
    learningHoursProgress: number;
    certificationsProgress: number;
  }>;
  employeeData: Array<{
    employeeId: string;
    employeeName: string;
    department: string;
    learningHours: number;
    certifications: number;
  }>;
}

const DashboardKapabilitasRisiko: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchDashboardData = async (year: number) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard/kapabilitas-risiko`, {
        params: { year },
      });

      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Generate year options (last 5 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (loading && !data) {
    return (
      <div style={{ textAlign: 'center', padding: '100px' }}>
        <Spin size="large" tip="Memuat data dashboard..." />
      </div>
    );
  }

  const summary = data?.summary || {
    totalLearningHours: 0,
    totalLearningHoursTarget: 0,
    learningHoursProgress: 0,
    totalCertifications: 0,
    totalCertificationsTarget: 0,
    certificationsProgress: 0,
    totalEmployees: 0,
    totalDepartments: 0,
  };

  const departmentData = data?.departmentData || [];
  const employeeData = data?.employeeData || [];

  // Prepare chart data
  const deptChartData = departmentData.map((dept) => ({
    name: dept.departmentName.length > 15 
      ? dept.departmentName.substring(0, 15) + '...' 
      : dept.departmentName,
    'Learning Hours': dept.learningHours,
    'Target LH': dept.learningHoursTarget,
    'Sertifikasi': dept.certifications,
    'Target Sertif': dept.certificationsTarget,
  }));

  const topEmployeesLH = employeeData.slice(0, 10);
  const topEmployeesCert = [...employeeData]
    .sort((a, b) => b.certifications - a.certifications)
    .slice(0, 10);

  const deptTableColumns = [
    {
      title: 'Departemen',
      dataIndex: 'departmentName',
      key: 'departmentName',
      fixed: 'left' as const,
      width: 200,
    },
    {
      title: 'Learning Hours',
      children: [
        {
          title: 'Realisasi',
          dataIndex: 'learningHours',
          key: 'learningHours',
          render: (val: number) => val.toLocaleString('id-ID'),
          sorter: (a: any, b: any) => a.learningHours - b.learningHours,
        },
        {
          title: 'Target',
          dataIndex: 'learningHoursTarget',
          key: 'learningHoursTarget',
          render: (val: number) => val.toLocaleString('id-ID'),
        },
        {
          title: 'Progress',
          dataIndex: 'learningHoursProgress',
          key: 'learningHoursProgress',
          render: (val: number) => (
            <Progress
              percent={val}
              size="small"
              status={val >= 100 ? 'success' : val >= 70 ? 'normal' : 'exception'}
            />
          ),
          sorter: (a: any, b: any) => a.learningHoursProgress - b.learningHoursProgress,
        },
      ],
    },
    {
      title: 'Sertifikasi',
      children: [
        {
          title: 'Realisasi',
          dataIndex: 'certifications',
          key: 'certifications',
          render: (val: number) => val.toLocaleString('id-ID'),
          sorter: (a: any, b: any) => a.certifications - b.certifications,
        },
        {
          title: 'Target',
          dataIndex: 'certificationsTarget',
          key: 'certificationsTarget',
          render: (val: number) => val.toLocaleString('id-ID'),
        },
        {
          title: 'Progress',
          dataIndex: 'certificationsProgress',
          key: 'certificationsProgress',
          render: (val: number) => (
            <Progress
              percent={val}
              size="small"
              status={val >= 100 ? 'success' : val >= 70 ? 'normal' : 'exception'}
            />
          ),
          sorter: (a: any, b: any) => a.certificationsProgress - b.certificationsProgress,
        },
      ],
    },
    {
      title: 'Pegawai',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      render: (val: number) => val.toLocaleString('id-ID'),
    },
  ];

  const employeeTableColumns = [
    {
      title: 'Nama Pegawai',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 250,
    },
    {
      title: 'Departemen',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Learning Hours',
      dataIndex: 'learningHours',
      key: 'learningHours',
      render: (val: number) => val.toLocaleString('id-ID') + ' jam',
      sorter: (a: any, b: any) => a.learningHours - b.learningHours,
    },
    {
      title: 'Sertifikasi',
      dataIndex: 'certifications',
      key: 'certifications',
      render: (val: number) => val.toLocaleString('id-ID'),
      sorter: (a: any, b: any) => a.certifications - b.certifications,
    },
  ];

  // ============ DATA PREPARATION FOR NEW WIDGETS ============
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];
  
  // Status Learning Hours (Pie Chart Data)
  const employeesWithLHTarget = employeeData.map(emp => {
    const deptTarget = departmentData.find(d => d.departmentId === emp.department)?.learningHoursTarget || 0;
    const avgTargetPerEmployee = deptTarget / Math.max(departmentData.find(d => d.departmentId === emp.department)?.employeeCount || 1, 1);
    return {
      ...emp,
      target: avgTargetPerEmployee,
      gap: emp.learningHours - avgTargetPerEmployee,
      isMet: emp.learningHours >= avgTargetPerEmployee
    };
  });

  const lhStatusData = [
    { name: 'BELUM TERPENUHI', value: employeesWithLHTarget.filter(e => !e.isMet).length, color: '#0088FE' },
    { name: 'TERPENUHI', value: employeesWithLHTarget.filter(e => e.isMet).length, color: '#00C49F' },
  ];

  // Status Sertifikasi (Pie Chart Data)
  const employeesWithCertTarget = employeeData.map(emp => {
    const deptTarget = departmentData.find(d => d.departmentId === emp.department)?.certificationsTarget || 0;
    const avgTargetPerEmployee = deptTarget / Math.max(departmentData.find(d => d.departmentId === emp.department)?.employeeCount || 1, 1);
    return {
      ...emp,
      target: avgTargetPerEmployee,
      gap: emp.certifications - avgTargetPerEmployee,
      isMet: emp.certifications >= avgTargetPerEmployee
    };
  });

  const certStatusData = [
    { name: 'BELUM TERPENUHI', value: employeesWithCertTarget.filter(e => !e.isMet).length, color: '#0088FE' },
    { name: 'TERPENUHI', value: employeesWithCertTarget.filter(e => e.isMet).length, color: '#00C49F' },
  ];

  // Gap Learning Hours Terbesar (Top 10)
  const topLHGaps = employeesWithLHTarget
    .filter(e => e.gap < 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 10)
    .map(e => ({
      employeeName: e.employeeName,
      position: e.department, // Using department as position for now
      gap: Math.abs(e.gap)
    }));

  // Gap Sertifikasi Terbesar (Top 10)
  const topCertGaps = employeesWithCertTarget
    .filter(e => e.gap < 0)
    .sort((a, b) => a.gap - b.gap)
    .slice(0, 10)
    .map(e => ({
      employeeName: e.employeeName,
      position: e.department,
      gap: Math.abs(e.gap)
    }));

  // Gap LH per Departemen (for bar chart)
  const deptGapData = departmentData.map(dept => ({
    name: dept.departmentName.length > 20 ? dept.departmentName.substring(0, 20) + '...' : dept.departmentName,
    fullName: dept.departmentName,
    Realisasi: dept.learningHours,
    Target: dept.learningHoursTarget,
    Gap: dept.learningHours - dept.learningHoursTarget,
  }));

  // Hubungan LH vs CERT (Scatter plot data)
  const lhVsCertData = employeeData.map(emp => ({
    name: emp.employeeName,
    lh: emp.learningHours,
    cert: emp.certifications,
    z: 100, // size of scatter point
  }));

  // Ketercapaian per Departemen (Radar chart)
  const radarData = departmentData.slice(0, 8).map(dept => ({
    department: dept.departmentName.length > 15 ? dept.departmentName.substring(0, 15) + '...' : dept.departmentName,
    'Learning Hours': dept.learningHoursProgress,
    'Sertifikasi': dept.certificationsProgress,
  }));

  // Kontribusi LH per Jabatan (Treemap - using department as proxy)
  const treemapData = departmentData.map((dept, idx) => ({
    name: dept.departmentName,
    size: dept.learningHours,
    color: COLORS[idx % COLORS.length],
  }));

  // Sebaran Gap Learning Hours (Histogram)
  const gapRanges = [
    { range: '-60', min: -Infinity, max: -60, count: 0 },
    { range: '-50,6', min: -60, max: -50, count: 0 },
    { range: '-31,7', min: -50, max: -31, count: 0 },
    { range: '-22,3', min: -31, max: -22, count: 0 },
    { range: '-3,4 - 6', min: -22, max: 6, count: 0 },
  ];

  employeesWithLHTarget.forEach(emp => {
    const gap = emp.gap;
    for (const range of gapRanges) {
      if (gap > range.min && gap <= range.max) {
        range.count++;
        break;
      }
    }
  });

  const gapHistogramData = gapRanges.map(r => ({ range: r.range, count: r.count }));

  // Performa LH Terdepan (Employees exceeding target)
  const topPerformers = employeesWithLHTarget
    .filter(e => e.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 10)
    .map(e => ({
      employeeName: e.employeeName,
      position: e.department,
      surplus: e.gap
    }));

  const renderCard = (
    title: string,
    content: React.ReactNode,
    extra?: React.ReactNode
  ) => {
    return (
      <Card
        className="dashboard-card"
        title={title}
        extra={extra}
      >
        {content}
      </Card>
    );
  };

  return (
    <div className="dashboard-kapabilitas-risiko">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <Title level={2} style={{ margin: 0 }}>
            <TrophyOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Dashboard Kapabilitas Risiko
          </Title>
          <Text type="secondary">
            Monitoring Pencapaian Learning Hours & Sertifikasi
          </Text>
        </div>
        <Space size="middle">
          <Select
            value={selectedYear}
            onChange={handleYearChange}
            style={{ width: 120 }}
            size="large"
          >
            {yearOptions.map((year) => (
              <Option key={year} value={year}>
                Tahun {year}
              </Option>
            ))}
          </Select>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchDashboardData(selectedYear)}
            loading={loading}
            size="large"
          >
            Refresh
          </Button>
          <Button
            icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            size="large"
            type="primary"
          >
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </Space>
      </div>

      {/* Summary Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Learning Hours"
              value={summary.totalLearningHours}
              suffix={`/ ${summary.totalLearningHoursTarget}`}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
            <Progress
              percent={summary.learningHoursProgress}
              status={
                summary.learningHoursProgress >= 100
                  ? 'success'
                  : summary.learningHoursProgress >= 70
                  ? 'normal'
                  : 'exception'
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Sertifikasi"
              value={summary.totalCertifications}
              suffix={`/ ${summary.totalCertificationsTarget}`}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
            <Progress
              percent={summary.certificationsProgress}
              status={
                summary.certificationsProgress >= 100
                  ? 'success'
                  : summary.certificationsProgress >= 70
                  ? 'normal'
                  : 'exception'
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Pegawai"
              value={summary.totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Departemen"
              value={summary.totalDepartments}
              prefix={<ApartmentOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          {renderCard(
            'Perbandingan Realisasi vs Target per Departemen',
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={deptChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Learning Hours" fill="#8884d8" />
                  <Bar dataKey="Target LH" fill="#82ca9d" />
                  <Bar dataKey="Sertifikasi" fill="#ffc658" />
                  <Bar dataKey="Target Sertif" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Col>
        </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          {renderCard(
            'Detail Realisasi per Departemen',
              <Table
                dataSource={departmentData}
                columns={deptTableColumns}
                rowKey="departmentId"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 1200 }}
                size="middle"
              />
            )}
          </Col>
        </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          {renderCard(
            'Top 10 Pegawai - Learning Hours',
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topEmployeesLH} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="employeeName"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="learningHours" fill="#8884d8" name="Learning Hours" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Col>
          <Col xs={24} lg={12}>
            {renderCard(
              'Top 10 Pegawai - Sertifikasi',
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topEmployeesCert} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis
                    dataKey="employeeName"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip />
                  <Bar dataKey="certifications" fill="#ffc658" name="Sertifikasi" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Col>
        </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          {renderCard(
            'Detail Pencapaian Pegawai',
              <Table
                dataSource={employeeData}
                columns={employeeTableColumns}
                rowKey="employeeId"
                pagination={{ pageSize: 20 }}
                scroll={{ x: 800 }}
                size="middle"
              />
            )}
          </Col>
        </Row>

      {/* ============ NEW WIDGETS ============ */}

      {/* Row 1: Status Charts & Pegawai Direkap */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={8}>
          {renderCard(
            'Status Learning Hours',
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Komposisi status ketercapaian LH
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={lhStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  >
                    {lhStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Col>
        <Col xs={24} lg={8}>
          {renderCard(
            'Status Sertifikasi',
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Komposisi status ketercapaian CERT
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={certStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }: any) => `${name}: ${((percent as number) * 100).toFixed(0)}%`}
                  >
                    {certStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Col>
        <Col xs={24} lg={8}>
          <Card>
            <Statistic
              title="Pegawai Direkap"
              value={summary.totalEmployees}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 48, color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Gap Tables */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          {renderCard(
            'Gap Learning Hours Terbesar',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                {topLHGaps.length} pegawai dengan gap terbesar (LH)
              </Text>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 24 }}>
                  Total Pegawai: {topLHGaps.length}
                </Text>
              </div>
              <Table
                dataSource={topLHGaps}
                columns={[
                  { title: 'Pegawai', dataIndex: 'employeeName', key: 'name', width: '40%' },
                  { title: 'Jabatan', dataIndex: 'position', key: 'position', width: '40%' },
                  { 
                    title: 'Gap', 
                    dataIndex: 'gap', 
                    key: 'gap',
                    render: (val: number) => (
                      <Text type="danger">-{val.toFixed(1)}</Text>
                    ),
                    width: '20%'
                  },
                ]}
                rowKey={(_, index) => `lh-gap-${index}`}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </div>
          )}
        </Col>
        <Col xs={24} lg={12}>
          {renderCard(
            'Gap Sertifikasi Terbesar',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                {topCertGaps.length} pegawai dengan gap terbesar (CERT)
              </Text>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 24 }}>
                  Total Pegawai: {topCertGaps.length}
                </Text>
              </div>
              <Table
                dataSource={topCertGaps}
                columns={[
                  { title: 'Pegawai', dataIndex: 'employeeName', key: 'name', width: '40%' },
                  { title: 'Jabatan', dataIndex: 'position', key: 'position', width: '40%' },
                  { 
                    title: 'Gap', 
                    dataIndex: 'gap', 
                    key: 'gap',
                    render: (val: number) => (
                      <Text type="danger">-{val.toFixed(0)}</Text>
                    ),
                    width: '20%'
                  },
                ]}
                rowKey={(_, index) => `cert-gap-${index}`}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </div>
          )}
        </Col>
      </Row>

      {/* Row 3: Gap LH per Departemen & Scatter Plot */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          {renderCard(
            'Gap LH per Jenis Organ',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Aggregasi realisasi vs target
              </Text>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={deptGapData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={120} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Realisasi" fill="#00C49F" />
                  <Bar dataKey="Target" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Col>
        <Col xs={24} lg={12}>
          {renderCard(
            'Hubungan LH vs CERT',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Sebaran realisasi LH dan CERT per pegawai
              </Text>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="cert" name="Sertifikasi" />
                  <YAxis type="number" dataKey="lh" name="Learning Hours" />
                  <ZAxis type="number" dataKey="z" range={[50, 200]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Pegawai" data={lhVsCertData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </Col>
      </Row>

      {/* Row 4: Radar Chart & Treemap */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          {renderCard(
            'Ketercapaian per Jenis Organ',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Perbandingan capaian LH & CERT
              </Text>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="department" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Learning Hours"
                    dataKey="Learning Hours"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Sertifikasi"
                    dataKey="Sertifikasi"
                    stroke="#82ca9d"
                    fill="#82ca9d"
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Col>
        <Col xs={24} lg={12}>
          {renderCard(
            'Kontribusi LH per Jabatan',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Porsi realisasi LH berdasarkan jabatan
              </Text>
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={treemapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  fill="#8884d8"
                  content={({ x, y, width, height, name, size }: any) => (
                    <g>
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        style={{
                          fill: COLORS[treemapData.findIndex(d => d.name === name) % COLORS.length],
                          stroke: '#fff',
                          strokeWidth: 2,
                        }}
                      />
                      {width > 50 && height > 30 && (
                        <>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 - 5}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {name.length > 15 ? name.substring(0, 15) + '...' : name}
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 10}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={10}
                          >
                            {size} jam
                          </text>
                        </>
                      )}
                    </g>
                  )}
                />
              </ResponsiveContainer>
            </div>
          )}
        </Col>
      </Row>

      {/* Row 5: Histogram & Top Performers */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          {renderCard(
            'Sebaran Gap Learning Hours',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                Distribusi gap LH terhadap target
              </Text>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gapHistogramData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#00C49F" name="Jumlah Pegawai" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Col>
        <Col xs={24} lg={12}>
          {renderCard(
            'Performa LH Terdepan',
            <div>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                Pegawai yang melampaui target jam belajar
              </Text>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 24 }}>
                  Total Pegawai: {topPerformers.length}
                </Text>
              </div>
              <Table
                dataSource={topPerformers}
                columns={[
                  { title: 'Pegawai', dataIndex: 'employeeName', key: 'name', width: '40%' },
                  { title: 'Jabatan', dataIndex: 'position', key: 'position', width: '40%' },
                  { 
                    title: 'Surplus Jam', 
                    dataIndex: 'surplus', 
                    key: 'surplus',
                    render: (val: number) => (
                      <Text type="success">+{val.toFixed(1)}</Text>
                    ),
                    width: '20%'
                  },
                ]}
                rowKey={(_, index) => `performer-${index}`}
                pagination={false}
                size="small"
                scroll={{ y: 300 }}
              />
            </div>
          )}
        </Col>
      </Row>

    </div>
  );
};

export default DashboardKapabilitasRisiko;
