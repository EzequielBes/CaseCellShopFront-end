import api from './api';

export const erpService = {
  getStock: async (productId: string) => {
    return api.get(`/erp/inventory/stock/${productId}`);
  },
  addStock: async (data: { product_id: string; quantity: number; reference_id?: string }) => {
    return api.post('/erp/inventory/add', data);
  },
  removeStock: async (data: { product_id: string; quantity: number; reference_id?: string }) => {
    return api.post('/erp/inventory/remove', data);
  },

  getInvoice: async (orderId: string) => {
    return api.get(`/erp/billing/invoice/${orderId}`);
  },

  getFinancialHistory: async () => {
    return api.get('/erp/financial/history');
  },
  getFinancialBalance: async () => {
    return api.get('/erp/financial/balance');
  },

  getAccountingEntries: async () => {
    return api.get('/erp/accounting/entries');
  },
};
