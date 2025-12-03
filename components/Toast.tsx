
import React, { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-24 right-6 z-[1000] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; removeToast: (id: string) => void }> = ({ toast, removeToast }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const isError = toast.type === 'error';

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md transform transition-all duration-300 animate-slide-in
        ${isError 
          ? 'bg-red-50/90 text-red-600 border border-red-100' 
          : 'bg-white/90 text-slate-800 border border-slate-100'}
      `}
      role="alert"
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
        ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
      `}>
        {isError ? <X size={16} strokeWidth={3} /> : <Check size={16} strokeWidth={3} />}
      </div>
      <span className="font-semibold text-sm">{toast.message}</span>
    </div>
  );
};

export default Toast;
