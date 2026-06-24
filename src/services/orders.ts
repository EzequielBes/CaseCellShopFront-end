import api from './api';

export const orderService = {
  checkout: async (items: { product_id: string; quantity: number }[], distance?: number) => {
    return api.post('/orders/checkout', { items, distance });
  },
  getHistory: async () => {
    return api.get('/orders/history');
  },
  getManagement: async () => {
    return api.get('/orders/management');
  },
  confirmPayment: async (orderNumber: string) => {
    return api.post('/orders/confirm-payment', { order_number: orderNumber, status: 'concluido' });
  },
};
