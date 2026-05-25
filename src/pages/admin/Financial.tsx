import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { erpService } from '../../services/erp';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/format';

interface FinancialEntry {
  id: string;
  type: 'REVENUE' | 'EXPENSE' | 'CANCELLED';
  amount: number;
  description: string;
  date: string;
}

const Financial: React.FC = () => {
  const [history, setHistory] = useState<FinancialEntry[]>([]);
  const [apiBalance, setApiBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToast } = useToast();

  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    
    try {
      const historyRes = await erpService.getFinancialHistory();
      const historyData = historyRes.data || [];
      setHistory(historyData);
      
      const balanceRes = await erpService.getFinancialBalance();
      setApiBalance(balanceRes.data.balance || 0);
      
      if (isManual) addToast('info', 'Dados financeiros atualizados');
    } catch (error) {
      console.error('Falha ao buscar dados financeiros', error);
      addToast('error', 'Falha ao carregar dados financeiros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayBalance = useMemo(() => {
    if (apiBalance > 0) return apiBalance;
    
    return history.reduce((acc, entry) => {
      const val = Number(entry.amount || 0);
      if (entry.type === 'CANCELLED') return acc; 
      return entry.type === 'REVENUE' ? acc + val : acc - val;
    }, 0);
  }, [apiBalance, history]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-creamy-500" size={48} />
        <p className="text-creamy-400 font-medium">Carregando dados financeiros...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Financeiro</h1>
            <p className="text-creamy-400 mt-2 font-medium">Fluxo de caixa e saldo consolidado</p>
          </div>
          <button 
            onClick={() => fetchData(true)}
            className={`p-3 rounded-full bg-white border border-creamy-100 text-creamy-400 hover:text-creamy-600 hover:shadow-sm transition-all ${refreshing ? 'animate-spin' : ''}`}
            title="Sincronizar com ERP"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-creamy-100 shadow-sm flex items-center space-x-6 min-w-[240px]">
          <div className="w-12 h-12 bg-creamy-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-creamy-500/20">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Saldo Atual</p>
            <p className="text-3xl font-black text-creamy-800">{formatCurrency(displayBalance || 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <h2 className="text-xl font-bold text-creamy-800 flex items-center">
          <Calendar size={20} className="mr-2 text-creamy-400" />
          Histórico de Transações
        </h2>
        
        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-creamy-100">
              <p className="text-creamy-400">Nenhuma transação registrada.</p>
            </div>
          ) : (
            history.map((entry) => (
              <div key={entry.id} className={`card p-5 flex items-center justify-between gap-4 ${entry.type === 'CANCELLED' ? 'border-amber-100 bg-amber-50/20' : ''}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    entry.type === 'REVENUE' ? 'bg-green-50 text-green-500' : 
                    entry.type === 'CANCELLED' ? 'bg-amber-50 text-amber-500' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {entry.type === 'REVENUE' ? <TrendingUp size={20} /> : 
                     entry.type === 'CANCELLED' ? <XCircle size={20} /> :
                     <TrendingDown size={20} />}
                  </div>
                  <div>
                    <h3 className={`font-bold ${entry.type === 'CANCELLED' ? 'text-amber-700' : 'text-creamy-800'}`}>
                      {entry.description}
                      {entry.type === 'CANCELLED' && <span className="ml-2 text-[10px] bg-amber-100 px-1.5 py-0.5 rounded-lg uppercase tracking-tighter">Cancelada</span>}
                    </h3>
                    <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className={`text-xl font-black ${
                  entry.type === 'REVENUE' ? 'text-green-600' : 
                  entry.type === 'CANCELLED' ? 'text-amber-500' :
                  'text-red-600'
                }`}>
                  {entry.type === 'REVENUE' ? '+' : entry.type === 'CANCELLED' ? '' : '-'} {formatCurrency(entry.amount || 0)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Financial;
