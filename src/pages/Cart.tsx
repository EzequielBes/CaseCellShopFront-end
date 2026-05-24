import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { orderService } from '../services/orders';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState<{ orderNumber: string, paymentMethod?: string } | null>(null);

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
      const response = await orderService.checkout(items);
      const { order_number, forma_de_pagamento } = response.data;
      
      const orderNumber = order_number || 'N/A';
      
      // ERP flow trigger: simulate payment confirmation
      await orderService.confirmPayment(orderNumber);
      
      setOrderConfirmed({ 
        orderNumber, 
        paymentMethod: forma_de_pagamento 
      });
      clearCart();
      addToast('success', 'Compra realizada com sucesso!');
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

  if (orderConfirmed) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShoppingBag size={48} />
        </div>
        <h1 className="text-4xl font-black text-creamy-800">Pedido Confirmado!</h1>
        <div className="max-w-md mx-auto space-y-4 text-center">
          <p className="text-creamy-500">
            Obrigado pela sua compra. Seu pedido <span className="font-bold text-creamy-700">#{orderConfirmed.orderNumber}</span> foi realizado com sucesso.
          </p>
          {orderConfirmed.paymentMethod && (
            <div className="bg-creamy-50 p-6 rounded-3xl border border-creamy-100 shadow-sm animate-in zoom-in-95 duration-500">
              <p className="text-xs font-bold text-creamy-400 uppercase tracking-widest mb-2">Forma de Pagamento (PIX)</p>
              <p className="font-mono text-sm break-all bg-white p-3 rounded-xl border border-creamy-100 text-creamy-800 select-all">
                {orderConfirmed.paymentMethod}
              </p>
              <p className="text-[10px] text-creamy-400 mt-2 italic">Acesse seu banco para realizar o pagamento.</p>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Link to="/products">
            <Button variant="secondary">Continuar Comprando</Button>
          </Link>
          <Link to="/orders">
            <Button>Ver Histórico de Pedidos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
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
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-creamy-800 mb-10 tracking-tight">Carrinho de Compras</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="card flex items-center p-4 gap-6">
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
              <div className="flex justify-between text-creamy-500">
                <span>Frete</span>
                <span className="text-green-500 font-bold uppercase text-xs">Grátis</span>
              </div>
              <div className="pt-4 border-t border-creamy-100 flex justify-between items-end">
                <span className="text-lg font-bold text-creamy-800">Total</span>
                <span className="text-3xl font-black text-creamy-700">{formatCurrency(cartTotal || 0)}</span>
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
    </div>
  );
};

export default Cart;
