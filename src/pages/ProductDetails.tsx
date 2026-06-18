import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, ArrowLeft, ShieldCheck, Truck, RefreshCw, Box, Tag } from 'lucide-react';
import { productService } from '../services/products';
import { useCart, Product } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { formatCurrency } from '../utils/format';
import Button from '../components/ui/Button';
import PageTransition from '../components/ui/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productService.getProduct(id!);
      return response.data as Product;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      addToast('success', `${product.name} adicionado ao carrinho!`);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-creamy-800">Produto não encontrado</h2>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/products')}>
          Voltar para Loja
        </Button>
      </div>
    );
  }

  const price = Number(product.price);
  const discount = Number(product.discount || 0);
  const finalPrice = price - discount;
  const images = product.images?.length > 0 ? product.images : ['https://via.placeholder.com/600?text=Sem+Imagem'];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-creamy-400 hover:text-creamy-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 transition-transform group-hover:-translate-x-1" />
          Voltar
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="aspect-square rounded-[2.5rem] overflow-hidden bg-creamy-50 border-4 border-creamy-100 shadow-sm relative group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={selectedImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              
              {discount > 0 && (
                <div className="absolute top-6 left-6 bg-creamy-500 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-xl flex items-center">
                  <Tag size={18} className="mr-2" />
                  OFERTA ESPECIAL
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border-4 transition-all ${
                      selectedImage === index ? 'border-creamy-500 shadow-md scale-95' : 'border-transparent hover:border-creamy-200'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${index}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <span className="inline-block px-4 py-1 bg-creamy-100 text-creamy-600 text-xs font-black rounded-full uppercase tracking-widest mb-4">
                {product.type}
              </span>
              <h1 className="text-5xl font-black text-creamy-800 leading-tight tracking-tight">
                {product.name}
              </h1>
            </div>

            <div className="space-y-4">
              <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-creamy-700">
                  {formatCurrency(finalPrice)}
                </span>
                {discount > 0 && (
                  <span className="text-xl text-creamy-300 line-through font-bold mb-1">
                    {formatCurrency(price)}
                  </span>
                )}
              </div>
              
              {product.stock !== undefined && (
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-bold text-creamy-500 uppercase tracking-widest">
                    {product.stock > 0 ? `${product.stock} unidades em estoque` : 'Produto Esgotado'}
                  </span>
                </div>
              )}
            </div>

            <p className="text-lg text-creamy-500 leading-relaxed max-w-xl">
              {product.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-creamy-100">
              <div className="flex items-center gap-4 text-creamy-600">
                <div className="w-10 h-10 bg-creamy-50 rounded-xl flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-creamy-400">Entrega Grátis</p>
                  <p className="text-sm font-bold">Todo o Brasil</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-creamy-600">
                <div className="w-10 h-10 bg-creamy-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-creamy-400">Garantia Stack</p>
                  <p className="text-sm font-bold">12 meses direto</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                onClick={handleAddToCart}
                disabled={product.stock !== undefined && product.stock <= 0}
                className="flex-1 py-5 text-lg rounded-[1.5rem] shadow-xl shadow-creamy-500/20"
              >
                <ShoppingCart size={24} className="mr-3" /> Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ProductDetails;
