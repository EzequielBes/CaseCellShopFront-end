import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    addToast('info', 'Sessão encerrada');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-creamy-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-creamy-800 tracking-tighter italic">
          STACK<span className="text-creamy-500 font-light not-italic">SHOP</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link to="/products" className="text-creamy-700 hover:text-creamy-900 font-medium transition-colors">
            Produtos
          </Link>
          
          {isAuthenticated && (
            <Link to="/orders" className="text-creamy-700 hover:text-creamy-900 font-medium transition-colors flex items-center">
              <Package size={18} className="mr-1" />
              Pedidos
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin/products" className="text-creamy-700 hover:text-creamy-900 font-medium transition-colors flex items-center">
              <ShieldCheck size={18} className="mr-1" />
              Painel
            </Link>
          )}

          <Link to="/cart" className="relative p-2 text-creamy-700 hover:text-creamy-900 transition-colors">
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
              <Link to="/login" className="text-creamy-700 hover:text-creamy-900 font-medium transition-colors">
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