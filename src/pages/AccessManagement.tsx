import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Checkbox, message, Tag, Space, Tabs, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import api from '../services/api';

interface Role {
  id: number;
  roleName: string;
  permissions: string[] | string; // Can be array or JSON string
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  jabatan: string;
}

interface UserRole {
  id: number;
  employeeId: string;
  roleId: number;
  Employee: Employee;
  Role: Role;
  createdAt: string;
}

const AccessManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUserRole, setEditingUserRole] = useState<UserRole | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const menuOptions = [
    { label: 'Home / Beranda', value: 'dashboard' },
    { label: 'Dashboard - Tata Kelola Perusahaan', value: 'dashboard-tata-kelola' },
    { label: 'Dashboard - Kapabilitas Risiko', value: 'dashboard-kapabilitas-risiko' },
    { label: 'Dashboard - Budaya', value: 'dashboard-budaya' },
    { label: 'Master Data - Departemen', value: 'master-data-departments' },
    { label: 'Master Data - Jabatan', value: 'master-data-positions' },
    { label: 'Master Data - Pegawai', value: 'master-data-employees' },
    { label: 'Pencapaian', value: 'achievements' },
    { label: 'Pengaturan Aplikasi', value: 'settings-app' },
    { label: 'Hak Akses', value: 'settings-access' },
    { label: 'Target Sertifikasi & Learning Hours', value: 'settings-targets' },
    { label: 'Reports', value: 'reports' },
  ];

  useEffect(() => {
    fetchRoles();
    fetchEmployees();
    fetchUserRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/roles');
      if (response.data.success) {
        setRoles(response.data.data);
      }
    } catch (error) {
      message.error('Gagal memuat data role');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await api.get('/user-roles');
      if (response.data.success) {
        setUserRoles(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user-roles:', error);
    }
  };

  const roleColumns: ColumnsType<Role> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Nama Role',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
    },
    {
      title: 'Hak Akses Menu',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[] | string) => {
        let permArray: string[] = [];
        
        // Handle different types of permissions data
        if (Array.isArray(permissions)) {
          permArray = permissions;
        } else if (typeof permissions === 'string') {
          try {
            // Try to parse if it's a JSON string
            permArray = JSON.parse(permissions);
          } catch {
            // If parsing fails, treat as single permission
            permArray = [permissions];
          }
        }
        
        return (
          <Space wrap>
            {permArray.map((perm) => {
              const menu = menuOptions.find((m) => m.value === perm);
              return menu ? <Tag key={perm}>{menu.label}</Tag> : null;
            })}
          </Space>
        );
      },
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_text, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Role"
            description="Apakah Anda yakin ingin menghapus role ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const userRoleColumns: ColumnsType<UserRole> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Nama Pegawai',
      dataIndex: ['Employee', 'name'],
      key: 'employeeName',
    },
    {
      title: 'Email',
      dataIndex: ['Employee', 'email'],
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: ['Role', 'roleName'],
      key: 'roleName',
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Tanggal Ditambahkan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_text, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditUserRole(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Hapus Hak Akses"
            description="Apakah Anda yakin ingin menghapus hak akses ini?"
            onConfirm={() => handleRemoveUserRole(record.id)}
            okText="Hapus"
            cancelText="Batal"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Hapus
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    form.setFieldsValue({
      permissions: [], // Empty array for Checkbox.Group, 'dashboard' will be added on submit
    });
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    
    let permArray: string[] = [];
    
    // Parse permissions safely
    if (Array.isArray(role.permissions)) {
      permArray = role.permissions;
    } else if (typeof role.permissions === 'string') {
      try {
        permArray = JSON.parse(role.permissions);
      } catch {
        permArray = [role.permissions];
      }
    }
    
    // Remove 'dashboard' from permissions for the form (since it's always checked)
    const permissionsWithoutDashboard = permArray.filter(p => p !== 'dashboard');
      
    form.setFieldsValue({
      roleName: role.roleName,
      description: role.description,
      permissions: permissionsWithoutDashboard, // Set only the checkable permissions
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await api.delete(`/roles/${id}`);
      if (response.data.success) {
        message.success('Role berhasil dihapus');
        fetchRoles();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menghapus role');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('Form values:', values); // Debug log
      
      // Get permissions from form (without 'dashboard')
      let permArray: string[] = [];
      
      if (Array.isArray(values.permissions)) {
        permArray = values.permissions;
      } else if (values.permissions) {
        // Handle string case
        if (typeof values.permissions === 'string') {
          try {
            permArray = JSON.parse(values.permissions);
          } catch {
            permArray = [values.permissions];
          }
        }
      }
      
      // Always add 'dashboard' at the beginning
      const finalPermissions = ['dashboard', ...permArray];

      console.log('Final permissions:', finalPermissions); // Debug log

      if (editingRole) {
        // Update existing role
        const response = await api.put(`/roles/${editingRole.id}`, {
          roleName: values.roleName,
          description: values.description,
          permissions: finalPermissions,
        });
        if (response.data.success) {
          message.success('Role berhasil diupdate');
          fetchRoles();
        }
      } else {
        // Add new role
        const response = await api.post('/roles', {
          roleName: values.roleName,
          description: values.description,
          permissions: finalPermissions,
        });
        if (response.data.success) {
          message.success('Role berhasil ditambahkan');
          fetchRoles();
        }
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menyimpan role');
    }
  };

  const handleAssignRole = () => {
    setEditingUserRole(null);
    assignForm.resetFields();
    setAssignModalVisible(true);
  };

  const handleEditUserRole = (userRole: UserRole) => {
    setEditingUserRole(userRole);
    assignForm.setFieldsValue({
      employeeId: userRole.employeeId,
      roleId: userRole.roleId,
    });
    setAssignModalVisible(true);
  };

  const handleSubmitAssignment = async (values: any) => {
    try {
      if (editingUserRole) {
        // Update existing user role
        const response = await api.put(`/user-roles/${editingUserRole.id}`, {
          employeeId: values.employeeId,
          roleId: values.roleId,
        });
        if (response.data.success) {
          message.success('Hak akses berhasil diupdate');
          fetchUserRoles();
          setAssignModalVisible(false);
          setEditingUserRole(null);
          assignForm.resetFields();
        }
      } else {
        // Create new user role
        const response = await api.post('/user-roles', {
          employeeId: values.employeeId,
          roleId: values.roleId,
        });
        if (response.data.success) {
          message.success('Role berhasil diberikan ke pegawai');
          fetchUserRoles();
          setAssignModalVisible(false);
          assignForm.resetFields();
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || `Gagal ${editingUserRole ? 'mengupdate' : 'memberikan'} role`);
    }
  };

  const handleRemoveUserRole = async (id: number) => {
    try {
      const response = await api.delete(`/user-roles/${id}`);
      if (response.data.success) {
        message.success('Hak akses berhasil dihapus');
        fetchUserRoles();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menghapus hak akses');
    }
  };

  return (
    <div>
      <Card>
        <Tabs
          defaultActiveKey="roles"
          items={[
            {
              key: 'roles',
              label: 'Daftar Role',
              children: (
                <>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, color: '#666' }}>
                      Kelola hak akses user berdasarkan role. Tentukan menu mana saja yang dapat diakses oleh setiap role.
                    </p>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                      Tambah Role
                    </Button>
                  </div>

                  <Table
                    columns={roleColumns}
                    dataSource={roles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} role`,
                    }}
                    bordered
                  />
                </>
              ),
            },
            {
              key: 'assignments',
              label: 'Pemberian Hak Akses',
              children: (
                <>
                  <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, color: '#666' }}>
                      Kelola pemberian hak akses kepada pegawai. Pilih pegawai dan role yang akan diberikan.
                    </p>
                    <Button type="primary" icon={<UserAddOutlined />} onClick={handleAssignRole}>
                      Berikan Hak Akses
                    </Button>
                  </div>

                  <Table
                    columns={userRoleColumns}
                    dataSource={userRoles}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 10,
                      showSizeChanger: true,
                      showTotal: (total) => `Total ${total} pemberian hak akses`,
                    }}
                    bordered
                  />
                </>
              ),
            },
          ]}
        />
      </Card>

      {/* Modal for Role CRUD */}
      <Modal
        title={editingRole ? 'Edit Role' : 'Tambah Role Baru'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        okText="Simpan"
        cancelText="Batal"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Nama Role"
            name="roleName"
            rules={[{ required: true, message: 'Nama role wajib diisi' }]}
          >
            <Input placeholder="Contoh: Administrator, Manager, User" />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
          >
            <Input.TextArea 
              placeholder="Deskripsi singkat tentang role ini"
              rows={3}
            />
          </Form.Item>

          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>Hak Akses Menu</div>
            {/* Home/Beranda - Always checked and disabled */}
            <div style={{ marginBottom: 8 }}>
              <Checkbox checked disabled>
                Home / Beranda
              </Checkbox>
            </div>
          </div>

          <Form.Item
            name="permissions"
            rules={[{ required: false }]}
            style={{ marginTop: 0 }}
          >
            <Checkbox.Group
              options={menuOptions.slice(1)} // Skip first item (dashboard)
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for User-Role Assignment */}
      <Modal
        title={editingUserRole ? 'Edit Hak Akses' : 'Berikan Hak Akses'}
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setEditingUserRole(null);
          assignForm.resetFields();
        }}
        onOk={() => assignForm.submit()}
        okText="Simpan"
        cancelText="Batal"
        width={500}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleSubmitAssignment}
        >
          <Form.Item
            label="Pilih Pegawai"
            name="employeeId"
            rules={[{ required: true, message: 'Pegawai wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih pegawai"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map(emp => ({
                label: `${emp.name} (${emp.email})`,
                value: emp.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Pilih Role"
            name="roleId"
            rules={[{ required: true, message: 'Role wajib dipilih' }]}
          >
            <Select
              placeholder="Pilih role"
              options={roles.map(role => ({
                label: role.roleName,
                value: role.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccessManagement;
