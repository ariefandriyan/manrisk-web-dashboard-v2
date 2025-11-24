import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Descriptions, message, Tag, Alert } from 'antd';
import { SearchOutlined, EyeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Department {
  departmentID: string;
  deskripsi: string;
  induk: string | null;
  isDepartment: string;
}

interface LastSync {
  syncedAt: string;
  syncedBy: string;
  departmentsCount: number;
  status: string;
}

const MasterDepartment: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [lastSync, setLastSync] = useState<LastSync | null>(null);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchDepartments();
    fetchLastSync();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/departments`);
      if (response.data.success) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
      message.error('Gagal memuat data departemen');
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

  const showDetail = (record: Department) => {
    setSelectedDepartment(record);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<Department> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Kode Departemen',
      dataIndex: 'departmentID',
      key: 'departmentID',
      sorter: (a, b) => a.departmentID.localeCompare(b.departmentID),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toString().toLowerCase();
        return Boolean(
          record.departmentID.toLowerCase().includes(search) ||
          record.deskripsi.toLowerCase().includes(search) ||
          (record.induk && record.induk.toLowerCase().includes(search))
        );
      },
    },
    {
      title: 'Nama Departemen',
      dataIndex: 'deskripsi',
      key: 'deskripsi',
      sorter: (a, b) => a.deskripsi.localeCompare(b.deskripsi),
    },
    {
      title: 'Induk',
      dataIndex: 'induk',
      key: 'induk',
      render: (induk) => induk || '-',
    },
    {
      title: 'Status',
      dataIndex: 'isDepartment',
      key: 'isDepartment',
      align: 'center',
      render: (isDepartment) => (
        <Tag color={isDepartment === 'Y' ? 'green' : 'default'}>
          {isDepartment === 'Y' ? 'Departemen' : 'Unit'}
        </Tag>
      ),
      filters: [
        { text: 'Departemen', value: 'Y' },
        { text: 'Unit', value: 'N' },
      ],
      onFilter: (value, record) => record.isDepartment === value,
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
                Data: {lastSync.departmentsCount} departemen | 
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
            placeholder="Cari departemen..."
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
        dataSource={departments}
        rowKey="departmentID"
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
      />

      <Modal
        title="Detail Departemen"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={600}
      >
        {selectedDepartment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Kode Departemen">
              {selectedDepartment.departmentID}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Departemen">
              {selectedDepartment.deskripsi}
            </Descriptions.Item>
            <Descriptions.Item label="Induk">
              {selectedDepartment.induk || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedDepartment.isDepartment === 'Y' ? 'green' : 'default'}>
                {selectedDepartment.isDepartment === 'Y' ? 'Departemen' : 'Unit'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MasterDepartment;
