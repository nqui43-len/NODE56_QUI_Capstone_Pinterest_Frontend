// src/services/userService.ts
import axiosClient from './axiosClient';

export const userService = {
  updateProfile: async (data: { username: string; avatarUrl: string }) => {
    // Map dữ liệu sang 'name' để backend hiểu được
    const payload = {
      name: data.username, 
      avatarUrl: data.avatarUrl
    };
    
    return axiosClient.patch('/auth/profile', payload);
  }
};