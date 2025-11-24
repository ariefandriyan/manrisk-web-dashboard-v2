import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Select,
  Spin,
  Table,
  Progress,
  Typography,
  Space,
  Tag,
  Button,
  DatePicker,
} from 'antd';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Treemap,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts';
import {
  TrophyOutlined,
  TeamOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './DashboardKapabilitasRisiko.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface DashboardData {
  overview: {
    learningHours: {
      total: number;
      target: number;
      percentage: number;
    };
    certifications: {
      total: number;
      target: number;
      percentage: number;
    };
  };
  trendBulanan: Array<{
    bulan: string;
    learningHoursAktual: number;
    learningHoursTarget: number;
    sertifikasiAktual: number;
    sertifikasiTarget: number;
  }>;
  topPerformers: Array<{
    nama: string;
    department: string;
    jabatan: string;
    totalLH: number;
    totalCert: number;
    totalPencapaian: number;
  }>;
  distribusiJenis: Array<{
    department: string;
    learningHours: number;
    sertifikasi: number;
  }>;
  sertifikasiKadaluarsa: Array<{
    topic: string;
    nama: string;
    department: string;
    jabatan: string;
    validUntil: string;
    hariMenjelang: number;
  }>;
  efektivitasProgram: Array<{
    topic: string;
    organizer: string;
    peserta: number;
    rataJam: number;
    durasi: number;
  }>;
  polaMusimanLH: Array<{
    bulan: string;
    jumlah: number;
  }>;
  polaMusimanCert: Array<{
    bulan: string;
    jumlah: number;
  }>;
  departmentPerformance: Array<{
    department: string;
    totalLH: number;
    totalCert: number;
    pegawaiAktif: number;
    persenLH: number;
    persenCert: number;
  }>;
  achievementVelocity: Array<{
    nama: string;
    department: string;
    pencapaianPerHari: number;
    lhPerBulan: number;
    totalPencapaian: number;
  }>;
  organizerEffectiveness: Array<{
    organizer: string;
    totalProgram: number;
    variasiTopik: number;
    pesertaUnik: number;
    rataNilai: number;
  }>;
}

