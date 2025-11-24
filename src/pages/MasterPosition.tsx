import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, Descriptions, message, Tag, Alert } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Position {
  jabatanID: number;
  deskripsi: string;
  department: string | null;
  departmentDeskripsi?: string;
  jabatanParentID: number | null;
  isMitra: boolean;
  isOfficer: boolean;
  isManager: boolean;
  isVp: boolean;
  isDirector: boolean;
  isCommissioner: boolean;
  isSecretary: boolean;
  isDriver: boolean;
  isSecurity: boolean;
  isIntern: boolean;
  del: boolean;
}

interface LastSync {
  syncedAt: string;
  syncedBy: string;
  positionsCount: number;
  status: string;
}

const MasterPosition: React.FC = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [lastSync, setLastSync] = useState<LastSync | null>(null);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchPositions();
    fetchLastSync();
  }, []);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/positions`);
      if (response.data.success) {
        setPositions(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      message.error('Gagal memuat data jabatan');
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

  const showDetail = (record: Position) => {
    setSelectedPosition(record);
    setDetailModalVisible(true);
  };

  const BooleanIcon: React.FC<{ value: boolean }> = ({ value }) => (
    value ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CloseOutlined style={{ color: '#ff4d4f' }} />
  );

  const columns: ColumnsType<Position> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Nama Jabatan',
      dataIndex: 'deskripsi',
      key: 'deskripsi',
      sorter: (a, b) => a.deskripsi.localeCompare(b.deskripsi),
      filteredValue: [searchText],
      onFilter: (value, record) => {
        const search = value.toString().toLowerCase();
        return Boolean(
          record.deskripsi.toLowerCase().includes(search) ||
          (record.department && record.department.toLowerCase().includes(search))
        );
      },
    },
    {
      title: 'Departemen',
      dataIndex: 'departmentDeskripsi',
      key: 'departmentDeskripsi',
      render: (departmentDeskripsi) => departmentDeskripsi || '-',
    },
    {
      title: 'Level',
      key: 'level',
      render: (_text, record) => {
        if (record.isCommissioner) return <Tag color="red">Komisaris</Tag>;
        if (record.isDirector) return <Tag color="orange">Direktur</Tag>;
        if (record.isVp) return <Tag color="gold">VP</Tag>;
        if (record.isManager) return <Tag color="blue">Manager</Tag>;
        if (record.isOfficer) return <Tag color="cyan">Officer</Tag>;
        if (record.isMitra) return <Tag color="purple">Mitra</Tag>;
        return <Tag>Staff</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'del',
      key: 'del',
      align: 'center',
      render: (del) => (
        <Tag color={del ? 'red' : 'green'}>
          {del ? 'Nonaktif' : 'Aktif'}
        </Tag>
      ),
      filters: [
        { text: 'Aktif', value: false },
        { text: 'Nonaktif', value: true },
      ],
      onFilter: (value, record) => record.del === value,
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
                Data: {lastSync.positionsCount} jabatan | 
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
            placeholder="Cari jabatan..."
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
        dataSource={positions}
        rowKey="jabatanID"
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
        title="Detail Jabatan"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={700}
      >
        {selectedPosition && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Nama Jabatan" span={2}>
              {selectedPosition.deskripsi}
            </Descriptions.Item>
            <Descriptions.Item label="Departemen" span={2}>
              {selectedPosition.departmentDeskripsi || selectedPosition.department || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Parent ID">
              {selectedPosition.jabatanParentID || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={selectedPosition.del ? 'red' : 'green'}>
                {selectedPosition.del ? 'Nonaktif' : 'Aktif'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mitra">
              <BooleanIcon value={selectedPosition.isMitra} />
            </Descriptions.Item>
            <Descriptions.Item label="Officer">
              <BooleanIcon value={selectedPosition.isOfficer} />
            </Descriptions.Item>
            <Descriptions.Item label="Manager">
              <BooleanIcon value={selectedPosition.isManager} />
            </Descriptions.Item>
            <Descriptions.Item label="VP">
              <BooleanIcon value={selectedPosition.isVp} />
            </Descriptions.Item>
            <Descriptions.Item label="Director">
              <BooleanIcon value={selectedPosition.isDirector} />
            </Descriptions.Item>
            <Descriptions.Item label="Commissioner">
              <BooleanIcon value={selectedPosition.isCommissioner} />
            </Descriptions.Item>
            <Descriptions.Item label="Secretary">
              <BooleanIcon value={selectedPosition.isSecretary} />
            </Descriptions.Item>
            <Descriptions.Item label="Driver">
              <BooleanIcon value={selectedPosition.isDriver} />
            </Descriptions.Item>
            <Descriptions.Item label="Security">
              <BooleanIcon value={selectedPosition.isSecurity} />
            </Descriptions.Item>
            <Descriptions.Item label="Intern">
              <BooleanIcon value={selectedPosition.isIntern} />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default MasterPosition;
