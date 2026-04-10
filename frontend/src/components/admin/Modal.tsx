import type { ReactNode } from "react";

export const Modal = ({ children, onClose }: { children: ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
    <div className="bg-white p-6 rounded-xl w-96">
      {children}
      <button onClick={onClose} className="mt-4 text-sm text-gray-500">Đóng</button>
    </div>
  </div>
);