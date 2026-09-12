// src/services/userService.ts
import axiosClient from './axiosClient';

export const userService = {
  updateProfile: async (data: { username: string; avatarUrl: string }) => {
    return axiosClient.patch('/auth/profile', data);
  }
};