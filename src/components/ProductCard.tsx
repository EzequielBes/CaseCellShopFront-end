import React, { useState } from 'react';
import { ShoppingCart, Tag, Box, ExternalLink } from 'lucide-react';
import { Product, useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/format';
import Button from './ui/Button';
import Modal from './ui/Modal';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const discountedPrice = price - discount;

  const handleConfirmAdd = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(product);
    addToast('success', `${product.name} adicionado ao carrinho!`);
    setIsModalOpen(false);
  };

  const getStockBadge = () => {
    if (product.stock === undefined) return null;
    
    if (product.stock <= 0) {
      return (
        <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md uppercase">
          Esgotado
        </span>
      );
    }
    
    if (product.stock < 10) {
      return (
        <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md uppercase">
          Últimas {product.stock} un.
        </span>
      );
    }

    return (
      <span className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-md uppercase">
        Em Estoque ({product.stock})
      </span>
    );
  };

  return (
    <>
      <Link to={`/product/${product.id}`} className="block h-full">
        <motion.div 
          whileHover={{ y: -8 }}
          className="card group h-full flex flex-col"
        >
          <div className="relative aspect-square overflow-hidden bg-creamy-100">
            <img
              src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300?text=Sem+Imagem'}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white text-charcoal p-3 rounded-full shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform">
                <ExternalLink size={20} />
              </span>
            </div>
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-creamy-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center shadow-md">
                <Tag size={12} className="mr-1" />
                POUPE {formatCurrency(discount)}
              </div>
            )}
            {getStockBadge()}
          </div>
          
          <div className="p-5 space-y-3 flex-grow flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-creamy-400 uppercase tracking-widest">
                  {product.type}
                </span>
                <h3 className="text-lg font-bold text-creamy-800 leading-tight">
                  {product.name}
                </h3>
              </div>
            </div>
            
            <p className="text-sm text-creamy-500 line-clamp-2 flex-grow">
              {product.description}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                {discount > 0 && (
                  <span className="text-xs text-creamy-400 line-through">
                    {formatCurrency(price)}
                  </span>
                )}
                <span className="text-xl font-black text-creamy-700">
                  {formatCurrency(discountedPrice)}
                </span>
              </div>
              
              <Button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="p-3 rounded-2xl"
                title="Adicionar ao carrinho"
                disabled={product.stock !== undefined && product.stock <= 0}
              >
                <ShoppingCart size={20} />
              </Button>
            </div>
          </div>
        </motion.div>
      </Link>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={() => handleConfirmAdd()}
        title="Confirmar Adição"
        confirmText="Adicionar ao Carrinho"
        cancelText="Voltar"
      >
        <div className="space-y-4">
          <p>Você deseja adicionar <strong>{product.name}</strong> ao seu carrinho de compras?</p>
          <div className="flex items-center justify-between p-3 bg-creamy-50 rounded-xl">
            <span className="text-sm font-medium text-creamy-600">Preço Unitário</span>
            <span className="font-black text-creamy-800">{formatCurrency(discountedPrice)}</span>
          </div>
          {product.stock !== undefined && (
            <p className="text-xs text-creamy-400 flex items-center">
              <Box size={14} className="mr-1" /> Disponível: {product.stock} unidades
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
