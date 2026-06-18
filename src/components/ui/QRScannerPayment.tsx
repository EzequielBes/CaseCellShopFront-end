import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { Camera, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import Modal from './Modal';
import { formatCurrency } from '../../utils/format';

interface QRScannerPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  orderNumber: string;
  amount: number;
}

const QRScannerPayment: React.FC<QRScannerPaymentProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  orderNumber,
  amount,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const handleScan = (data: any) => {
    if (data && isScanning) {
      setIsScanning(false);
      onScanSuccess(data.text);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError('Não foi possível acessar a câmera. Verifique as permissões.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Escanear para Pagar"
      hideFooter
    >
      <div className="space-y-6 flex flex-col items-center text-center">
        <div className="w-full aspect-square max-w-[300px] relative overflow-hidden rounded-3xl border-4 border-creamy-100 bg-black">
          {isScanning && !error ? (
            <QrScanner
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: '100%' }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-creamy-400 p-6">
              {error ? (
                <>
                  <XCircle size={48} className="text-red-400 mb-2" />
                  <p className="text-sm font-medium">{error}</p>
                </>
              ) : (
                <>
                  <CheckCircle size={48} className="text-green-400 mb-2" />
                  <p className="text-sm font-medium">Pagamento detectado!</p>
                </>
              )}
            </div>
          )}
          
          {/* Scanner Overlay */}
          {isScanning && !error && (
            <div className="absolute inset-0 border-2 border-creamy-500/50 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-creamy-500 animate-scan"></div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-bold text-creamy-400 uppercase tracking-widest leading-none">Aguardando Leitura</p>
          <h3 className="text-2xl font-black text-creamy-800">{formatCurrency(amount)}</h3>
          <p className="text-xs text-creamy-500">Pedido #{orderNumber}</p>
        </div>

        <div className="bg-creamy-50 p-4 rounded-2xl border border-creamy-100 w-full">
          <p className="text-xs text-creamy-600 font-medium">
            Aponte sua câmera para o QR Code de pagamento para confirmar o pedido automaticamente.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="text-sm font-bold text-creamy-400 hover:text-creamy-600 transition-colors"
        >
          Cancelar e Voltar
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </Modal>
  );
};

export default QRScannerPayment;
