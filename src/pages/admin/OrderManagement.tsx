import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orders';
import { Package, Truck, Calendar, CreditCard, Loader2 } from 'lucide-react';
import PageTransition from '../../components/ui/PageTransition';
import { formatCurrency } from '../../utils/format';

const OrderManagement: React.FC = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await orderService.getManagement();
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-creamy-500">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        Erro ao carregar o gerenciamento de compras. Verifique suas permissões.
      </div>
    );
  }

  const orders = data || [];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-creamy-800 mb-8 flex items-center">
          <Package className="mr-3 text-creamy-500" size={32} />
          Gerenciamento de Compras (Suporte)
        </h1>

        <div className="bg-white rounded-2xl shadow-sm border border-creamy-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-creamy-50 border-b border-creamy-100 text-sm font-bold text-creamy-600 uppercase tracking-wider">
                  <th className="p-4">Pedido ID</th>
                  <th className="p-4">Data</th>
                  <th className="p-4">Cliente</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Frete</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-creamy-100 text-creamy-700 text-sm">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-creamy-50 transition-colors">
                    <td className="p-4 font-mono text-xs">{order.order_number}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-creamy-400" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 font-medium">{order.account_id}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'concluido' ? 'bg-green-100 text-green-700' :
                        order.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end">
                        <Truck size={14} className="mr-2 text-creamy-400" />
                        {formatCurrency(order.freight_amount || 0)}
                      </div>
                    </td>
                    <td className="p-4 text-right font-bold text-creamy-800">
                      <div className="flex items-center justify-end">
                        <CreditCard size={14} className="mr-2 text-creamy-400" />
                        {formatCurrency(order.total_amount || 0)}
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-creamy-500">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default OrderManagement;
