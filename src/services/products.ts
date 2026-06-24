import api from './api';

export const productService = {
  getProducts: async (params: { page?: number; limit?: number; name?: string; type?: string }) => {
    return api.get('/products', { params });
  },
  getProduct: async (id: string) => {
    return api.get(`/products/${id}`);
  },
  createProduct: async (data: any) => {
    return api.post('/products', data);
  },
};