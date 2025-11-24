// Dashboard Types
export interface DashboardData {
  id: string;
  title: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Admin Panel Types
export interface DataItem {
  id: number;
  name: string;
  value: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Achievement Types
export interface Achievement {
  id: string;
  topic: string;
  type: number; // 1=Pelatihan, 2=Sertifikat
  validUntil: string | null;
  value: number;
  organizer: string;
  employeeId: string;
  dateStart: string;
  dateEnd: string;
  inputByName?: string | null;
  inputById?: string | null;
  achievement_created_at?: string;
  employee?: {
    id: string;
    name: string;
    email: string;
    jabatan: string;
    department: string;
  };
}
