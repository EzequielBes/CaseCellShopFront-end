import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CheckCircle, QrCode } from 'lucide-react';
import Modal from './Modal';
import { formatCurrency } from '../../utils/format';
import Button from './Button';

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
  const [isPaid, setIsPaid] = useState(false);

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setTimeout(() => {
      onScanSuccess('payment-confirmed');
    }, 1500);
  };

  // Generates a simple text payload to be read by the mobile camera
  const qrData = `Dados do Pedido
Pedido: #${orderNumber}
Valor Total: ${formatCurrency(amount)}
Status: Aguardando Confirmação`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pagamento do Pedido"
      hideFooter
    >
      <div className="space-y-6 flex flex-col items-center text-center">
        {!isPaid ? (
          <>
            <div className="w-full aspect-square max-w-[250px] relative overflow-hidden rounded-3xl border-4 border-creamy-100 bg-white p-4 flex items-center justify-center">
              <QRCodeSVG value={qrData} size={200} />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-bold text-creamy-400 uppercase tracking-widest leading-none">Aguardando Pagamento</p>
              <h3 className="text-2xl font-black text-creamy-800">{formatCurrency(amount)}</h3>
              <p className="text-xs text-creamy-500">Pedido #{orderNumber}</p>
            </div>

            <div className="bg-creamy-50 p-4 rounded-2xl border border-creamy-100 w-full">
              <p className="text-xs text-creamy-600 font-medium mb-4">
                Abra o aplicativo do seu banco e escaneie o QR Code acima para pagar.
              </p>
              
              {/* Simulation button since there is no actual webhook */}
              <Button onClick={handleSimulatePayment} variant="secondary" className="w-full text-sm py-2">
                Simular Pagamento (Teste)
              </Button>
            </div>

            <button 
              onClick={onClose}
              className="text-sm font-bold text-creamy-400 hover:text-creamy-600 transition-colors"
            >
              Cancelar e Voltar
            </button>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center">
            <CheckCircle size={64} className="text-green-500 mb-4 animate-bounce" />
            <h3 className="text-2xl font-black text-creamy-800 mb-2">Pagamento Confirmado!</h3>
            <p className="text-creamy-500">Redirecionando...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QRScannerPayment;
