import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Department {
  departmentID: string;
  deskripsi: string;
  induk: string | null;
  isDepartment: string;
}

interface Target {
  id: number;
  departmentId: string;
  year: number;
  certificationTarget: number;
  learningHoursTarget: number;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

const TargetSettings: React.FC = () => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Fetch targets
  const fetchTargets = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/targets`);
      if (response.data.success) {
        setTargets(response.data.data);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal memuat data target');
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_URL}/departments`);
      if (response.data.success) {
        // Filter only departments (isDepartment === 'Y')
        const depts = response.data.data.filter((d: Department) => d.isDepartment === 'Y');
        setDepartments(depts);
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal memuat data departemen');
    }
  };

  useEffect(() => {
    fetchTargets();
    fetchDepartments();
  }, []);

  // Handle add/edit modal
  const showModal = (record?: Target) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        departmentIds: [record.departmentId], // Single value for edit
        year: record.year,
        certificationTarget: record.certificationTarget,
        learningHoursTarget: record.learningHoursTarget,
      });
    } else {
      setEditingId(null);
      form.setFieldsValue({
        departmentIds: [], // Empty array for add
        year: new Date().getFullYear(),
        certificationTarget: 1,
        learningHoursTarget: 1,
      });
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingId(null);
    form.resetFields();
  };

  // Handle submit (create or update)
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      if (editingId) {
        // Update - single department
        const response = await axios.put(
          `${API_URL}/targets/${editingId}`,
          {
            departmentId: values.departmentIds[0],
            year: values.year,
            certificationTarget: values.certificationTarget,
            learningHoursTarget: values.learningHoursTarget,
          }
        );
        if (response.data.success) {
          message.success(response.data.message || 'Target berhasil diupdate');
          fetchTargets();
          handleCancel();
        }
      } else {
        // Create - multiple departments
        const { departmentIds, year, certificationTarget, learningHoursTarget } = values;
        
        // Check for existing targets and separate into create/update
        const results = {
          created: 0,
          updated: 0,
          failed: 0,
        };

        for (const deptId of departmentIds) {
          try {
            // Check if target already exists for this department and year
            const existing = targets.find(
              (t) => t.departmentId === deptId && t.year === year
            );

            if (existing) {
              // Update existing target
              await axios.put(`${API_URL}/targets/${existing.id}`, {
                departmentId: deptId,
                year,
                certificationTarget,
                learningHoursTarget,
              });
              results.updated++;
            } else {
              // Create new target
              await axios.post(`${API_URL}/targets`, {
                departmentId: deptId,
                year,
                certificationTarget,
                learningHoursTarget,
              });
              results.created++;
            }
          } catch (error) {
            console.error(`Failed for department ${deptId}:`, error);
            results.failed++;
          }
        }

        // Show summary message
        const messages = [];
        if (results.created > 0) messages.push(`${results.created} target dibuat`);
        if (results.updated > 0) messages.push(`${results.updated} target diupdate`);
        if (results.failed > 0) messages.push(`${results.failed} gagal`);

        if (results.failed === 0) {
          message.success(`Berhasil: ${messages.join(', ')}`);
        } else {
          message.warning(`Selesai: ${messages.join(', ')}`);
        }

        fetchTargets();
        handleCancel();
      }
    } catch (error: any) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Gagal menyimpan data target');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/targets/${id}`);
      if (response.data.success) {
        message.success(response.data.message || 'Target berhasil dihapus');
        fetchTargets();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menghapus target');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Departemen',
      dataIndex: ['department', 'deskripsi'],
      width: 200,
      key: 'department',
      sorter: (a: Target, b: Target) =>
        a.department.deskripsi.localeCompare(b.department.deskripsi),
    },
    {
      title: 'Tahun',
      dataIndex: 'year',
      key: 'year',
      width: 120,
      sorter: (a: Target, b: Target) => a.year - b.year,
    },
    {
      title: 'Target Sertifikasi',
      dataIndex: 'certificationTarget',
      key: 'certificationTarget',
      width: 180,
      render: (value: number) => value.toLocaleString('id-ID'),
    },
    {
      title: 'Target Learning Hours',
      dataIndex: 'learningHoursTarget',
      key: 'learningHoursTarget',
      width: 200,
      render: (value: number) => `${value.toLocaleString('id-ID')} jam`,
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Target) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus target ini?"
            description="Data yang sudah dihapus tidak dapat dikembalikan."
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="Target Sertifikasi & Learning Hours"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Tambah Target
          </Button>
        }
      >
        <Table
          dataSource={targets}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} target`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingId ? 'Edit Target' : 'Tambah Target'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText="Simpan"
        cancelText="Batal"
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            year: new Date().getFullYear(),
            certificationTarget: 1,
            learningHoursTarget: 1,
          }}
        >
          <Form.Item
            name="departmentIds"
            label="Departemen"
            rules={[{ required: true, message: 'Pilih minimal 1 departemen' }]}
            tooltip={editingId ? 'Mode edit hanya bisa 1 departemen' : 'Bisa pilih banyak departemen sekaligus'}
          >
            <Select
              mode={editingId ? undefined : 'multiple'}
              placeholder={editingId ? 'Pilih departemen' : 'Pilih satu atau lebih departemen'}
              showSearch
              optionFilterProp="label"
              maxTagCount="responsive"
              disabled={editingId ? false : false}
              options={departments.map((dept) => ({
                label: dept.deskripsi,
                value: dept.departmentID,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="year"
            label="Tahun"
            rules={[
              { required: true, message: 'Masukkan tahun' },
              {
                type: 'number',
                min: 2000,
                max: 2100,
                message: 'Tahun harus antara 2000-2100',
              },
            ]}
          >
            <InputNumber
              placeholder="2024"
              min={2000}
              max={2100}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="certificationTarget"
            label="Target Sertifikasi"
            rules={[
              { required: true, message: 'Masukkan target sertifikasi' },
              {
                type: 'number',
                min: 1,
                message: 'Target harus minimal 1',
              },
            ]}
          >
            <InputNumber
              placeholder="Contoh: 10"
              min={1}
              addonAfter="sertifikat"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="learningHoursTarget"
            label="Target Learning Hours"
            rules={[
              { required: true, message: 'Masukkan target learning hours' },
              {
                type: 'number',
                min: 1,
                message: 'Target harus minimal 1',
              },
            ]}
          >
            <InputNumber
              placeholder="Contoh: 40"
              min={1}
              addonAfter="jam"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TargetSettings;
