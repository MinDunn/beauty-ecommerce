import type { ReactNode } from "react";
import { X } from "lucide-react";

export const Modal = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl relative">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="mt-2">
        {children}
      </div>
    </div>
  </div>
);