import React, { useState } from 'react';
import { ShoppingCart, Tag } from 'lucide-react';
import { Product, useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import Button from './ui/Button';
import Modal from './ui/Modal';

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

  const handleConfirmAdd = () => {
    addToCart(product);
    addToast('success', `${product.name} adicionado ao carrinho!`);
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="card group">
        <div className="relative aspect-square overflow-hidden bg-creamy-100">
          <img
            src={product.images && product.images[0] ? product.images[0] : 'https://via.placeholder.com/300?text=Sem+Imagem'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-creamy-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center shadow-md">
              <Tag size={12} className="mr-1" />
              POUPE R$ {discount.toFixed(2)}
            </div>
          )}
        </div>
        
        <div className="p-5 space-y-3">
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
          
          <p className="text-sm text-creamy-500 line-clamp-2 min-h-[2.5rem]">
            {product.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              {discount > 0 && (
                <span className="text-xs text-creamy-400 line-through">
                  R$ {price.toFixed(2)}
                </span>
              )}
              <span className="text-xl font-black text-creamy-700">
                R$ {discountedPrice.toFixed(2)}
              </span>
            </div>
            
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="p-3 rounded-2xl"
              title="Adicionar ao carrinho"
            >
              <ShoppingCart size={20} />
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmAdd}
        title="Confirmar Adição"
        confirmText="Adicionar ao Carrinho"
        cancelText="Voltar"
      >
        <p>Você deseja adicionar <strong>{product.name}</strong> ao seu carrinho de compras?</p>
        <p className="text-sm mt-2 text-creamy-400">Preço: R$ {discountedPrice.toFixed(2)}</p>
      </Modal>
    </>
  );
};

export default ProductCard;