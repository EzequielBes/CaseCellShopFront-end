import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { productService } from '../services/products';
import { erpService } from '../services/erp';
import { Product } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/ui/Button';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const limit = 8;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts({ 
        page, 
        limit, 
        name: name || undefined, 
        type: type || undefined 
      });
      const data = response.data.products || response.data;
      const productsArray: Product[] = Array.isArray(data) ? data : [];
      
      // Attempt to enrich with stock if not present
      const enrichedProducts = await Promise.all(productsArray.map(async (p) => {
        if (p.stock !== undefined) return p;
        try {
          const stockRes = await erpService.getStock(p.id);
          return { ...p, stock: stockRes.data.quantity || 0 };
        } catch (e) {
          return { ...p, stock: 0 };
        }
      }));

      setProducts(enrichedProducts);
    } catch (error) {
      console.error('Falha ao buscar produtos', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, name, type]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 page-transition">
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

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 animate-in fade-in duration-500">
          <Loader2 className="animate-spin text-creamy-500" size={48} />
          <p className="text-creamy-400 font-medium">Preparando os melhores produtos para você...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div 
                key={product.id} 
                className="animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
              >
                <ProductCard product={product} />
              </div>
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
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-creamy-200 animate-in zoom-in-95 duration-500">
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
  );
};

export default Products;