import React, { useState, useEffect } from 'react';
import { BookOpen, ArrowRightLeft, Loader2 } from 'lucide-react';
import { erpService } from '../../services/erp';
import { useToast } from '../../contexts/ToastContext';

interface AccountingEntry {
  id: string;
  date: string;
  description: string;
  debit_account: string;
  credit_account: string;
  amount?: number | string;
  value?: number | string;
  total?: number | string;
  price?: number | string;
}

const Accounting: React.FC = () => {
  const [entries, setEntries] = useState<AccountingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await erpService.getAccountingEntries();
      const resData = response.data;
      
      let list: any[] = [];
      if (Array.isArray(resData)) {
        list = resData;
      } else if (resData && typeof resData === 'object') {
        list = resData.entries || resData.data || resData.items || resData.list || [];
        
        if (!Array.isArray(list) || list.length === 0) {
          const foundArray = Object.values(resData).find(v => Array.isArray(v));
          if (Array.isArray(foundArray)) list = foundArray as any[];
        }
      }
      
      setEntries(list);
    } catch (error) {
      console.error('Falha ao buscar lançamentos contábeis', error);
      addToast('error', 'Falha ao carregar lançamentos contábeis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEntryValue = (entry: AccountingEntry): number => {
    const val = entry.amount ?? entry.value ?? entry.total ?? entry.price ?? 0;
    return Number(val);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-creamy-500" size={48} />
        <p className="text-creamy-400 font-medium">Carregando livro razão...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Contabilidade</h1>
          <p className="text-creamy-400 mt-2 font-medium">Livro razão e lançamentos de auditoria</p>
        </div>
        <div className="w-12 h-12 bg-creamy-100 text-creamy-500 rounded-2xl flex items-center justify-center">
          <BookOpen size={24} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-creamy-50 border-b border-creamy-100">
                <th className="px-6 py-4 text-xs font-bold text-creamy-400 uppercase tracking-widest">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-creamy-400 uppercase tracking-widest">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-creamy-400 uppercase tracking-widest">Débito</th>
                <th className="px-6 py-4 text-xs font-bold text-creamy-400 uppercase tracking-widest">Crédito</th>
                <th className="px-6 py-4 text-xs font-bold text-creamy-400 uppercase tracking-widest text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-creamy-50">
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-creamy-400">
                    Nenhum lançamento contábil encontrado.
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={entry.id || index} className="hover:bg-creamy-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-creamy-600">
                      {entry.date ? new Date(entry.date).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-creamy-800">{entry.description || 'Sem descrição'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-tight">
                        {entry.debit_account || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold uppercase tracking-tight">
                        {entry.credit_account || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-creamy-800">
                        R$ {getEntryValue(entry).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Accounting;
