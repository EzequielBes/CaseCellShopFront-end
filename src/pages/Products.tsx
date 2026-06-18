import React, { useState } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { productService } from '../services/products';
import { Product } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import PageTransition from '../components/ui/PageTransition';
import { Skeleton } from '../components/ui/Skeleton';

const Products: React.FC = () => {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const limit = 8;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', { page, name, type }],
    queryFn: async () => {
      const response = await productService.getProducts({ 
        page, 
        limit, 
        name: name || undefined, 
        type: type || undefined 
      });
      const data = response.data.products || response.data;
      return Array.isArray(data) ? data : [];
    },
    placeholderData: (previousData) => previousData,
  });

  const products = data || [];

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col md:flex-row gap-4 items-end justify-between">
          <div className="w-full md:max-w-md">
            <h1 className="text-4xl font-black text-creamy-800 mb-6 tracking-tight">
              Nossos Produtos
            </h1>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-creamy-300 group-focus-within:text-creamy-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Buscar produtos por nome..."
                className="input pl-10 h-12"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div className="w-full md:w-auto flex gap-4">
            <div className="flex-1 md:w-48">
              <label className="text-xs font-bold text-creamy-400 uppercase tracking-widest mb-1 block">
                Filtrar por Categoria
              </label>
              <div className="relative group">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-creamy-300 group-focus-within:text-creamy-500 transition-colors" size={16} />
                <select
                  className="input pl-10 appearance-none h-12 bg-white"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">Todas as Categorias</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Casa">Casa</option>
                  <option value="Livros">Livros</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-3xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-1/4" />
                  <Skeleton className="h-10 w-10 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-red-50 rounded-3xl border-2 border-dashed border-red-200">
            <p className="text-xl text-red-600 font-medium">Ocorreu um erro ao carregar os produtos.</p>
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className="flex items-center justify-center space-x-4 pt-8">
              <Button
                variant="secondary"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-3"
              >
                <ChevronLeft size={20} />
              </Button>
              <span className="text-creamy-700 font-bold">Página {page}</span>
              <Button
                variant="secondary"
                onClick={() => setPage(page + 1)}
                disabled={products.length < limit}
                className="p-3"
              >
                <ChevronRight size={20} />
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-creamy-200">
            <p className="text-xl text-creamy-400 font-medium">Nenhum produto encontrado.</p>
            <Button 
              variant="secondary" 
              className="mt-4"
              onClick={() => { setName(''); setType(''); setPage(1); }}
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Products;
