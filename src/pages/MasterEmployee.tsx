import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Descriptions, message, Alert, Tag } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Employee {
  id: string;
  name: string;
  email: string | null;
  userName: string | null;
  nip: string | null;
  department: string | null;
  departmentDeskripsi?: string;
  jabatan: number | null;
  jabatanDeskripsi?: string;
  gcg: boolean;
  gcgAdmin: boolean;
  codeOfConduct: boolean;
  conflictOfInterest: boolean;
  isTkjp: boolean;
  phoneNumber: string | null;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnabled: boolean;
}

interface LastSync {
  syncedAt: string;
  syncedBy: string;
  employeesCount: number;
  status: string;
}

const MasterEmployee: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [lastSync, setLastSync] = useState<LastSync | null>(null);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchEmployees();
    fetchLastSync();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/employees`);
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      message.error('Gagal memuat data pegawai');
    } finally {
      setLoading(false);
    }
  };

  const fetchLastSync = async () => {
    try {
      const response = await axios.get(`${API_URL}/last-sync`, {
        params: { type: 'all' },
      });
      if (response.data.success && response.data.data) {
        setLastSync(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching last sync:', error);
    }
  };

  const showDetail = (record: Employee) => {
    setSelectedEmployee(record);
    setDetailModalVisible(true);
  };

  const BooleanIcon: React.FC<{ value: boolean }> = ({ value }) => (
    value ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CloseOutlined style={{ color: '#ff4d4f' }} />
  );

  const columns: ColumnsType<Employee> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'NIP',
      dataIndex: 'nip',
      key: 'nip',
      render: (nip) => nip || '-',
      sorter: (a, b) => (a.nip || '').localeCompare(b.nip || ''),
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toString().toLowerCase();
        return Boolean(
          record.name.toLowerCase().includes(search) ||
          (record.nip && record.nip.toLowerCase().includes(search)) ||
          (record.email && record.email.toLowerCase().includes(search)) ||
          (record.department && record.department.toLowerCase().includes(search))
        );
      },
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-',
      ellipsis: true,
    },
    {
      title: 'Departemen',
      dataIndex: 'departmentDeskripsi',
      key: 'departmentDeskripsi',
      render: (departmentDeskripsi) => departmentDeskripsi || '-',
    },
    {
      title: 'Jabatan',
      dataIndex: 'jabatanDeskripsi',
      key: 'jabatanDeskripsi',
      render: (jabatanDeskripsi) => jabatanDeskripsi || '-',
      ellipsis: true,
    },
    {
      title: 'GCG',
      dataIndex: 'gcg',
      key: 'gcg',
      align: 'center',
      render: (gcg) => <BooleanIcon value={gcg} />,
      filters: [
        { text: 'Ya', value: true },
        { text: 'Tidak', value: false },
      ],
      onFilter: (value, record) => record.gcg === value,
    },
    {
      title: 'TKJP',
      dataIndex: 'isTkjp',
      key: 'isTkjp',
      align: 'center',
      render: (isTkjp) => <BooleanIcon value={isTkjp} />,
      filters: [
        { text: 'Ya', value: true },
        { text: 'Tidak', value: false },
      ],
      onFilter: (value, record) => record.isTkjp === value,
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_text, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => showDetail(record)}
        >
          Detail
        </Button>
      ),
    },
  ];

  return (
    <div>
      {lastSync && (
        <Alert
          message="Informasi Sinkronisasi Terakhir"
          description={
            <div>
              <p style={{ margin: 0 }}>
                <ClockCircleOutlined /> Waktu: {new Date(lastSync.syncedAt).toLocaleString('id-ID')} | 
                Oleh: {lastSync.syncedBy} | 
                Data: {lastSync.employeesCount} pegawai | 
                Status: <Tag color={lastSync.status === 'success' ? 'success' : 'error'}>
                  {lastSync.status === 'success' ? 'Berhasil' : 'Gagal'}
                </Tag>
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                Untuk sinkronisasi data terbaru, silakan ke halaman <strong>Settings → Sinkronisasi Data Master</strong>
              </p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Input
            placeholder="Cari pegawai..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        size="small"
        pagination={{
          pageSize: pageSize,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} data`,
          pageSizeOptions: ['10', '20', '50', '100'],
          onShowSizeChange: (_current, size) => setPageSize(size),
        }}
        bordered
        scroll={{ x: 1200 }}
      />

      <Modal
        title="Detail Pegawai"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {selectedEmployee && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={2}>
              {selectedEmployee.id}
            </Descriptions.Item>
            <Descriptions.Item label="NIP">
              {selectedEmployee.nip || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {selectedEmployee.userName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Lengkap" span={2}>
              {selectedEmployee.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={2}>
              {selectedEmployee.email || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="No. Telepon" span={2}>
              {selectedEmployee.phoneNumber || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Departemen" span={2}>
              {selectedEmployee.departmentDeskripsi || selectedEmployee.department || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Jabatan" span={2}>
              {selectedEmployee.jabatanDeskripsi || selectedEmployee.jabatan || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="GCG">
              <BooleanIcon value={selectedEmployee.gcg} />
            </Descriptions.Item>
            <Descriptions.Item label="GCG Admin">
              <BooleanIcon value={selectedEmployee.gcgAdmin} />
            </Descriptions.Item>
            <Descriptions.Item label="Code of Conduct">
              <BooleanIcon value={selectedEmployee.codeOfConduct} />
            </Descriptions.Item>
            <Descriptions.Item label="Conflict of Interest">
              <BooleanIcon value={selectedEmployee.conflictOfInterest} />
            </Descriptions.Item>
            <Descriptions.Item label="TKJP">
              <BooleanIcon value={selectedEmployee.isTkjp} />
            </Descriptions.Item>
            <Descriptions.Item label="Email Confirmed">
              <BooleanIcon value={selectedEmployee.emailConfirmed} />
            </Descriptions.Item>
            <Descriptions.Item label="Phone Confirmed">
              <BooleanIcon value={selectedEmployee.phoneNumberConfirmed} />
            </Descriptions.Item>
            <Descriptions.Item label="Two Factor">
              <BooleanIcon value={selectedEmployee.twoFactorEnabled} />
            </Descriptions.Item>
            <Descriptions.Item label="Lockout Enabled">
              <BooleanIcon value={selectedEmployee.lockoutEnabled} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MasterEmployee;
