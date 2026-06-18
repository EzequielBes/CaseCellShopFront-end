import React from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  hideFooter?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  hideFooter = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="card w-full max-w-md p-8 space-y-6 animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-creamy-800">{title}</h2>
          <button onClick={onClose} className="text-creamy-300 hover:text-creamy-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="text-creamy-600">
          {children}
        </div>

        {!hideFooter && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              {cancelText}
            </Button>
            {onConfirm && (
              <Button onClick={onConfirm} className="flex-1">
                {confirmText}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
