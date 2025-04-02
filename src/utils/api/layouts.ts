import axios from 'axios';
import { apiBaseUrl } from '@/config';

const API_URL = `${apiBaseUrl}/layouts`;

export interface Layout {
  id?: number;
  name: string;
  description?: string;
  content: any;
  userId?: string;
  categoryId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  category?: any;
}

export const saveLayout = async (layout: Layout): Promise<Layout> => {
  try {
    // Se o layout já tem um ID, atualizamos; caso contrário, criamos um novo
    if (layout.id) {
      const response = await axios.put(`${API_URL}/${layout.id}`, layout);
      return response.data;
    } else {
      const response = await axios.post(API_URL, layout);
      return response.data;
    }
  } catch (error) {
    console.error('Erro ao salvar layout:', error);
    throw error;
  }
};

export const getLayouts = async (): Promise<Layout[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar layouts:', error);
    throw error;
  }
};

export const getLayoutById = async (id: number): Promise<Layout> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar layout ${id}:`, error);
    throw error;
  }
};

export const deleteLayout = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error(`Erro ao excluir layout ${id}:`, error);
    throw error;
  }
};

export const getLayoutsByCategory = async (categoryId: number): Promise<Layout[]> => {
  try {
    const response = await axios.get(`${API_URL}/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar layouts da categoria ${categoryId}:`, error);
    throw error;
  }
};
