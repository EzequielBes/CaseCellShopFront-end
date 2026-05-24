import api from './api';

export const orderService = {
  checkout: async (items: { product_id: string; quantity: number }[]) => {
    return api.post('/orders/checkout', { items });
  },
  getHistory: async () => {
    return api.get('/orders/history');
  },
  confirmPayment: async (orderNumber: string) => {
    return api.post('/orders/confirm-payment', { order_number: orderNumber, status: 'concluido' });
  },
};
