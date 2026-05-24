import React, { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Minus, Search, Loader2, Save } from 'lucide-react';
import { erpService } from '../../services/erp';
import { productService } from '../../services/products';
import { Product } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import Button from '../../components/ui/Button';

const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
  const [adjustments, setAdjustments] = useState<Record<string, string>>({}); // Store as strings
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodResponse = await productService.getProducts({ limit: 100 });
      const prods = prodResponse.data.products || prodResponse.data;
      const productsArray = Array.isArray(prods) ? prods : [];
      setProducts(productsArray);

      const levels: Record<string, number> = {};
      for (const p of productsArray) {
        try {
          const stockRes = await erpService.getStock(p.id);
          levels[p.id] = stockRes.data.quantity || 0;
        } catch (e) {
          levels[p.id] = 0;
        }
      }
      setStockLevels(levels);
    } catch (error) {
      console.error('Falha ao buscar estoque', error);
      addToast('error', 'Falha ao carregar dados de estoque');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveStock = async (productId: string) => {
    const amountStr = adjustments[productId];
    const amount = parseInt(amountStr || '0');
    if (isNaN(amount) || amount === 0) return;

    setAdjusting(productId);
    try {
      if (amount > 0) {
        await erpService.addStock({ product_id: productId, quantity: amount });
      } else {
        await erpService.removeStock({ product_id: productId, quantity: Math.abs(amount) });
      }
      
      setStockLevels(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) + amount
      }));
      
      setAdjustments(prev => ({ ...prev, [productId]: '' }));
      addToast('success', 'Estoque ajustado com sucesso');
    } catch (error) {
      console.error('Falha ao ajustar estoque', error);
      addToast('error', 'Falha ao ajustar estoque');
    } finally {
      setAdjusting(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-creamy-500" size={48} />
        <p className="text-creamy-400 font-medium">Carregando inventário...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Gestão de Estoque</h1>
          <p className="text-creamy-400 mt-2 font-medium">Monitore e ajuste o nível de produtos disponíveis</p>
        </div>
        
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-creamy-300" size={18} />
          <input
            type="text"
            placeholder="Buscar por produto..."
            className="input pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => {
          const stock = stockLevels[product.id] || 0;
          const isLow = stock < 10;
          const adjustment = adjustments[product.id] || '';
          
          return (
            <div key={product.id} className="card p-6 flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center space-x-6 w-full lg:w-auto">
                <div className="w-16 h-16 bg-creamy-50 rounded-xl overflow-hidden flex-shrink-0 border border-creamy-100">
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-bold text-creamy-800 text-lg">{product.name}</h3>
                  <p className="text-sm text-creamy-400">{product.type}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8 w-full lg:w-auto justify-between lg:justify-end">
                <div className="text-center md:text-right">
                  <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Qtd Atual</p>
                  <div className="flex items-center space-x-2">
                    <span className={`text-2xl font-black ${isLow ? 'text-red-500' : 'text-creamy-700'}`}>
                      {stock}
                    </span>
                    {isLow && (
                      <div className="bg-red-50 text-red-500 p-1 rounded-lg" title="Estoque Baixo">
                        <AlertTriangle size={16} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 bg-creamy-50 p-2 rounded-2xl border border-creamy-100">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-bold text-creamy-400 uppercase tracking-tighter px-2">Ajustar (+/-)</p>
                    <input 
                      type="text"
                      value={adjustment}
                      onChange={(e) => setAdjustments(prev => ({ ...prev, [product.id]: e.target.value }))}
                      placeholder="0"
                      className="w-24 bg-transparent border-0 focus:ring-0 text-center font-black text-creamy-800 placeholder:text-creamy-200"
                    />
                  </div>
                  
                  <Button 
                    onClick={() => handleSaveStock(product.id)}
                    disabled={adjusting === product.id || adjustment === '' || adjustment === '0'}
                    isLoading={adjusting === product.id}
                    className="p-3 rounded-xl h-11"
                    title="Salvar Ajuste"
                  >
                    <Save size={20} />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Inventory;
