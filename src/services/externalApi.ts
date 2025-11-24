import axios from 'axios';

const BASE_URL = import.meta.env.VITE_EXTERNAL_API_BASE_URL || 'https://nusantararegas.com/auth-v1-dev/api';
const API_USERNAME = import.meta.env.VITE_EXTERNAL_API_USERNAME || '';
const API_PASSWORD = import.meta.env.VITE_EXTERNAL_API_PASSWORD || '';

let authToken: string | null = null;

/**
 * Authenticate with external API and get token
 */
export const authenticateExternalApi = async (): Promise<string> => {
  try {
    const response = await axios.post(
      `${BASE_URL}/User/SecureAuth`,
      {
        username: API_USERNAME,
        password: API_PASSWORD,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );

    if (response.data && response.data.token) {
      authToken = response.data.token;
      return response.data.token;
    } else if (typeof response.data === 'string') {
      authToken = response.data;
      return response.data;
    }

    throw new Error('Token not found in response');
  } catch (error: any) {
    console.error('Authentication error:', error);
    throw new Error(error.response?.data?.message || 'Failed to authenticate');
  }
};

/**
 * Get auth token (authenticate if needed)
 */
const getAuthToken = async (): Promise<string> => {
  if (!authToken) {
    authToken = await authenticateExternalApi();
  }
  return authToken;
};

/**
 * Sync departments from external API
 */
export const syncDepartments = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/Department`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'Departments synced successfully',
    };
  } catch (error: any) {
    // Try to re-authenticate if token expired
    if (error.response?.status === 401) {
      authToken = null;
      const token = await getAuthToken();
      const response = await axios.get(`${BASE_URL}/Department`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Departments synced successfully',
      };
    }

    console.error('Sync departments error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to sync departments',
    };
  }
};

/**
 * Sync positions (jabatan) from external API
 */
export const syncPositions = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/Jabatan`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'Positions synced successfully',
    };
  } catch (error: any) {
    // Try to re-authenticate if token expired
    if (error.response?.status === 401) {
      authToken = null;
      const token = await getAuthToken();
      const response = await axios.get(`${BASE_URL}/Jabatan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Positions synced successfully',
      };
    }

    console.error('Sync positions error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to sync positions',
    };
  }
};

/**
 * Sync employees (users) from external API
 */
export const syncEmployees = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/User`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    return {
      success: true,
      data: response.data,
      message: 'Employees synced successfully',
    };
  } catch (error: any) {
    // Try to re-authenticate if token expired
    if (error.response?.status === 401) {
      authToken = null;
      const token = await getAuthToken();
      const response = await axios.get(`${BASE_URL}/User`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Employees synced successfully',
      };
    }

    console.error('Sync employees error:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || 'Failed to sync employees',
    };
  }
};

/**
 * Test API connection
 */
export const testApiConnection = async () => {
  try {
    await authenticateExternalApi();
    return {
      success: true,
      message: 'API connection successful',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'API connection failed',
    };
  }
};
