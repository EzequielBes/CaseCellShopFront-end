import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, CheckCircle, Copy, Loader2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { formatCurrency } from '../../utils/format';
import { useToast } from '../../contexts/ToastContext';

interface PaymentSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderNumber: string;
  amount: number;
  pixCode: string;
  isProcessing: boolean;
}

const PaymentSimulator: React.FC<PaymentSimulatorProps> = ({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  amount,
  pixCode,
  isProcessing,
}) => {
  const { addToast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    addToast('info', 'Código PIX copiado!');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulador de Pagamento PIX"
      hideFooter
    >
      <div className="space-y-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-creamy-100 text-creamy-600 rounded-2xl flex items-center justify-center animate-bounce">
          <CreditCard size={32} />
        </div>

        <div>
          <h3 className="text-xl font-black text-creamy-800">Escaneie o QR Code</h3>
          <p className="text-sm text-creamy-400">Pedido #{orderNumber}</p>
        </div>

        <div className="p-4 bg-white border-4 border-creamy-100 rounded-3xl shadow-inner">
          <QRCodeSVG 
            value={pixCode} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-center p-4 bg-creamy-50 rounded-2xl border border-creamy-100">
            <span className="text-sm font-bold text-creamy-400 uppercase tracking-widest">Valor Total</span>
            <span className="text-2xl font-black text-creamy-800">{formatCurrency(amount)}</span>
          </div>

          <button
            onClick={handleCopyCode}
            className="w-full flex items-center justify-center gap-2 p-3 text-sm font-bold text-creamy-500 hover:text-creamy-700 transition-colors"
          >
            <Copy size={16} /> Copia e Cola PIX
          </button>
        </div>

        <div className="w-full pt-4 border-t border-creamy-100">
          <Button
            onClick={onConfirm}
            isLoading={isProcessing}
            className="w-full py-4 text-lg"
          >
            <CheckCircle size={20} className="mr-2" /> Simular Pagamento
          </Button>
          <p className="text-[10px] text-creamy-300 mt-4 italic">
            *Este é um ambiente de testes. O pagamento será confirmado via WebSocket.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentSimulator;
