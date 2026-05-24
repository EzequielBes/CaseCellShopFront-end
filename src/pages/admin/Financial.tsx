import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Loader2 } from 'lucide-react';
import { erpService } from '../../services/erp';
import { useToast } from '../../contexts/ToastContext';

interface FinancialEntry {
  id: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
  description: string;
  date: string;
}

const Financial: React.FC = () => {
  const [history, setHistory] = useState<FinancialEntry[]>([]);
  const [apiBalance, setApiBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const historyRes = await erpService.getFinancialHistory();
      const historyData = historyRes.data || [];
      setHistory(historyData);
      
      const balanceRes = await erpService.getFinancialBalance();
      setApiBalance(balanceRes.data.balance || 0);
    } catch (error) {
      console.error('Falha ao buscar dados financeiros', error);
      addToast('error', 'Falha ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayBalance = useMemo(() => {
    if (apiBalance > 0) return apiBalance;
    
    return history.reduce((acc, entry) => {
      const val = Number(entry.amount || 0);
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
        <div>
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Financeiro</h1>
          <p className="text-creamy-400 mt-2 font-medium">Fluxo de caixa e saldo consolidado</p>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-creamy-100 shadow-sm flex items-center space-x-6 min-w-[240px]">
          <div className="w-12 h-12 bg-creamy-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-creamy-500/20">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Saldo Atual</p>
            <p className="text-3xl font-black text-creamy-800">R$ {Number(displayBalance || 0).toFixed(2)}</p>
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
              <div key={entry.id} className="card p-5 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    entry.type === 'REVENUE' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                  }`}>
                    {entry.type === 'REVENUE' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div>
                    <h3 className="font-bold text-creamy-800">{entry.description}</h3>
                    <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest">
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className={`text-xl font-black ${
                  entry.type === 'REVENUE' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {entry.type === 'REVENUE' ? '+' : '-'} R$ {Number(entry.amount || 0).toFixed(2)}
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
