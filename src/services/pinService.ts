// src/services/pinService.ts
import axiosClient from './axiosClient';
import { PinData } from '@/components/pin/MasonryGrid';

export const pinService = {
  // Thêm tham số search vào URL
  getAllPins: async (search?: string): Promise<PinData[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await axiosClient.get(`/pins${query}`);
    return response as any; 
  },
  
  getPinById: async (id: string | number) => {
    const response = await axiosClient.get(`/pins/${id}`);
    return response as any;
  },

  // THÊM HÀM NÀY: Lấy danh sách Pin theo User ID
  getPinsByUser: async (userId: number | string): Promise<PinData[]> => {
    const response = await axiosClient.get(`/pins/user/${userId}`);
    return response as any;
  },
  
  createPin: async (formData: FormData) => {
    return axiosClient.post('/pins/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Hàm Update
  updatePin: async (id: number, data: { title: string; description: string }) => {
    return axiosClient.patch(`/pins/${id}`, data);
  },

  // Hàm Delete
  deletePin: async (id: number) => {
    return axiosClient.delete(`/pins/${id}`);
  },

  getSavedPins: async (): Promise<PinData[]> => {
    const response = await axiosClient.get('/pins/saved/list');
    return response as any;
  },

  toggleSavePin: async (id: number) => {
    return axiosClient.post(`/pins/${id}/save`);
  },
};