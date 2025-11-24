import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Space, Divider, Table, Tag, Progress, Modal, Descriptions } from 'antd';
import { SaveOutlined, ApiOutlined, SyncOutlined, HistoryOutlined } from '@ant-design/icons';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ApiConfig {
  baseUrl: string;
  username: string;
  password: string;
}

interface SyncLog {
  id: number;
  syncType: string;
  status: string;
  syncedBy: string;
  sourceIp: string | null;
  departmentsCount: number | null;
  positionsCount: number | null;
  employeesCount: number | null;
  errorMessage: string | null;
  syncedAt: string;
}

interface SyncProgress {
  step: number;
  total: number;
  message: string;
  percent: number;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Load sync logs on mount
  useEffect(() => {
    fetchSyncLogs(1, 10);
  }, []);

  const fetchSyncLogs = async (page: number, pageSize: number) => {
    try {
      setLogsLoading(true);
      const response = await axios.get(`${API_URL}/sync-logs`, {
        params: { page, pageSize },
      });
      
      if (response.data.success) {
        setLogs(response.data.data);
        setPagination({
          current: response.data.pagination.page,
          pageSize: response.data.pagination.pageSize,
          total: response.data.pagination.total,
        });
      }
    } catch (error) {
      console.error('Error fetching sync logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setSyncing(true);
      setSyncProgress({ step: 0, total: 3, message: 'Memulai sinkronisasi...', percent: 0 });
      
      // Get username from localStorage or use default
      const syncedBy = localStorage.getItem('username') || 'Admin';
      
      message.loading({ content: 'Sinkronisasi data dimulai...', key: 'sync', duration: 0 });
      
      // Update progress for each step
      setSyncProgress({ step: 1, total: 3, message: 'Sinkronisasi Departemen...', percent: 33 });
      
      const response = await axios.post(`${API_URL}/sync-all`, { syncedBy });
      
      setSyncProgress({ step: 3, total: 3, message: 'Selesai!', percent: 100 });
      
      if (response.data.success) {
        const { departmentsCount, positionsCount, employeesCount } = response.data.data;
        message.success({ 
          content: `Sinkronisasi berhasil! Departments: ${departmentsCount}, Positions: ${positionsCount}, Employees: ${employeesCount}`, 
          key: 'sync',
          duration: 5,
        });
        
        // Refresh logs
        fetchSyncLogs(1, 10);
      } else {
        message.error({ content: response.data.message, key: 'sync' });
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      message.error({ 
        content: error.response?.data?.message || error.message || 'Sinkronisasi gagal', 
        key: 'sync' 
      });
    } finally {
      setSyncing(false);
      setSyncProgress(null);
    }
  };

  // Load initial values from environment
  const initialValues: ApiConfig = {
    baseUrl: import.meta.env.VITE_EXTERNAL_API_BASE_URL || 'https://nusantararegas.com/auth-v1-dev/api',
    username: import.meta.env.VITE_EXTERNAL_API_USERNAME || 'admin',
    password: import.meta.env.VITE_EXTERNAL_API_PASSWORD || '',
  };

  const handleSave = async (values: ApiConfig) => {
    try {
      setSaving(true);
      
      // Save to localStorage
      localStorage.setItem('api_config', JSON.stringify(values));
      
      message.success('Konfigurasi berhasil disimpan!');
      
      // Note: Perlu reload untuk menggunakan konfigurasi baru
      message.info('Silakan reload halaman untuk menerapkan konfigurasi baru', 3);
    } catch (error) {
      console.error('Save error:', error);
      message.error('Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      message.loading({ content: 'Testing koneksi...', key: 'test' });
      
      const response = await axios.post(`${API_URL}/test-external-api`);
      
      if (response.data.success) {
        message.success({ content: 'Koneksi berhasil!', key: 'test' });
      } else {
        message.error({ content: response.data.message, key: 'test' });
      }
    } catch (error: any) {
      message.error({ 
        content: error.response?.data?.message || error.message || 'Koneksi gagal', 
        key: 'test' 
      });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(initialValues);
    message.info('Form direset ke nilai default');
  };

  return (
    <div>
      <Card title="Sinkronisasi Data Master" bordered={false} style={{ marginBottom: 24 }}>
        <p style={{ marginBottom: 16, color: '#666' }}>
          Sinkronisasi semua data master (Departemen → Jabatan → Pegawai) dari API eksternal secara berurutan.
        </p>
        
        {syncProgress && (
          <div style={{ marginBottom: 16 }}>
            <Progress percent={syncProgress.percent} status="active" />
            <p style={{ marginTop: 8, color: '#666' }}>
              {syncProgress.message} (Tahap {syncProgress.step} dari {syncProgress.total})
            </p>
          </div>
        )}
        
        <Button
          type="primary"
          size="large"
          icon={<SyncOutlined spin={syncing} />}
          onClick={handleSyncAll}
          loading={syncing}
          disabled={syncing}
        >
          Sinkronisasi Semua Data
        </Button>

        <Divider />

        <div>
          <h4 style={{ marginBottom: 16 }}>
            <HistoryOutlined /> Riwayat Sinkronisasi
          </h4>
          <Table
            dataSource={logs}
            loading={logsLoading}
            rowKey="id"
            pagination={{
              ...pagination,
              onChange: (page, pageSize) => fetchSyncLogs(page, pageSize || 10),
            }}
            columns={[
              {
                title: 'Waktu',
                dataIndex: 'syncedAt',
                key: 'syncedAt',
                render: (text: string) => new Date(text).toLocaleString('id-ID'),
                width: 180,
              },
              {
                title: 'Tipe',
                dataIndex: 'syncType',
                key: 'syncType',
                render: (text: string) => {
                  const typeMap: Record<string, string> = {
                    all: 'Semua Data',
                    departments: 'Departemen',
                    positions: 'Jabatan',
                    employees: 'Pegawai',
                  };
                  return typeMap[text] || text;
                },
                width: 120,
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const config: Record<string, { color: string; text: string }> = {
                    success: { color: 'success', text: 'Berhasil' },
                    failed: { color: 'error', text: 'Gagal' },
                    partial: { color: 'warning', text: 'Sebagian' },
                  };
                  return <Tag color={config[status]?.color}>{config[status]?.text || status}</Tag>;
                },
                width: 100,
              },
              {
                title: 'Departemen',
                dataIndex: 'departmentsCount',
                key: 'departmentsCount',
                align: 'right',
                width: 100,
              },
              {
                title: 'Jabatan',
                dataIndex: 'positionsCount',
                key: 'positionsCount',
                align: 'right',
                width: 100,
              },
              {
                title: 'Pegawai',
                dataIndex: 'employeesCount',
                key: 'employeesCount',
                align: 'right',
                width: 100,
              },
              {
                title: 'Oleh',
                dataIndex: 'syncedBy',
                key: 'syncedBy',
                width: 120,
              },
              {
                title: 'IP Address',
                dataIndex: 'sourceIp',
                key: 'sourceIp',
                width: 140,
              },
              {
                title: 'Detail',
                key: 'action',
                width: 80,
                render: (_: any, record: SyncLog) => (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      Modal.info({
                        title: 'Detail Sinkronisasi',
                        width: 600,
                        content: (
                          <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Waktu">
                              {new Date(record.syncedAt).toLocaleString('id-ID')}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tipe">{record.syncType}</Descriptions.Item>
                            <Descriptions.Item label="Status">{record.status}</Descriptions.Item>
                            <Descriptions.Item label="Oleh">{record.syncedBy}</Descriptions.Item>
                            <Descriptions.Item label="IP Address">{record.sourceIp}</Descriptions.Item>
                            <Descriptions.Item label="Departemen">{record.departmentsCount || 0}</Descriptions.Item>
                            <Descriptions.Item label="Jabatan">{record.positionsCount || 0}</Descriptions.Item>
                            <Descriptions.Item label="Pegawai">{record.employeesCount || 0}</Descriptions.Item>
                            {record.errorMessage && (
                              <Descriptions.Item label="Error">
                                <span style={{ color: 'red' }}>{record.errorMessage}</span>
                              </Descriptions.Item>
                            )}
                          </Descriptions>
                        ),
                      });
                    }}
                  >
                    Lihat
                  </Button>
                ),
              },
            ]}
          />
        </div>
      </Card>

      <Card title="Pengaturan API Eksternal" bordered={false}>
        <p style={{ marginBottom: 24, color: '#666' }}>
          Konfigurasi endpoint API eksternal untuk sinkronisasi data Master Data.
          Perubahan akan diterapkan setelah reload halaman.
        </p>

        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSave}
        >
          <Form.Item
            label="Base URL"
            name="baseUrl"
            rules={[
              { required: true, message: 'Base URL wajib diisi' },
              { type: 'url', message: 'Format URL tidak valid' },
            ]}
          >
            <Input
              placeholder="https://nusantararegas.com/auth-v1-dev/api"
              prefix={<ApiOutlined />}
            />
          </Form.Item>

          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Username wajib diisi' }]}
          >
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Password wajib diisi' }]}
          >
            <Input.Password placeholder="Masukkan password" />
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saving}
              >
                Simpan Konfigurasi
              </Button>
              <Button onClick={handleTestConnection} loading={testing}>
                Test Koneksi
              </Button>
              <Button onClick={handleReset}>
                Reset
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ marginTop: 24 }}>
          <h4>Informasi Endpoint</h4>
          <ul style={{ color: '#666', lineHeight: 2 }}>
            <li><strong>Departemen:</strong> GET /Department</li>
            <li><strong>Jabatan:</strong> GET /Jabatan</li>
            <li><strong>Pegawai:</strong> GET /User</li>
            <li><strong>Auth:</strong> POST /User/SecureAuth</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default Settings;
