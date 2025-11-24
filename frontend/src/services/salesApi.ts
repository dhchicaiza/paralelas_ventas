import { api } from './api';
import { CreateSaleDTO, Sale } from '../types';

export const salesApi = {
  createSale: async (data: CreateSaleDTO): Promise<Sale> => {
    const response = await api.post<Sale>('/sales', data);
    return response.data;
  },

  getSale: async (id: string): Promise<Sale> => {
    const response = await api.get<Sale>(`/sales/${id}`);
    return response.data;
  },

  listSales: async (): Promise<Sale[]> => {
    const response = await api.get<Sale[]>('/sales');
    return response.data;
  },
};
