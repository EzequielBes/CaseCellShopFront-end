import React, { useState, useEffect } from 'react';
import { Package, Clock, CheckCircle, ChevronDown, CreditCard, XCircle, RefreshCw } from 'lucide-react';
import { orderService } from '../services/orders';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';

interface OrderItem {
  product_id: string;
  name?: string;
  product_name?: string;
  title?: string;
  product?: {
    name?: string;
    title?: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: 'esperando pagamento' | 'em andamento' | 'concluido' | 'cancelado' | 'waiting_payment' | 'pending' | 'paid' | 'shipped' | 'delivered';
  items: OrderItem[];
  total: number;
  created_at: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchOrders = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const response = await orderService.getHistory();
      setOrders(response.data || []);
      if (isManual) addToast('info', 'Histórico atualizado');
    } catch (error) {
      console.error('Falha ao buscar pedidos', error);
      addToast('error', 'Falha ao buscar histórico de pedidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      fetchOrders(true);
    } catch (error) {
      console.error('Falha na confirmação do pagamento', error);
      addToast('error', 'Falha ao confirmar pagamento');
    } finally {
      setIsConfirming(null);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'concluido':
      case 'paid':
      case 'delivered': 
        return <CheckCircle size={18} className="text-green-500" />;
      case 'cancelado':
        return <XCircle size={18} className="text-amber-500" />;
      case 'esperando pagamento':
      case 'waiting_payment':
      case 'pending':
        return <Clock size={18} className="text-amber-500" />;
      case 'em andamento':
        return <Clock size={18} className="text-blue-500" />;
      default: 
        return <Clock size={18} className="text-blue-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'esperando pagamento':
      case 'waiting_payment': return 'Esperando Pagamento';
      case 'em andamento': return 'Em Andamento';
      case 'concluido': return 'Pago';
      case 'cancelado': return 'Compra Cancelada';
      case 'pending': return 'Pendente';
      case 'paid': return 'Pago';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregue';
      default: return status;
    }
  };

  const calculateOrderTotal = (order: Order) => {
    if (order.total && Number(order.total) > 0) return Number(order.total);
    return (order.items || []).reduce((acc, item) => {
      return acc + (Number(item.price || 0) * Number(item.quantity || 0));
    }, 0);
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Histórico de Pedidos</h1>
          <button 
            onClick={() => fetchOrders(true)}
            className={`p-3 rounded-full bg-white border border-creamy-100 text-creamy-400 hover:text-creamy-600 hover:shadow-sm transition-all ${refreshing ? 'animate-spin' : ''}`}
            title="Atualizar histórico"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        {loading && orders.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-3xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-creamy-100 animate-in zoom-in-95 duration-500">
            <Package size={48} className="mx-auto text-creamy-200 mb-4" />
            <p className="text-xl text-creamy-400 font-medium">Você ainda não fez nenhum pedido.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const total = calculateOrderTotal(order);
              const isCancelled = order.status === 'cancelado';
              
              return (
                <div 
                  key={order.id} 
                  className={`card group overflow-hidden transition-all duration-300 ${isCancelled ? 'border-amber-200 bg-amber-50/30' : ''}`}
                >
                  <div 
                    className="p-6 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-creamy-50 transition-all duration-300"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${isCancelled ? 'bg-amber-100 text-amber-500' : 'bg-creamy-100 text-creamy-50'}`}>
                        <Package size={24} className={isCancelled ? 'text-amber-500' : 'text-creamy-500'} />
                      </div>
                      <div>
                        <h3 className={`font-bold ${isCancelled ? 'text-amber-700' : 'text-creamy-800'}`}>Pedido #{order.order_number}</h3>
                        <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest">
                          {new Date(order.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right">
                        <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Status</p>
                        <div className={`flex items-center space-x-2 bg-white px-3 py-1 rounded-full border shadow-sm ${isCancelled ? 'bg-amber-100 border-amber-200' : 'bg-white border-creamy-100'}`}>
                          {getStatusIcon(order.status)}
                          <span className={`text-sm font-bold capitalize ${isCancelled ? 'text-amber-700' : 'text-creamy-700'}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Total</p>
                        <p className={`text-lg font-black ${isCancelled ? 'text-amber-600' : 'text-creamy-700'}`}>
                          {formatCurrency(total)}
                        </p>
                      </div>

                      <div className={`text-creamy-300 transition-transform duration-500 ${expandedOrder === order.id ? 'rotate-180' : ''}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-creamy-50 space-y-6 animate-in slide-in-from-top-2 duration-300">
                      {(order.status === 'pending' || order.status === 'waiting_payment' || order.status === 'esperando pagamento') && (
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
                            Pagar agora
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
                                <span className={`font-medium transition-colors group-hover/item:text-creamy-900 ${isCancelled ? 'text-amber-600' : 'text-creamy-700'}`}>
                                  {item.name || item.product_name || item.title || item.product?.name || item.product?.title || 'Produto'}
                                </span>
                              </div>
                              <span className={`font-bold ${isCancelled ? 'text-amber-500' : 'text-creamy-600'}`}>
                                {formatCurrency(Number(item.price || 0) * Number(item.quantity || 0))}
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
    </PageTransition>
  );
};

export default Orders;
