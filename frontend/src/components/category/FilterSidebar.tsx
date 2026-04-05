import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FilterSectionProps {
  title: string;
  items: { id: string; label: string; count?: number }[];
  defaultOpen?: boolean;
}

const FilterSection = ({ title, items, defaultOpen = true }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 py-5">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left font-bold text-gray-900 group outline-none"
      >
        <span className="uppercase text-xs font-black tracking-widest group-hover:text-primary-500 transition-colors">{title}</span>
        <div className="bg-gray-50 p-1.5 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      
      <div className={cn("mt-4 space-y-3.5 overflow-hidden transition-all duration-300 origin-top", isOpen ? "max-h-[500px] opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-0")}>
        {items.map((item) => (
          <label key={item.id} className="flex items-center group cursor-pointer">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer w-5 h-5 appearance-none border-2 border-gray-200 rounded-lg checked:bg-primary-500 checked:border-primary-500 hover:border-primary-300 transition-colors cursor-pointer outline-none" />
              <div className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-sm bg-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none"></div>
            </div>
            <span className="ml-3 text-sm font-medium text-gray-700 group-hover:text-primary-600 transition-colors">
              {item.label}
            </span>
            {item.count !== undefined && (
              <span className="ml-auto text-xs font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-lg">
                {item.count}
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
};

export const FilterSidebar = ({ isMobileOpen, setIsMobileOpen }: { isMobileOpen: boolean, setIsMobileOpen: (v: boolean) => void }) => {
  const priceFilters = [
    { id: 'p1', label: 'Dưới 100.000 đ' },
    { id: 'p2', label: '100.000 đ - 300.000 đ' },
    { id: 'p3', label: '300.000 đ - 500.000 đ' },
    { id: 'p4', label: 'Trên 500.000 đ' },
  ];

  const brandFilters = [
    { id: 'b1', label: 'L\'Oréal Paris', count: 125 },
    { id: 'b2', label: 'La Roche-Posay', count: 84 },
    { id: 'b3', label: 'Vichy', count: 62 },
    { id: 'b4', label: 'Maybelline', count: 140 },
    { id: 'b5', label: 'CeraVe', count: 35 },
    { id: 'b6', label: 'Eucerin', count: 28 },
  ];

  const skinTypeFilters = [
    { id: 's1', label: 'Mọi loại da', count: 250 },
    { id: 's2', label: 'Da Dầu / Mụn', count: 180 },
    { id: 's3', label: 'Da Khô', count: 95 },
    { id: 's4', label: 'Da Nhạy Cảm', count: 120 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn("fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300", isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[300px] bg-white h-full shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-full lg:shadow-none lg:z-auto overflow-y-auto lg:overflow-visible flex flex-col rounded-r-3xl lg:rounded-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between lg:hidden sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <h2 className="font-black text-xl flex items-center uppercase tracking-tight text-gray-900">
            <Filter size={20} className="mr-3 text-primary-500" /> Bộ Lọc
          </h2>
          <button onClick={() => setIsMobileOpen(false)} className="p-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-500 rounded-xl text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 md:p-0 md:pr-6 flex-1">
          <div className="hidden lg:flex items-center mb-6 pb-4 border-b-2 border-gray-900">
             <Filter size={22} className="mr-3 text-gray-900" />
             <h2 className="font-black text-xl uppercase tracking-tighter text-gray-900">Bộ Lọc Sắp Xếp</h2>
          </div>

          <FilterSection title="Khoảng giá" items={priceFilters} />
          <FilterSection title="Thương hiệu" items={brandFilters} />
          <FilterSection title="Loại da" items={skinTypeFilters} />
        </div>

        {/* Mobile Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0 lg:hidden flex gap-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
           <button className="flex-1 py-4 bg-gray-50 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors uppercase tracking-wider text-sm" onClick={() => setIsMobileOpen(false)}>Xoá Text</button>
           <button className="flex-1 py-4 bg-primary-500 text-white font-black rounded-xl shadow-lg shadow-primary-500/30 hover:bg-primary-600 transition-all hover:-translate-y-1 block uppercase tracking-wider text-sm" onClick={() => setIsMobileOpen(false)}>Áp Dụng</button>
        </div>
      </div>
    </>
  );
};
