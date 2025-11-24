import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.VITE_EXTERNAL_API_BASE_URL || 'https://nusantararegas.com/auth-v1-dev/api';
const API_USERNAME = process.env.VITE_EXTERNAL_API_USERNAME || 'admin';
const API_PASSWORD = process.env.VITE_EXTERNAL_API_PASSWORD || 'Nus@nt@r@h3b4t';

let authToken: string | null = null;
let tokenExpiry: number = 0;

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
      // Set token expiry to 1 hour from now
      tokenExpiry = Date.now() + 3600000;
      return response.data.token;
    } else if (typeof response.data === 'string') {
      authToken = response.data;
      tokenExpiry = Date.now() + 3600000;
      return response.data;
    }

    throw new Error('Token not found in response');
  } catch (error: any) {
    console.error('Authentication error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to authenticate with external API');
  }
};

/**
 * Get auth token (authenticate if needed or token expired)
 */
const getAuthToken = async (): Promise<string> => {
  // Check if token exists and is not expired
  if (authToken && Date.now() < tokenExpiry) {
    return authToken;
  }
  
  // Re-authenticate if token is expired or doesn't exist
  return await authenticateExternalApi();
};

/**
 * Sync departments from external API
 */
export const syncDepartmentsFromExternal = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/Department`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      timeout: 30000, // 30 seconds timeout
    });

    return {
      success: true,
      data: response.data,
      message: 'Departments fetched successfully',
    };
  } catch (error: any) {
    // Try to re-authenticate if token expired
    if (error.response?.status === 401) {
      console.log('Token expired, re-authenticating...');
      authToken = null;
      tokenExpiry = 0;
      const token = await getAuthToken();
      const response = await axios.get(`${BASE_URL}/Department`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return {
        success: true,
        data: response.data,
        message: 'Departments fetched successfully',
      };
    }

    console.error('Sync departments error:', error.response?.data || error.message);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to sync departments',
    };
  }
};

/**
 * Sync positions (jabatan) from external API
 */
export const syncPositionsFromExternal = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/Jabatan`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      timeout: 30000,
    });

    return {
      success: true,
      data: response.data,
      message: 'Positions fetched successfully',
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('Token expired, re-authenticating...');
      authToken = null;
      tokenExpiry = 0;
      const token = await getAuthToken();
      const response = await axios.get(`${BASE_URL}/Jabatan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 30000,
      });

      return {
        success: true,
        data: response.data,
        message: 'Positions fetched successfully',
      };
    }

    console.error('Sync positions error:', error.response?.data || error.message);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to sync positions',
    };
  }
};

/**
 * Sync employees (users) from external API
 */
export const syncEmployeesFromExternal = async () => {
  try {
    const token = await getAuthToken();
    const response = await axios.get(`${BASE_URL}/User`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout for large dataset
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return {
      success: true,
      data: response.data,
      message: 'Employees fetched successfully',
    };
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('Token expired, re-authenticating...');
      authToken = null;
      tokenExpiry = 0;
      const token = await getAuthToken();
      const response = await axios.get(`${BASE_URL}/User`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 60000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      return {
        success: true,
        data: response.data,
        message: 'Employees fetched successfully',
      };
    }

    console.error('Sync employees error:', error.response?.data || error.message);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to sync employees',
    };
  }
};

/**
 * Test API connection
 */
export const testExternalApiConnection = async () => {
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
