import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Navigation } from 'lucide-react';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName: string;
  address: string;
  lat?: number;
  lng?: number;
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, storeName, address, lat, lng }) => {
  if (!isOpen) return null;

  const mapUrl = lat && lng 
    ? `https://www.google.com/maps?q=${lat},${lng}&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(storeName + " " + address)}&output=embed`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-5xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh]"
        >
          {/* Map Area */}
          <div className="flex-1 relative bg-slate-100">
             <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={storeName}
              />
          </div>

          {/* Info Sidebar */}
          <div className="w-full md:w-80 bg-white p-8 flex flex-col border-l border-gray-100">
             <div className="flex justify-end mb-8 md:absolute md:top-6 md:right-6">
                <button 
                  onClick={onClose}
                  className="p-3 bg-gray-100 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-inner group"
                >
                  <X size={20} />
                </button>
             </div>

             <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <MapPin size={12} />
                  <span>Vị trí cửa hàng</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 uppercase leading-tight mb-6">
                   {storeName}
                </h2>
                
                <div className="space-y-6">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Địa chỉ</p>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed">{address}</p>
                   </div>

                   <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 bg-primary-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 mt-8"
                   >
                     <Navigation size={16} />
                     <span>Chỉ đường</span>
                   </a>
                </div>
             </div>

             <div className="mt-12 pt-8 border-t border-gray-100">
                <p className="text-[10px] font-bold text-slate-400 italic">© Glowzy Beauty Experience</p>
             </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapModal;