const DashboardKapabilitasRisiko: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [fullscreenCard, setFullscreenCard] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

  useEffect(() => {
    fetchData();
  }, [selectedYear, dateRange, selectedDepartment, selectedType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { year: selectedYear };
      
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (selectedDepartment !== 'all') {
        params.department = selectedDepartment;
      }
      
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      const response = await axios.get(`${API_URL}/dashboard/kapabilitas-risiko-v2`, { params });
      
      // API returns { success: true, data: {...} }
      if (response.data && response.data.data) {
        setData(response.data.data);
        
        // Extract unique departments
        if (response.data.data.distribusiJenis) {
          const depts = Array.from(new Set(response.data.data.distribusiJenis.map((d: any) => d.department)));
          setDepartments(depts as string[]);
        }
      } else {
        console.error('Invalid API response structure:', response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = (title: string, content: React.ReactNode, cardId?: string, extra?: React.ReactNode) => {
    const isCardFullscreen = fullscreenCard === cardId;
    
    return (
      <Card 
        title={title} 
        extra={
          <Space>
            {extra}
            {cardId && (
              <Button
                size="small"
                icon={isCardFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={() => setFullscreenCard(isCardFullscreen ? null : cardId)}
              />
            )}
          </Space>
        }
        className={`dashboard-card ${isCardFullscreen ? 'card-fullscreen' : ''}`}
      >
        {content}
      </Card>
    );
  };

  if (loading || !data) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Prepare data for radar chart
  const radarData = (data.departmentPerformance || []).slice(0, 6).map((dept) => ({
    department: dept.department.substring(0, 15),
    'Learning Hours': dept.persenLH,
    'Sertifikasi': dept.persenCert,
  }));

  // Prepare treemap data
  const treemapData = (data.organizerEffectiveness || []).map((org, idx) => ({
    name: org.organizer || 'Unknown',
    size: org.pesertaUnik,
    color: COLORS[idx % COLORS.length],
  }));

  return (
    <div className="dashboard-container">
      {/* Header Controls */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            Dashboard Kapabilitas Risiko
          </Title>
        </Col>
        <Col>
          <Space size="middle">
            <RangePicker
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
              format="YYYY-MM-DD"
            />
            <Select
              value={selectedYear}
              onChange={setSelectedYear}
              style={{ width: 120 }}
            >
              {[2023, 2024, 2025].map((year) => (
                <Select.Option key={year} value={year}>
                  {year}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={selectedDepartment}
              onChange={setSelectedDepartment}
              style={{ width: 200 }}
              placeholder="Pilih Department"
            >
              <Select.Option value="all">Semua Department</Select.Option>
              {departments.map((dept) => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
            <Select
              value={selectedType}
              onChange={setSelectedType}
              style={{ width: 180 }}
            >
              <Select.Option value="all">Semua Jenis</Select.Option>
              <Select.Option value="1">Learning Hours</Select.Option>
              <Select.Option value="2">Sertifikasi</Select.Option>
            </Select>
          </Space>
        </Col>
      </Row>

      {/* ============ EXECUTIVE VIEW ============ */}
      <Title level={4}>Executive View</Title>

      {/* Widget 1: Overview KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dark-mode-card">
            <Statistic
              title="Total Learning Hours"
              value={data.overview?.learningHours?.total || 0}
              suffix={`/ ${data.overview?.learningHours?.target || 0}`}
              prefix={<BookOutlined />}
              valueStyle={{ fontSize: 28 }}
            />
            <Progress
              percent={data.overview?.learningHours?.percentage || 0}
              strokeColor={(data.overview?.learningHours?.percentage || 0) >= 80 ? '#52c41a' : '#faad14'}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dark-mode-card">
            <Statistic
              title="Total Sertifikasi"
              value={data.overview?.certifications?.total || 0}
              suffix={`/ ${data.overview?.certifications?.target || 0}`}
              prefix={<SafetyCertificateOutlined />}
              valueStyle={{ fontSize: 28 }}
            />
            <Progress
              percent={data.overview?.certifications?.percentage || 0}
              strokeColor={(data.overview?.certifications?.percentage || 0) >= 80 ? '#52c41a' : '#faad14'}
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dark-mode-card">
            <Statistic
              title="Pegawai Aktif"
              value={(data.departmentPerformance || []).reduce((sum, d) => sum + d.pegawaiAktif, 0)}
              prefix={<TeamOutlined />}
              valueStyle={{ fontSize: 28, color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="dark-mode-card">
            <Statistic
              title="Total Program"
              value={(data.organizerEffectiveness || []).reduce((sum, o) => sum + o.totalProgram, 0)}
              prefix={<TrophyOutlined />}
              valueStyle={{ fontSize: 28, color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Widget 2: Trend Pencapaian Bulanan */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          {renderCard(
            'Trend Pencapaian Bulanan (12 Bulan Terakhir)',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'trend-bulanan' ? 600 : 350}>
              <LineChart data={data.trendBulanan || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="learningHoursAktual"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="LH Aktual"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="learningHoursTarget"
                  stroke="#82ca9d"
                  strokeDasharray="5 5"
                  name="LH Target"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sertifikasiAktual"
                  stroke="#ffc658"
                  strokeWidth={2}
                  name="Cert Aktual"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="sertifikasiTarget"
                  stroke="#ff7c7c"
                  strokeDasharray="5 5"
                  name="Cert Target"
                />
              </LineChart>
            </ResponsiveContainer>,
            'trend-bulanan'
          )}
        </Col>
      </Row>

      {/* Widget 8: Department Performance Radar */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={fullscreenCard === 'radar-dept' ? 24 : 12}>
          {renderCard(
            'Performa Department (Radar)',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'radar-dept' ? 600 : 400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="department" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Learning Hours (%)"
                  dataKey="Learning Hours"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Radar
                  name="Sertifikasi (%)"
                  dataKey="Sertifikasi"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>,
            'radar-dept'
          )}
        </Col>
        <Col xs={24} lg={fullscreenCard === 'table-dept' ? 24 : 12}>
          {renderCard(
            'Department Performance Detail',
            <Table
              dataSource={data.departmentPerformance || []}
              columns={[
                { title: 'Department', dataIndex: 'department', key: 'dept', width: '25%' },
                {
                  title: 'LH',
                  dataIndex: 'totalLH',
                  key: 'lh',
                  render: (val: number, record: any) => (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text>{val.toFixed(0)}</Text>
                      <Progress percent={record.persenLH} size="small" />
                    </Space>
                  ),
                },
                {
                  title: 'Cert',
                  dataIndex: 'totalCert',
                  key: 'cert',
                  render: (val: number, record: any) => (
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      <Text>{val}</Text>
                      <Progress percent={record.persenCert} size="small" />
                    </Space>
                  ),
                },
                { title: 'Pegawai', dataIndex: 'pegawaiAktif', key: 'emp' },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey="department"
            />,
            'table-dept'
          )}
        </Col>
      </Row>

      {/* ============ MANAGER VIEW ============ */}
      <Title level={4} style={{ marginTop: 32 }}>Manager View</Title>

      {/* Widget 3: Top Performers Leaderboard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={fullscreenCard === 'top-performers' ? 24 : 12}>
          {renderCard(
            '🏆 Top 10 Performers',
            <Table
              dataSource={(data.topPerformers || []).slice(0, 10)}
              columns={[
                {
                  title: 'Rank',
                  key: 'rank',
                  render: (_, __, idx) => {
                    if (idx === 0) return <Tag color="gold">🥇 1st</Tag>;
                    if (idx === 1) return <Tag color="silver">🥈 2nd</Tag>;
                    if (idx === 2) return <Tag color="bronze">🥉 3rd</Tag>;
                    return <Tag>{idx + 1}</Tag>;
                  },
                  width: 80,
                },
                { title: 'Nama', dataIndex: 'nama', key: 'nama' },
                { title: 'Department', dataIndex: 'department', key: 'dept', width: 150 },
                {
                  title: 'LH',
                  dataIndex: 'totalLH',
                  key: 'lh',
                  render: (val: number) => <Text strong>{val.toFixed(1)}</Text>,
                  width: 80,
                },
                {
                  title: 'Cert',
                  dataIndex: 'totalCert',
                  key: 'cert',
                  render: (val: number) => <Text strong>{val}</Text>,
                  width: 80,
                },
              ]}
              pagination={false}
              size="small"
              rowKey="nama"
            />,
            'top-performers'
          )}
        </Col>

        {/* Widget 4: Distribusi Jenis Pencapaian */}
        <Col xs={24} lg={fullscreenCard === 'distribusi' ? 24 : 12}>
          {renderCard(
            'Distribusi Learning Hours vs Sertifikasi',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'distribusi' ? 600 : 400}>
              <BarChart data={data.distribusiJenis || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="learningHours" fill="#8884d8" name="Learning Hours" />
                <Bar dataKey="sertifikasi" fill="#82ca9d" name="Sertifikasi" />
              </BarChart>
            </ResponsiveContainer>,
            'distribusi'
          )}
        </Col>
      </Row>

      {/* Widget 7: Seasonal Pattern Analysis */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={fullscreenCard === 'pola-lh' ? 24 : 12}>
          {renderCard(
            'Pola Musiman Learning Hours',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'pola-lh' ? 500 : 300}>
              <AreaChart data={data.polaMusimanLH || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="jumlah"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="Jumlah Pencapaian"
                />
              </AreaChart>
            </ResponsiveContainer>,
            'pola-lh'
          )}
        </Col>
        <Col xs={24} lg={fullscreenCard === 'pola-cert' ? 24 : 12}>
          {renderCard(
            'Pola Musiman Sertifikasi',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'pola-cert' ? 500 : 300}>
              <AreaChart data={data.polaMusimanCert || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="jumlah"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="Jumlah Pencapaian"
                />
              </AreaChart>
            </ResponsiveContainer>,
            'pola-cert'
          )}
        </Col>
      </Row>

      {/* ============ OPERATIONAL VIEW ============ */}
      <Title level={4} style={{ marginTop: 32 }}>Operational View</Title>

      {/* Widget 5: Sertifikasi Mendekati Kadaluarsa */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          {renderCard(
            '⚠️ Sertifikasi Mendekati Kadaluarsa (3 Bulan)',
            <Table
              dataSource={data.sertifikasiKadaluarsa || []}
              columns={[
                { title: 'Topik', dataIndex: 'topic', key: 'topic', width: '25%' },
                { title: 'Nama', dataIndex: 'nama', key: 'nama', width: '15%' },
                { title: 'Department', dataIndex: 'department', key: 'dept', width: '15%' },
                { title: 'Jabatan', dataIndex: 'jabatan', key: 'jabatan', width: '15%' },
                {
                  title: 'Valid Until',
                  dataIndex: 'validUntil',
                  key: 'valid',
                  width: '15%',
                  render: (date: string) => dayjs(date).format('DD MMM YYYY'),
                },
                {
                  title: 'Status',
                  dataIndex: 'hariMenjelang',
                  key: 'status',
                  width: '15%',
                  render: (days: number) => {
                    if (days <= 30) return <Tag color="red">Urgent ({days} hari)</Tag>;
                    if (days <= 60) return <Tag color="orange">Peringatan ({days} hari)</Tag>;
                    return <Tag color="yellow">Reminder ({days} hari)</Tag>;
                  },
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey={(_, idx) => `cert-${idx}`}
            />,
            'cert-kadaluarsa'
          )}
        </Col>
      </Row>

      {/* Widget 6: Efektivitas Program Learning */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={fullscreenCard === 'efektivitas' ? 24 : 12}>
          {renderCard(
            'Efektivitas Program Learning (Bubble Chart)',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'efektivitas' ? 600 : 400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="durasi" name="Durasi (hari)" />
                <YAxis type="number" dataKey="rataJam" name="Rata-rata Jam" />
                <ZAxis type="number" dataKey="peserta" range={[50, 400]} name="Peserta" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name="Program"
                  data={data.efektivitasProgram || []}
                  fill="#8884d8"
                  shape="circle"
                />
              </ScatterChart>
            </ResponsiveContainer>,
            'efektivitas'
          )}
        </Col>

        {/* Widget 9: Achievement Velocity */}
        <Col xs={24} lg={fullscreenCard === 'velocity' ? 24 : 12}>
          {renderCard(
            'Achievement Velocity (Kecepatan Pencapaian)',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'velocity' ? 600 : 400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="totalPencapaian" name="Total Pencapaian" />
                <YAxis type="number" dataKey="pencapaianPerHari" name="Pencapaian/Hari" />
                <ZAxis type="number" dataKey="lhPerBulan" range={[50, 300]} name="LH/Bulan" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name="Pegawai"
                  data={data.achievementVelocity || []}
                  fill="#82ca9d"
                  shape="diamond"
                />
              </ScatterChart>
            </ResponsiveContainer>,
            'velocity'
          )}
        </Col>
      </Row>

      {/* ============ ADDITIONAL INSIGHTS ============ */}
      <Title level={4} style={{ marginTop: 32 }}>Additional Insights</Title>

      {/* Widget 10: Organizer Effectiveness Treemap */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={fullscreenCard === 'treemap' ? 24 : 12}>
          {renderCard(
            'Efektivitas Penyelenggara (Treemap)',
            <ResponsiveContainer width="100%" height={fullscreenCard === 'treemap' ? 600 : 400}>
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
                        fill: treemapData.find((d) => d.name === name)?.color || '#8884d8',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                    {width > 60 && height > 40 && (
                      <>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 - 5}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={12}
                          fontWeight="bold"
                        >
                          {name.length > 20 ? name.substring(0, 20) + '...' : name}
                        </text>
                        <text
                          x={x + width / 2}
                          y={y + height / 2 + 12}
                          textAnchor="middle"
                          fill="#fff"
                          fontSize={10}
                        >
                          {size} peserta
                        </text>
                      </>
                    )}
                  </g>
                )}
              />
            </ResponsiveContainer>,
            'treemap'
          )}
        </Col>

        {/* Organizer Detail Table */}
        <Col xs={24} lg={fullscreenCard === 'organizer-detail' ? 24 : 12}>
          {renderCard(
            'Detail Penyelenggara',
            <Table
              dataSource={data.organizerEffectiveness || []}
              columns={[
                { title: 'Organizer', dataIndex: 'organizer', key: 'org', width: '30%' },
                { title: 'Program', dataIndex: 'totalProgram', key: 'prog', width: '15%' },
                { title: 'Topik', dataIndex: 'variasiTopik', key: 'topik', width: '15%' },
                { title: 'Peserta', dataIndex: 'pesertaUnik', key: 'peserta', width: '15%' },
                {
                  title: 'Rata Nilai',
                  dataIndex: 'rataNilai',
                  key: 'nilai',
                  render: (val: number) => val.toFixed(1),
                  width: '25%',
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey="organizer"
            />,
            'organizer-detail'
          )}
        </Col>
      </Row>

      {/* Program Details Table */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          {renderCard(
            'Detail Program Learning',
            <Table
              dataSource={data.efektivitasProgram || []}
              columns={[
                { title: 'Topik', dataIndex: 'topic', key: 'topic', width: '30%' },
                { title: 'Organizer', dataIndex: 'organizer', key: 'org', width: '20%' },
                { title: 'Peserta', dataIndex: 'peserta', key: 'peserta', width: '12%' },
                {
                  title: 'Rata Jam',
                  dataIndex: 'rataJam',
                  key: 'jam',
                  render: (val: number) => val.toFixed(1),
                  width: '12%',
                },
                {
                  title: 'Durasi (hari)',
                  dataIndex: 'durasi',
                  key: 'durasi',
                  width: '13%',
                },
                {
                  title: 'Efektivitas',
                  key: 'efektif',
                  render: (_, record: any) => {
                    const score = (record.peserta * record.rataJam) / (record.durasi || 1);
                    if (score > 50) return <Tag color="green">Tinggi</Tag>;
                    if (score > 20) return <Tag color="blue">Sedang</Tag>;
                    return <Tag color="orange">Rendah</Tag>;
                  },
                  width: '13%',
                },
              ]}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey={(_, idx) => `prog-${idx}`}
            />,
            'program-detail'
          )}
        </Col>
      </Row>
    </div>
  );
};

export default DashboardKapabilitasRisiko;
