import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { orderService } from '../services/orders';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import QRScannerPayment from '../components/ui/QRScannerPayment';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<{ orderNumber: string, amount: number } | null>(null);
  const [orderConfirmed, setOrderConfirmed] = useState<boolean>(false);
  const [distance, setDistance] = useState<number>(0);
  const freightTotal = distance * 1.5;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      addToast('info', 'Por favor, faça login para finalizar a compra');
      navigate('/login', { state: { from: { pathname: '/cart' } } });
      return;
    }

    setIsCheckingOut(true);
    try {
      const items = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }));
      const response = await orderService.checkout(items, distance);
      const { order_number, total_amount } = response.data;
      
      setPendingOrder({
        orderNumber: order_number || 'N/A',
        amount: total_amount || cartTotal,
      });
      
      clearCart();
    } catch (error: any) {
      console.error('Falha no checkout', error);
      const errorMessage = error.response?.data?.message;
      if (errorMessage === 'Insufficient stock') {
        addToast('error', 'Estoque insuficiente para um ou mais itens no carrinho.');
      } else {
        addToast('error', 'Falha ao finalizar a compra. Tente novamente.');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleScanSuccess = async (data: string) => {
    if (!pendingOrder) return;
    
    // Any QR data triggers confirmation for this simulation
    try {
      await orderService.confirmPayment(pendingOrder.orderNumber);
      setOrderConfirmed(true);
      setPendingOrder(null);
      addToast('success', 'Pagamento confirmado via QR Code!');
    } catch (error) {
      console.error('Falha ao confirmar pagamento', error);
      addToast('error', 'Falha ao processar pagamento lido.');
    }
  };

  if (orderConfirmed) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-4xl font-black text-creamy-800">Pagamento Recebido!</h1>
          <p className="text-creamy-500 max-w-md mx-auto">
            Seu pagamento foi confirmado via escaneamento. Estamos preparando seu pacote agora mesmo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/products">
              <Button variant="secondary">Continuar Comprando</Button>
            </Link>
            <Link to="/orders">
              <Button>Ver Meus Pedidos</Button>
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (cart.length === 0 && !pendingOrder) {
    return (
      <PageTransition>
        <div className="container mx-auto px-4 py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-creamy-100 text-creamy-400 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShoppingBag size={48} />
          </div>
          <h1 className="text-3xl font-bold text-creamy-600">Seu carrinho está vazio</h1>
          <p className="text-creamy-400">Parece que você ainda não adicionou nada ao seu carrinho.</p>
          <Link to="/products" className="inline-block pt-4">
            <Button>Começar a Comprar</Button>
          </Link>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-black text-creamy-800 mb-10 tracking-tight">Carrinho de Compras</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="card flex items-center p-4 gap-6 hover:shadow-md transition-shadow">
                <div className="w-24 h-24 bg-creamy-50 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-creamy-800 truncate">{item.name}</h3>
                  <p className="text-sm text-creamy-400 mb-2">{item.type}</p>
                  <span className="text-lg font-black text-creamy-700">
                    {formatCurrency(Number(item.price) - Number(item.discount || 0))}
                  </span>
                </div>

                <div className="flex items-center space-x-3 bg-creamy-50 p-2 rounded-2xl">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-creamy-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-creamy-800">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-creamy-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-creamy-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="card p-8 space-y-6">
              <h2 className="text-xl font-bold text-creamy-800 border-b border-creamy-100 pb-4">Resumo do Pedido</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-creamy-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-creamy-500">
                  <span>Frete (1.5 / km)</span>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="number" 
                      min="0"
                      className="w-20 p-1 border border-creamy-200 rounded text-right"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value) || 0)}
                      placeholder="Km"
                    />
                    <span>km</span>
                  </div>
                </div>
                <div className="flex justify-between text-creamy-500">
                  <span>Valor do Frete</span>
                  <span className="font-bold">{formatCurrency(freightTotal)}</span>
                </div>
                <div className="pt-4 border-t border-creamy-100 flex justify-between items-end">
                  <span className="text-lg font-bold text-creamy-800">Total</span>
                  <span className="text-3xl font-black text-creamy-700">{formatCurrency((cartTotal || 0) + freightTotal)}</span>
                </div>
              </div>
              <Button 
                className="w-full py-4 text-lg" 
                onClick={handleCheckout}
                isLoading={isCheckingOut}
              >
                Finalizar Compra <ArrowRight size={20} className="ml-2" />
              </Button>
            </div>
            
            <Link to="/products" className="block text-center text-sm font-semibold text-creamy-400 hover:text-creamy-600 transition-colors">
              Continuar Comprando
            </Link>
          </div>
        </div>

        {pendingOrder && (
          <QRScannerPayment
            isOpen={!!pendingOrder}
            onClose={() => setPendingOrder(null)}
            onScanSuccess={handleScanSuccess}
            orderNumber={pendingOrder.orderNumber}
            amount={pendingOrder.amount}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default Cart;
