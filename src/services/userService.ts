import axiosClient from './axiosClient';

export const userService = {
  updateProfile: async (data: { username: string; avatarUrl: string }) => {
    const payload = {
      name: data.username, 
      avatarUrl: data.avatarUrl
    };
    return axiosClient.patch('/auth/profile', payload);
  }
};