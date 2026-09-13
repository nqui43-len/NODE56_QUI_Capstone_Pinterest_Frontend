import axiosClient from './axiosClient';

export const authService = {
  login: async (data: any) => {
    const response = await axiosClient.post('/auth/login', data);
    return response as any;
  },
  register: async (data: any) => {
    const response = await axiosClient.post('/auth/register', data);
    return response as any;
  }
};