import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL + '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  
  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
};

export const doctorsAPI = {
  getAll: async () => {
    const response = await api.get('/doctors');
    return response.data;
  },
};

export const appointmentsAPI = {
  create: async (data: any) => {
    const response = await api.post('/appointments', data);
    return response.data;
  },
  
  getByPatient: async (patientId: string) => {
    const response = await api.get(`/appointments/patient/${patientId}`);
    return response.data;
  },
  
  getByDoctor: async (doctorId: string) => {
    const response = await api.get(`/appointments/doctor/${doctorId}`);
    return response.data;
  },
  
  getAll: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },
  
  updateStatus: async (appointmentId: string, status: string) => {
    const response = await api.patch(`/appointments/${appointmentId}/status?status=${status}`);
    return response.data;
  },
  
  delete: async (appointmentId: string) => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },
};

export const clinicAPI = {
  getInfo: async () => {
    const response = await api.get('/clinic-info');
    return response.data;
  },
};

export const offersAPI = {
  getAll: async () => {
    const response = await api.get('/offers');
    return response.data;
  },
  
  create: async (data: any) => {
    const response = await api.post('/offers', data);
    return response.data;
  },
};

export default api;
