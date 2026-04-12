import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  title?: string;
}

export const Modal = ({ children, onClose, title }: ModalProps) => (
  <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        {title && <h2 className="text-xl font-bold text-white uppercase tracking-tight">{title}</h2>}
        <button 
          onClick={onClose} 
          className="text-slate-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div>
        {children}
      </div>
    </div>
  </div>
);