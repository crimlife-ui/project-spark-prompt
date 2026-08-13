import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, visible }) => {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-emerald-500/30 bg-[#0c1a14] px-4 py-3 text-sm font-bold text-emerald-300 shadow-2xl backdrop-blur-md animate-bounce">
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      <span>{message}</span>
    </div>
  );
};
