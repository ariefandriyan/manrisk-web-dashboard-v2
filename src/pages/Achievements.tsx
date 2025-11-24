import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Tag,
  Space,
  Popconfirm,
  Upload,
  Spin,
  Typography,
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TrophyOutlined,
  DownloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import api from '../services/api';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

interface Employee {
  id: string;
  name: string;
  email: string;
  jabatan: string | null;
  department: string;
}

interface Achievement {
  id: string;
  topic: string;
  type: number; // 1=Pelatihan (LH), 2=Sertifikat (CERT)
  validUntil: string | null;
  value: number;
  organizer: string;
  employeeId: string;
  dateStart: string;
  dateEnd: string;
  createdAt: string;
  updatedAt: string;
  employee: Employee;
}

// Pertamina Colors
const achievementTypes = {
  1: { label: 'Pelatihan (LH)', color: '#006cb8' }, // Pertamina Blue
  2: { label: 'Sertifikat (CERT)', color: '#acc42a' }, // Pertamina Green
};

interface ImportProgress {
  status: 'reading' | 'validating' | 'uploading' | 'success' | 'error';
  totalRows: number;
  validRows: number;
  errorRows: number;
  errors: string[];
  successMessage?: string;
}

const Achievements: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    status: 'reading',
    totalRows: 0,
    validRows: 0,
    errorRows: 0,
    errors: [],
  });
  const [form] = Form.useForm();

  useEffect(() => {
    fetchAchievements();
    fetchEmployees();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/achievements');
      if (response.data.success) {
        setAchievements(response.data.data);
      }
    } catch (error) {
      message.error('Gagal memuat data pencapaian');
      console.error('Error fetching achievements:', error);
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

  const columns: ColumnsType<Achievement> = [
    {
      title: 'No',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_text, _record, index) => index + 1,
    },
    {
      title: 'Pegawai',
      dataIndex: ['employee', 'name'],
      key: 'employeeName',
      render: (_text, record) => record.employee?.name || '-',
      sorter: (a, b) => (a.employee?.name || '').localeCompare(b.employee?.name || ''),
    },
    {
      title: 'Topik Pencapaian',
      dataIndex: 'topic',
      key: 'topic',
      sorter: (a, b) => a.topic.localeCompare(b.topic),
    },
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: number) => {
        const typeInfo = achievementTypes[type as 1 | 2];
        return <Tag color={typeInfo.color}>{typeInfo.label}</Tag>;
      },
      filters: [
        { text: 'Pelatihan (LH)', value: 1 },
        { text: 'Sertifikat (CERT)', value: 2 },
      ],
      onFilter: (value, record) => record.type === value,
    },
    {
      title: 'Jumlah Jam (Jam)',
      dataIndex: 'value',
      key: 'value',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: 'Penyelenggara',
      dataIndex: 'organizer',
      key: 'organizer',
    },
    {
      title: 'Tanggal Mulai',
      dataIndex: 'dateStart',
      key: 'dateStart',
      width: 120,
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
      sorter: (a, b) => dayjs(a.dateStart).unix() - dayjs(b.dateStart).unix(),
    },
    {
      title: 'Tanggal Selesai',
      dataIndex: 'dateEnd',
      key: 'dateEnd',
      width: 120,
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Berlaku Hingga',
      dataIndex: 'validUntil',
      key: 'validUntil',
      width: 120,
      render: (date: string | null) => date ? dayjs(date).format('DD MMM YYYY') : '-',
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 100,
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
            title="Hapus Pencapaian"
            description="Apakah Anda yakin ingin menghapus data ini?"
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

  const handleAdd = () => {
    setEditingAchievement(null);
    setSelectedType(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setSelectedType(achievement.type);
    form.setFieldsValue({
      employeeId: achievement.employeeId,
      topic: achievement.topic,
      type: achievement.type,
      value: achievement.value,
      organizer: achievement.organizer,
      dateStart: achievement.dateStart ? dayjs(achievement.dateStart) : null,
      dateEnd: achievement.dateEnd ? dayjs(achievement.dateEnd) : null,
      validUntil: achievement.validUntil ? dayjs(achievement.validUntil) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await api.delete(`/achievements/${id}`);
      if (response.data.success) {
        message.success('Pencapaian berhasil dihapus');
        fetchAchievements();
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menghapus pencapaian');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        employeeId: values.employeeId,
        topic: values.topic,
        type: values.type,
        value: values.value,
        organizer: values.organizer,
        dateStart: values.dateStart.format('YYYY-MM-DD'),
        dateEnd: values.dateEnd.format('YYYY-MM-DD'),
        validUntil: values.validUntil ? values.validUntil.format('YYYY-MM-DD') : null,
      };

      if (editingAchievement) {
        // Update existing achievement
        const response = await api.put(`/achievements/${editingAchievement.id}`, payload);
        if (response.data.success) {
          message.success('Pencapaian berhasil diupdate');
          fetchAchievements();
        }
      } else {
        // Add new achievement
        const response = await api.post('/achievements', payload);
        if (response.data.success) {
          message.success('Pencapaian berhasil ditambahkan');
          fetchAchievements();
        }
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Gagal menyimpan pencapaian');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Create workbook and worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Template');

      // Define columns
      worksheet.columns = [
        { header: 'Email Pegawai', key: 'email', width: 25 },
        { header: 'Topik Pencapaian', key: 'topic', width: 35 },
        { header: 'Tipe (1=Pelatihan, 2=Sertifikat)', key: 'type', width: 30 },
        { header: 'Jumlah Jam', key: 'value', width: 15 },
        { header: 'Penyelenggara', key: 'organizer', width: 25 },
        { header: 'Tanggal Mulai (YYYY-MM-DD)', key: 'dateStart', width: 30 },
        { header: 'Tanggal Selesai (YYYY-MM-DD)', key: 'dateEnd', width: 30 },
        { header: 'Berlaku Hingga (YYYY-MM-DD)', key: 'validUntil', width: 30 },
      ];

      // Add example row
      worksheet.addRow({
        email: 'john@example.com',
        topic: 'Risk Management Training',
        type: 1,
        value: 8,
        organizer: 'PT Pertamina',
        dateStart: '2025-01-15',
        dateEnd: '2025-01-15',
        validUntil: '2026-01-15',
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF006cb8' },
      };
      worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Template_Import_Pencapaian.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);

      message.success('Template berhasil diunduh');
    } catch (error) {
      console.error('Error downloading template:', error);
      message.error('Gagal mengunduh template');
    }
  };

  const handleImportExcel = async (file: File): Promise<boolean> => {
    // Show import modal
    setImportModalVisible(true);
    setImportProgress({
      status: 'reading',
      totalRows: 0,
      validRows: 0,
      errorRows: 0,
      errors: [],
    });
    
    try {
      console.log('📁 Starting Excel import, file:', file.name, 'size:', file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ File loaded as ArrayBuffer');
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      console.log('✅ Workbook loaded successfully');

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) {
        setImportProgress(prev => ({
          ...prev,
          status: 'error',
          errors: ['Worksheet tidak ditemukan dalam file Excel'],
        }));
        console.error('❌ Worksheet not found');
        return false;
      }
      
      console.log('✅ Worksheet found, reading rows...');

      const jsonData: any[] = [];
      
      // Helper function to get cell value as string
      const getCellValue = (cell: any): string => {
        if (!cell.value) return '';
        if (typeof cell.value === 'object' && cell.value.text) return String(cell.value.text);
        if (typeof cell.value === 'object' && cell.value.result) return String(cell.value.result);
        return String(cell.value);
      };
      
      // Skip header row (row 1) and read data rows
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const rowData: any = {
            _rowNumber: rowNumber, // Store row number for display
          };
          row.eachCell((cell, colNumber) => {
            const header = getCellValue(worksheet.getRow(1).getCell(colNumber));
            rowData[header] = getCellValue(cell);
          });
          jsonData.push(rowData);
        }
      });

      console.log(`✅ Read ${jsonData.length} data rows from Excel`);
      
      setImportProgress(prev => ({
        ...prev,
        status: 'validating',
        totalRows: jsonData.length,
      }));

      if (jsonData.length === 0) {
        setImportProgress(prev => ({
          ...prev,
          status: 'error',
          errors: ['File Excel tidak memiliki data. Pastikan file terisi dengan benar.'],
        }));
        console.error('❌ No data rows found');
        return false;
      }

      // Validate and transform data
      const importData: any[] = [];
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = row._rowNumber || (i + 2); // Use stored row number

        // Get cleaned values
        const emailPegawai = String(row['Email Pegawai'] || '').trim();
        const topikPencapaian = String(row['Topik Pencapaian'] || '').trim();
        const tipe = row['Tipe (1=Pelatihan, 2=Sertifikat)'];
        const jumlahJam = row['Jumlah Jam'];
        const penyelenggara = String(row['Penyelenggara'] || '').trim();
        const tanggalMulai = String(row['Tanggal Mulai (YYYY-MM-DD)'] || '').trim();
        const tanggalSelesai = String(row['Tanggal Selesai (YYYY-MM-DD)'] || '').trim();
        const berlakuHingga = String(row['Berlaku Hingga (YYYY-MM-DD)'] || '').trim();

        // Build row detail for error messages
        const rowDetail = `[${emailPegawai}] ${topikPencapaian}`;

        // Find employee by email
        if (!emailPegawai) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Email Pegawai harus diisi`);
          continue;
        }

        const employee = employees.find(emp => emp.email === emailPegawai);
        if (!employee) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Email pegawai tidak ditemukan di database`);
          continue;
        }

        // Validate required fields
        if (!topikPencapaian) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Topik Pencapaian harus diisi`);
          continue;
        }

        if (!tipe || ![1, 2, '1', '2'].includes(tipe)) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Tipe harus 1 atau 2`);
          continue;
        }

        const tipeNumber = Number(tipe);

        console.log(`\n========== ROW ${rowNum} DEBUG ==========`);
        console.log(`📧 Email: ${emailPegawai}`);
        console.log(`🎯 Topic: "${topikPencapaian}"`);
        console.log(`📝 Type: ${tipeNumber}`);
        console.log(`⏱️  Value (Jam): ${jumlahJam}`);
        console.log(`🏢 Organizer: "${penyelenggara}"`);
        console.log(`📅 Date Start: ${tanggalMulai}`);
        console.log(`📅 Date End: ${tanggalSelesai}`);
        console.log(`📅 Valid Until: "${berlakuHingga}"`);
        console.log(`👤 Employee ID: ${employee.id}`);

        // Validation based on type
        if (tipeNumber === 1) {
          // Pelatihan (LH): Jumlah Jam mandatory, must be > 0
          if (!jumlahJam || Number(jumlahJam) <= 0) {
            errors.push(`Baris ${rowNum} ${rowDetail}: Tipe Pelatihan - Jumlah Jam harus lebih dari 0`);
            continue;
          }
        } else if (tipeNumber === 2) {
          // Sertifikat (CERT): Berlaku Hingga mandatory, Jumlah Jam boleh 0
          if (!berlakuHingga || berlakuHingga.trim() === '') {
            errors.push(`Baris ${rowNum} ${rowDetail}: Tipe Sertifikat - Berlaku Hingga harus diisi`);
            console.log(`❌ Row ${rowNum} failed validation: Berlaku Hingga is empty`);
            continue;
          }
        }

        if (!tanggalMulai || !tanggalSelesai) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Tanggal Mulai dan Tanggal Selesai harus diisi`);
          continue;
        }

        // Check for duplicate in database - different criteria for each type
        let isDuplicate = false;
        
        console.log(`\n🔍 Checking duplicates in database (${achievements.length} existing records)...`);
        
        if (tipeNumber === 1) {
          // Tipe 1 (Pelatihan): cek pegawai, topik, tipe, jumlah jam, penyelenggara, tanggal mulai, tanggal selesai
          console.log(`📋 Type 1 (Pelatihan) - Checking fields:`);
          console.log(`   - employeeId: ${employee.id}`);
          console.log(`   - topic (lowercase): "${topikPencapaian.toLowerCase()}"`);
          console.log(`   - type: ${tipeNumber}`);
          console.log(`   - value: ${Number(jumlahJam)}`);
          console.log(`   - organizer (lowercase): "${penyelenggara.toLowerCase()}"`);
          console.log(`   - dateStart: ${tanggalMulai}`);
          console.log(`   - dateEnd: ${tanggalSelesai}`);
          
          isDuplicate = achievements.some((achievement, idx) => {
            const match = achievement.employeeId === employee.id &&
              achievement.topic.toLowerCase() === topikPencapaian.toLowerCase() &&
              achievement.type === tipeNumber &&
              achievement.value === Number(jumlahJam) &&
              achievement.organizer.toLowerCase() === penyelenggara.toLowerCase() &&
              achievement.dateStart === tanggalMulai &&
              achievement.dateEnd === tanggalSelesai;
            
            if (achievement.employeeId === employee.id && achievement.type === tipeNumber) {
              console.log(`   Comparing with DB record #${idx}:`, {
                topicMatch: achievement.topic.toLowerCase() === topikPencapaian.toLowerCase(),
                valueMatch: achievement.value === Number(jumlahJam),
                organizerMatch: achievement.organizer.toLowerCase() === penyelenggara.toLowerCase(),
                dateStartMatch: achievement.dateStart === tanggalMulai,
                dateEndMatch: achievement.dateEnd === tanggalSelesai,
                overallMatch: match
              });
            }
            
            return match;
          });
        } else if (tipeNumber === 2) {
          // Tipe 2 (Sertifikat): cek pegawai, topik, tipe, penyelenggara, tanggal mulai, tanggal selesai, berlaku hingga
          console.log(`📋 Type 2 (Sertifikat) - Checking fields:`);
          console.log(`   - employeeId: ${employee.id}`);
          console.log(`   - topic (lowercase): "${topikPencapaian.toLowerCase()}"`);
          console.log(`   - type: ${tipeNumber}`);
          console.log(`   - organizer (lowercase): "${penyelenggara.toLowerCase()}"`);
          console.log(`   - dateStart: ${tanggalMulai}`);
          console.log(`   - dateEnd: ${tanggalSelesai}`);
          console.log(`   - validUntil: "${berlakuHingga}"`);
          
          isDuplicate = achievements.some((achievement, idx) => {
            const match = achievement.employeeId === employee.id &&
              achievement.topic.toLowerCase() === topikPencapaian.toLowerCase() &&
              achievement.type === tipeNumber &&
              achievement.organizer.toLowerCase() === penyelenggara.toLowerCase() &&
              achievement.dateStart === tanggalMulai &&
              achievement.dateEnd === tanggalSelesai &&
              achievement.validUntil === berlakuHingga;
            
            if (achievement.employeeId === employee.id && achievement.type === tipeNumber) {
              console.log(`   Comparing with DB record #${idx}:`, {
                topicMatch: achievement.topic.toLowerCase() === topikPencapaian.toLowerCase(),
                organizerMatch: achievement.organizer.toLowerCase() === penyelenggara.toLowerCase(),
                dateStartMatch: achievement.dateStart === tanggalMulai,
                dateEndMatch: achievement.dateEnd === tanggalSelesai,
                validUntilMatch: achievement.validUntil === berlakuHingga,
                dbValidUntil: achievement.validUntil,
                importValidUntil: berlakuHingga,
                overallMatch: match
              });
            }
            
            return match;
          });
        }

        if (isDuplicate) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Data pencapaian sudah ada di database`);
          console.log(`❌ Row ${rowNum} DUPLICATE IN DATABASE detected`);
          continue;
        } else {
          console.log(`✅ Row ${rowNum} NOT duplicate in database`);
        }

        // Check for duplicate within import data - different criteria for each type
        let isDuplicateInImport = false;
        
        console.log(`\n🔍 Checking duplicates within import data (${importData.length} records so far)...`);
        
        if (tipeNumber === 1) {
          // Tipe 1 (Pelatihan)
          isDuplicateInImport = importData.some((data, idx) => {
            const match = data.employeeId === employee.id &&
              data.topic.toLowerCase() === topikPencapaian.toLowerCase() &&
              data.type === tipeNumber &&
              data.value === Number(jumlahJam) &&
              data.organizer.toLowerCase() === penyelenggara.toLowerCase() &&
              data.dateStart === tanggalMulai &&
              data.dateEnd === tanggalSelesai;
            
            if (data.employeeId === employee.id && data.type === tipeNumber) {
              console.log(`   Comparing with import record #${idx}:`, {
                topicMatch: data.topic.toLowerCase() === topikPencapaian.toLowerCase(),
                valueMatch: data.value === Number(jumlahJam),
                organizerMatch: data.organizer.toLowerCase() === penyelenggara.toLowerCase(),
                dateStartMatch: data.dateStart === tanggalMulai,
                dateEndMatch: data.dateEnd === tanggalSelesai,
                overallMatch: match
              });
            }
            
            return match;
          });
        } else if (tipeNumber === 2) {
          // Tipe 2 (Sertifikat)
          isDuplicateInImport = importData.some((data, idx) => {
            const match = data.employeeId === employee.id &&
              data.topic.toLowerCase() === topikPencapaian.toLowerCase() &&
              data.type === tipeNumber &&
              data.organizer.toLowerCase() === penyelenggara.toLowerCase() &&
              data.dateStart === tanggalMulai &&
              data.dateEnd === tanggalSelesai &&
              data.validUntil === berlakuHingga;
            
            if (data.employeeId === employee.id && data.type === tipeNumber) {
              console.log(`   Comparing with import record #${idx}:`, {
                topicMatch: data.topic.toLowerCase() === topikPencapaian.toLowerCase(),
                organizerMatch: data.organizer.toLowerCase() === penyelenggara.toLowerCase(),
                dateStartMatch: data.dateStart === tanggalMulai,
                dateEndMatch: data.dateEnd === tanggalSelesai,
                validUntilMatch: data.validUntil === berlakuHingga,
                importRecordValidUntil: data.validUntil,
                currentValidUntil: berlakuHingga,
                overallMatch: match
              });
            }
            
            return match;
          });
        }

        if (isDuplicateInImport) {
          errors.push(`Baris ${rowNum} ${rowDetail}: Data duplikat dalam file Excel`);
          console.log(`❌ Row ${rowNum} DUPLICATE IN IMPORT DATA detected`);
          continue;
        } else {
          console.log(`✅ Row ${rowNum} NOT duplicate in import data`);
        }

        console.log(`✅ Row ${rowNum} PASSED all validations - Adding to import list`);
        console.log(`========================================\n`);

        importData.push({
          employeeId: employee.id,
          topic: topikPencapaian,
          type: tipeNumber,
          value: jumlahJam ? Number(jumlahJam) : 0,
          organizer: penyelenggara,
          dateStart: tanggalMulai,
          dateEnd: tanggalSelesai,
          validUntil: berlakuHingga || null,
          _rowDetail: `Baris ${rowNum}: ${rowDetail}`, // Store for success display
        });
      }

      console.log(`✅ Validation complete. Valid: ${importData.length}, Errors: ${errors.length}`);
      
      setImportProgress({
        status: errors.length > 0 && importData.length === 0 ? 'error' : 'validating',
        totalRows: jsonData.length,
        validRows: importData.length,
        errorRows: errors.length,
        errors: errors,
      });

      if (errors.length > 0 && importData.length === 0) {
        console.error('❌ All rows have validation errors');
        return false;
      }

      if (importData.length === 0) {
        setImportProgress(prev => ({
          ...prev,
          status: 'error',
          errors: ['Tidak ada data valid untuk diimport'],
        }));
        console.error('❌ No valid data to import');
        return false;
      }

      // Send to backend
      setImportProgress(prev => ({
        ...prev,
        status: 'uploading',
      }));
      
      console.log(`📤 Sending ${importData.length} records to backend...`);
      
      // Remove _rowDetail before sending to backend
      const cleanImportData = importData.map(({ _rowDetail, ...rest }) => rest);
      
      const response = await api.post('/achievements/import', { data: cleanImportData });
      
      if (response.data.success) {
        console.log('✅ Import successful:', response.data);
        setImportProgress({
          status: 'success',
          totalRows: jsonData.length,
          validRows: importData.length,
          errorRows: errors.length,
          errors: errors,
          successMessage: `Berhasil mengimport ${importData.length} data pencapaian`,
        });
        fetchAchievements();
      }
      
      return false; // Prevent default upload behavior
    } catch (error: any) {
      console.error('❌ Error importing Excel:', error);
      setImportProgress(prev => ({
        ...prev,
        status: 'error',
        errors: [...prev.errors, `Error: ${error.message || 'Gagal mengimport data'}`],
      }));
      return false;
    }
  };

  const uploadProps: UploadProps = {
    accept: '.xlsx,.xls',
    beforeUpload: handleImportExcel,
    showUploadList: false,
  };

  return (
    <div>
      <Card
        title={
          <Space>
            <TrophyOutlined style={{ fontSize: 24 }} />
            <span>Pencapaian Pegawai</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
            >
              Download Template
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>
                Import Excel
              </Button>
            </Upload>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              Tambah Pencapaian
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={achievements}
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
          scroll={{ x: 1400 }}
        />
      </Card>

      <Modal
        title={editingAchievement ? 'Edit Pencapaian' : 'Tambah Pencapaian'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedType(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={700}
        okText="Simpan"
        cancelText="Batal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="employeeId"
            label="Pegawai"
            rules={[{ required: true, message: 'Pilih pegawai!' }]}
          >
            <Select
              showSearch
              placeholder="Pilih pegawai"
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={employees.map(emp => ({
                label: `${emp.name} - ${emp.email}`,
                value: emp.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="topic"
            label="Topik Pencapaian"
            rules={[{ required: true, message: 'Topik wajib diisi!' }]}
          >
            <TextArea
              rows={3}
              placeholder="Masukkan topik pencapaian"
              maxLength={255}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Tipe Pencapaian"
            rules={[{ required: true, message: 'Pilih tipe!' }]}
          >
            <Select 
              placeholder="Pilih tipe pencapaian"
              onChange={(value) => {
                setSelectedType(value);
                // Reset field validUntil dan value ketika tipe berubah
                if (value === 1) {
                  form.setFieldsValue({ validUntil: null });
                } else if (value === 2) {
                  form.setFieldsValue({ value: null });
                }
              }}
            >
              <Option value={1}>Pelatihan (LH)</Option>
              <Option value={2}>Sertifikat (CERT)</Option>
            </Select>
          </Form.Item>

          {/* Berlaku Hingga - tampil setelah Tipe, hanya untuk Sertifikat */}
          {selectedType === 2 && (
            <Form.Item
              name="validUntil"
              label="Berlaku Hingga"
              rules={[
                { required: selectedType === 2, message: 'Berlaku hingga wajib diisi untuk sertifikat!' }
              ]}
            >
              <DatePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Pilih tanggal berlaku"
              />
            </Form.Item>
          )}

          {/* Jumlah Jam - hanya untuk Pelatihan */}
          {selectedType === 1 && (
            <Form.Item
              name="value"
              label="Jumlah Jam"
              rules={[
                { required: selectedType === 1, message: 'Jumlah Jam wajib diisi untuk pelatihan!' },
                { 
                  validator(_, value) {
                    if (!value || value <= 0) {
                      return Promise.reject(new Error('Jumlah Jam harus lebih dari 0 untuk pelatihan!'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber
                min={0.1}
                step={0.5}
                style={{ width: '100%' }}
                placeholder="Masukkan jumlah jam (dalam satuan jam)"
              />
            </Form.Item>
          )}

          <Form.Item
            name="organizer"
            label="Penyelenggara"
            rules={[{ required: true, message: 'Penyelenggara wajib diisi!' }]}
          >
            <Input
              placeholder="Masukkan nama penyelenggara"
              maxLength={255}
            />
          </Form.Item>

          <Form.Item
            name="dateStart"
            label="Tanggal Mulai"
            rules={[
              { required: true, message: 'Tanggal mulai wajib diisi!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  // Validasi: tidak boleh lebih dari hari ini
                  if (value.isAfter(dayjs(), 'day')) {
                    return Promise.reject(new Error('Tanggal mulai tidak boleh lebih dari hari ini!'));
                  }
                  // Validasi: harus lebih awal dari tanggal selesai
                  const dateEnd = getFieldValue('dateEnd');
                  if (dateEnd && value.isAfter(dateEnd, 'day')) {
                    return Promise.reject(new Error('Tanggal mulai harus lebih awal dari tanggal selesai!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal mulai"
              disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
            />
          </Form.Item>

          <Form.Item
            name="dateEnd"
            label="Tanggal Selesai"
            rules={[
              { required: true, message: 'Tanggal selesai wajib diisi!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }
                  // Validasi: tidak boleh lebih dari hari ini
                  if (value.isAfter(dayjs(), 'day')) {
                    return Promise.reject(new Error('Tanggal selesai tidak boleh lebih dari hari ini!'));
                  }
                  // Validasi: harus sama atau setelah tanggal mulai
                  const dateStart = getFieldValue('dateStart');
                  if (dateStart && value.isBefore(dateStart, 'day')) {
                    return Promise.reject(new Error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Pilih tanggal selesai"
              disabledDate={(current) => current && current.isAfter(dayjs(), 'day')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Progress Modal */}
      <Modal
        title="Import Data Pencapaian"
        open={importModalVisible}
        onCancel={() => {
          if (importProgress.status === 'success' || importProgress.status === 'error') {
            setImportModalVisible(false);
          }
        }}
        footer={
          importProgress.status === 'success' || importProgress.status === 'error' ? (
            <Button type="primary" onClick={() => setImportModalVisible(false)}>
              Tutup
            </Button>
          ) : null
        }
        closable={importProgress.status === 'success' || importProgress.status === 'error'}
        maskClosable={false}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {/* Status Section */}
          <Card size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>Status:</Text>
                {importProgress.status === 'reading' && (
                  <Tag icon={<Spin size="small" />} color="processing">
                    Membaca File Excel...
                  </Tag>
                )}
                {importProgress.status === 'validating' && (
                  <Tag icon={<Spin size="small" />} color="processing">
                    Memvalidasi Data...
                  </Tag>
                )}
                {importProgress.status === 'uploading' && (
                  <Tag icon={<Spin size="small" />} color="processing">
                    Mengupload ke Database...
                  </Tag>
                )}
                {importProgress.status === 'success' && (
                  <Tag color="success">Berhasil ✓</Tag>
                )}
                {importProgress.status === 'error' && (
                  <Tag color="error">Gagal ✗</Tag>
                )}
              </div>
            </Space>
          </Card>

          {/* Statistics Section */}
          {importProgress.totalRows > 0 && (
            <Card size="small" title={<Text strong>Statistik Import</Text>}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Total Baris:</Text>
                  <Text strong>{importProgress.totalRows}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Data Valid:</Text>
                  <Text strong style={{ color: '#52c41a' }}>{importProgress.validRows}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Data Error:</Text>
                  <Text strong style={{ color: '#ff4d4f' }}>{importProgress.errorRows}</Text>
                </div>
              </Space>
            </Card>
          )}

          {/* Success Message */}
          {importProgress.status === 'success' && importProgress.successMessage && (
            <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Text style={{ color: '#52c41a' }}>✓ {importProgress.successMessage}</Text>
            </Card>
          )}

          {/* Error Section */}
          {importProgress.errors.length > 0 && (
            <Card 
              size="small" 
              title={
                <Text strong style={{ color: '#ff4d4f' }}>
                  Error Detail ({importProgress.errors.length})
                </Text>
              }
            >
              <div style={{ maxHeight: 250, overflow: 'auto' }}>
                {importProgress.errors.map((err, idx) => (
                  <div key={idx} style={{ marginBottom: 4, fontSize: 13 }}>
                    <Text type="danger">• {err}</Text>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Info Message for Partial Success */}
          {importProgress.status === 'success' && importProgress.errorRows > 0 && (
            <Card size="small" style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
              <Text style={{ color: '#faad14' }}>
                ⚠ Import selesai dengan {importProgress.errorRows} baris error. 
                Data yang valid ({importProgress.validRows} baris) telah berhasil diimport.
              </Text>
            </Card>
          )}
        </Space>
      </Modal>
    </div>
  );
};

export default Achievements;
