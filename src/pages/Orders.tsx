import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChevronDown, CreditCard } from 'lucide-react';
import { orderService } from '../services/orders';
import { useToast } from '../contexts/ToastContext';
import Button from '../components/ui/Button';

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  created_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchOrders = async () => {
    try {
      const response = await orderService.getHistory();
      setOrders(response.data);
    } catch (error) {
      console.error('Falha ao buscar pedidos', error);
      addToast('error', 'Falha ao buscar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmPayment = async (orderNumber: string) => {
    setIsConfirming(orderNumber);
    try {
      await orderService.confirmPayment(orderNumber);
      addToast('success', 'Pagamento confirmado com sucesso!');
      fetchOrders();
    } catch (error) {
      console.error('Falha na confirmação do pagamento', error);
      addToast('error', 'Falha ao confirmar pagamento');
    } finally {
      setIsConfirming(null);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'paid': return <CheckCircle size={18} className="text-green-500" />;
      case 'delivered': return <CheckCircle size={18} className="text-green-500" />;
      default: return <Clock size={18} className="text-amber-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'paid': return 'Pago';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const calculateOrderTotal = (order: Order) => {
    // Se a API retornar um total válido e maior que zero, usamos ele
    if (order.total && Number(order.total) > 0) return Number(order.total);
    
    // Caso contrário, calculamos a partir dos itens para evitar o 0.00
    return (order.items || []).reduce((acc, item) => {
      return acc + (Number(item.price || 0) * Number(item.quantity || 0));
    }, 0);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center animate-pulse">
        <div className="w-12 h-12 border-4 border-creamy-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Histórico de Pedidos</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-creamy-100 animate-in zoom-in-95 duration-500">
          <Package size={48} className="mx-auto text-creamy-200 mb-4" />
          <p className="text-xl text-creamy-400 font-medium">Você ainda não fez nenhum pedido.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => {
            const total = calculateOrderTotal(order);
            return (
              <div 
                key={order.id} 
                className="card group animate-in fade-in slide-in-from-bottom-2 duration-500"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <div 
                  className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-creamy-50 transition-all duration-300"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-creamy-100 text-creamy-500 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Package size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-creamy-800">Pedido #{order.order_number}</h3>
                      <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest">
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Status</p>
                      <div className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border border-creamy-100 shadow-sm">
                        {getStatusIcon(order.status)}
                        <span className="text-sm font-bold text-creamy-700 capitalize">
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right min-w-[80px]">
                      <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Total</p>
                      <p className="text-lg font-black text-creamy-700">
                        R$ {total.toFixed(2)}
                      </p>
                    </div>

                    <div className={`text-creamy-300 transition-transform duration-500 ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                      <ChevronDown size={20} />
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="px-6 pb-6 pt-2 border-t border-creamy-50 space-y-6 animate-in slide-in-from-top-2 duration-300">
                    {order.status === 'pending' && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center text-amber-800">
                          <CreditCard size={20} className="mr-3 flex-shrink-0" />
                          <p className="text-sm font-medium">Este pedido está aguardando pagamento. Deseja pagar agora?</p>
                        </div>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirmPayment(order.order_number);
                          }}
                          isLoading={isConfirming === order.order_number}
                          className="py-2 px-6 text-sm whitespace-nowrap shadow-sm"
                        >
                          Confirmar Pagamento
                        </Button>
                      </div>
                    )}

                    <div className="space-y-4">
                      <p className="text-sm font-bold text-creamy-800 uppercase tracking-widest">Itens do Pedido</p>
                      <div className="space-y-3">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-creamy-50 last:border-0 group/item">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-bold text-creamy-400 w-6 transition-colors group-hover/item:text-creamy-600">{item.quantity}x</span>
                              <span className="font-medium text-creamy-700 transition-colors group-hover/item:text-creamy-900">{item.name}</span>
                            </div>
                            <span className="font-bold text-creamy-600">
                              R$ {(Number(item.price || 0) * Number(item.quantity || 0)).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;