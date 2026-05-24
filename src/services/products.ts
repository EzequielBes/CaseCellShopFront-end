import api from './api';

export const productService = {
  getProducts: async (params: { page?: number; limit?: number; name?: string; type?: string }) => {
    return api.get('/products', { params });
  },
  createProduct: async (data: any) => {
    return api.post('/products', data);
  },
};