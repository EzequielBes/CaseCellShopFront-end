import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    addToast('info', 'Sessão encerrada');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-creamy-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-creamy-800 tracking-tighter italic">
          STACK<span className="text-creamy-500 font-light not-italic">SHOP</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link 
            to="/products" 
            className={`font-medium transition-colors ${isActive('/products') ? 'text-creamy-900 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-700 hover:text-creamy-900'}`}
          >
            Produtos
          </Link>
          
          {isAuthenticated && (
            <Link 
              to="/orders" 
              className={`font-medium transition-colors flex items-center ${isActive('/orders') ? 'text-creamy-900 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-700 hover:text-creamy-900'}`}
            >
              <Package size={18} className="mr-1" />
              Pedidos
            </Link>
          )}

          {isAdmin && (
            <div className="hidden lg:flex items-center space-x-4 border-l border-creamy-200 pl-6">
              <Link 
                to="/admin/products" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/admin/products') ? 'text-creamy-800 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-400 hover:text-creamy-800'}`}
              >
                Produtos
              </Link>
              <Link 
                to="/admin/inventory" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/admin/inventory') ? 'text-creamy-800 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-400 hover:text-creamy-800'}`}
              >
                Estoque
              </Link>
              <Link 
                to="/admin/billing" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/admin/billing') ? 'text-creamy-800 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-400 hover:text-creamy-800'}`}
              >
                Faturamento
              </Link>
              <Link 
                to="/admin/financial" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/admin/financial') ? 'text-creamy-800 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-400 hover:text-creamy-800'}`}
              >
                Financeiro
              </Link>
              <Link 
                to="/admin/accounting" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/admin/accounting') ? 'text-creamy-800 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-400 hover:text-creamy-800'}`}
              >
                Contábil
              </Link>
              <Link 
                to="/admin/orders" 
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isActive('/admin/orders') ? 'text-creamy-800 underline underline-offset-4 decoration-2 decoration-creamy-500' : 'text-creamy-400 hover:text-creamy-800'}`}
              >
                Compras
              </Link>
            </div>
          )}

          <Link to="/cart" className={`relative p-2 transition-colors ${isActive('/cart') ? 'text-creamy-900' : 'text-creamy-700 hover:text-creamy-900'}`}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-creamy-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4 border-l border-creamy-200 pl-6">
              <div className="flex items-center text-sm text-creamy-600">
                <User size={18} className="mr-2" />
                <span className="hidden sm:inline">{user?.username || user?.email}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-creamy-400 hover:text-red-500 transition-colors"
                title="Sair"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className={`font-medium transition-colors ${isActive('/login') ? 'text-creamy-900' : 'text-creamy-700 hover:text-creamy-900'}`}>
                Entrar
              </Link>
              <Link to="/signup" className="btn-primary py-1.5 px-4 text-sm">
                Cadastrar
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
