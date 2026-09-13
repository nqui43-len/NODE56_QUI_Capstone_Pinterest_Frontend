import axiosClient from './axiosClient';
import { PinData } from '@/components/pin/MasonryGrid';

export const pinService = {
  getAllPins: async (search?: string): Promise<PinData[]> => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await axiosClient.get(`/pins${query}`);
    return response as any; 
  },
  
  getPinById: async (id: string | number) => {
    const response = await axiosClient.get(`/pins/${id}`);
    return response as any;
  },

  getPinsByUser: async (userId: number | string): Promise<PinData[]> => {
    const response = await axiosClient.get(`/pins/user/${userId}`);
    return response as any;
  },
  
  createPin: async (formData: FormData) => {
    return axiosClient.post('/pins/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePin: async (id: number, data: { title: string; description: string }) => {
    return axiosClient.patch(`/pins/${id}`, data);
  },

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