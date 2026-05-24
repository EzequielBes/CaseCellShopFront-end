import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, Loader2, Search } from 'lucide-react';
import { erpService } from '../../services/erp';
import { orderService } from '../../services/orders';
import { useToast } from '../../contexts/ToastContext';

interface Invoice {
  id: string;
  order_id: string;
  order_number?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  amount?: number | string;
  value?: number | string;
  due_date?: string;
  created_at?: string;
  date?: string;
}

const Billing: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersRes = await orderService.getHistory();
      const orders = ordersRes.data || [];
      
      const invoiceList: Invoice[] = [];
      for (const order of orders) {
        try {
          const invRes = await erpService.getInvoice(order.id);
          const invData = invRes.data?.data || invRes.data;
          
          if (invData) {
            // Ensure order_number from order is used if missing in invoice
            invoiceList.push({
              ...invData,
              order_number: invData.order_number || order.order_number
            });
          }
        } catch (e) {
          // Skip if no invoice found
        }
      }
      setInvoices(invoiceList);
    } catch (error) {
      console.error('Falha ao buscar faturas', error);
      addToast('error', 'Falha ao carregar faturas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-creamy-500" size={48} />
        <p className="text-creamy-400 font-medium">Carregando faturamento...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-creamy-800 tracking-tight">Faturamento</h1>
          <p className="text-creamy-400 mt-2 font-medium">Gestão de faturas e recebíveis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {invoices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-creamy-100">
            <p className="text-creamy-400">Nenhuma fatura encontrada.</p>
          </div>
        ) : (
          invoices.map((invoice, index) => {
            const displayValue = Number(invoice.amount ?? invoice.value ?? 0);
            const displayDate = invoice.created_at || invoice.date;
            
            return (
              <div key={invoice.id || index} className="card p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 bg-creamy-50 text-creamy-500 rounded-xl flex items-center justify-center">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-creamy-800">Fatura #{invoice.order_number || 'S/N'}</h3>
                    <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest">
                      Gerada em {formatDate(displayDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-8">
                  {invoice.status === 'PENDING' && invoice.due_date && (
                    <div className="text-right">
                      <p className="text-[10px] text-amber-600 uppercase font-black tracking-widest">Vencimento</p>
                      <p className="text-sm font-bold text-amber-700">{formatDate(invoice.due_date)}</p>
                    </div>
                  )}
                  
                  <div className="text-right">
                    <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Status</p>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border shadow-sm ${
                      invoice.status === 'PAID' ? 'bg-green-50 border-green-100 text-green-700' : 
                      invoice.status === 'PENDING' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                      'bg-gray-50 border-gray-100 text-gray-700'
                    }`}>
                      {invoice.status === 'PAID' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      <span className="text-xs font-bold uppercase">{invoice.status}</span>
                    </div>
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="text-xs text-creamy-400 uppercase font-bold tracking-widest mb-1">Valor</p>
                    <p className="text-xl font-black text-creamy-800">R$ {displayValue.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Billing;
