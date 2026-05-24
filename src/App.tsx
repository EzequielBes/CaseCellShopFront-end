import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AppRoutes from './routes/AppRoutes';
import Header from './components/Header';
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <AppRoutes />
              </main>
              <footer className="py-10 border-t border-creamy-100 bg-white text-center">
                <p className="text-sm text-creamy-400 font-medium">
                  © 2026 StackShop. Tecnologia e estilo em um só lugar.
                </p>
              </footer>            </div>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;