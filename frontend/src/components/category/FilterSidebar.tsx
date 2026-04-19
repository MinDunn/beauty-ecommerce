import { useState } from 'react';
import { ChevronDown, ChevronUp, Filter, Ticket } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FilterSectionProps {
  title: string;
  type: 'price' | 'skinType' | 'offer' | 'rating';
  items: { id: string | number; label: string | React.ReactNode; count?: number }[];
  selectedItems: any;
  onToggle: (type: any, value: any) => void;
  defaultOpen?: boolean;
}

const FilterSection = ({ title, type, items, selectedItems, onToggle, defaultOpen = true }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 py-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-left group outline-none"
      >
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 group-hover:text-primary-600 transition-colors">
          {title}
        </span>
        <div className="text-gray-300 group-hover:text-primary-500 transition-colors">
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      
      <div className={cn(
        "mt-5 space-y-4 overflow-hidden transition-all duration-300 origin-top", 
        isOpen ? "max-h-[500px] opacity-100 scale-y-100" : "max-h-0 opacity-0 scale-y-0"
      )}>
        {items.map((item) => {
          const isSelected = (type === 'rating' || type === 'skinType' || type === 'price')
            ? selectedItems === item.id 
            : Array.isArray(selectedItems) 
                ? selectedItems.includes(item.id) 
                : selectedItems === item.id;
             
          return (
            <label key={item.id} className="flex items-center group cursor-pointer">
              <div className="relative flex items-center justify-center">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => onToggle(type, item.id)}
                  className={cn(
                    "peer w-5 h-5 appearance-none border-2 border-gray-200 transition-all cursor-pointer outline-none",
                    type === 'price' || type === 'rating' || type === 'skinType' ? "rounded-full" : "rounded-[6px]",
                    "checked:bg-gray-900 checked:border-gray-900 hover:border-gray-400"
                  )} 
                />
                <div className={cn(
                  "absolute inset-0 m-auto rounded-sm bg-white scale-0 peer-checked:scale-100 transition-transform duration-200 pointer-events-none",
                  type === 'price' || type === 'rating' || type === 'skinType' ? "w-1.5 h-1.5 rounded-full" : "w-2.5 h-2.5 rounded-[2px]"
                )}></div>
              </div>
              <span className={cn(
                "ml-3.5 text-sm font-semibold transition-colors flex items-center", 
                isSelected ? "text-gray-900" : "text-gray-500 group-hover:text-gray-900"
              )}>
                {item.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

interface FilterSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  selectedPriceRange: string | null;
  selectedSkinTypes: string[];
  selectedOnSale: boolean;
  onFilterChange: (type: 'price' | 'skinType' | 'offer' | 'rating', value: any) => void;
  onReset: () => void;
  isSkincare?: boolean;
}

export const FilterSidebar = ({ 
  isMobileOpen, 
  setIsMobileOpen,
  selectedPriceRange,
  selectedSkinTypes,
  selectedOnSale,
  onFilterChange,
  onReset,
  isSkincare
}: FilterSidebarProps) => {
  const priceFilters = [
    { id: 'p1', label: 'Dưới 100.000 đ' },
    { id: 'p2', label: '100.000 đ - 300.000 đ' },
    { id: 'p3', label: '300.000 đ - 500.000 đ' },
    { id: 'p4', label: 'Trên 500.000 đ' },
  ];

  const skinTypeFilters = [
    { id: 'Da dầu', label: 'Da dầu' },
    { id: 'Da khô', label: 'Da khô' },
    { id: 'Da nhạy cảm', label: 'Da nhạy cảm' },
    { id: 'Da hỗn hợp', label: 'Da hỗn hợp' },
    { id: 'Da thường', label: 'Da thường' },
  ];

  return (
    <>
      <div 
        className={cn("fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 lg:hidden transition-all duration-500", isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={() => setIsMobileOpen(false)}
      />

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] bg-white h-full shadow-2xl transform transition-transform duration-500 ease-out lg:relative lg:translate-x-0 lg:w-full lg:shadow-none lg:z-auto overflow-y-auto lg:overflow-visible flex flex-col rounded-r-[2.5rem] lg:rounded-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 md:p-0 md:pr-8 flex-1">
          <div className="hidden lg:flex items-center mb-6 pb-4 border-b border-gray-100">
             <Filter size={16} className="mr-3 text-gray-900" strokeWidth={3} />
             <h2 className="font-black text-sm uppercase tracking-[0.2em] text-gray-900">Lọc</h2>
          </div>

          <div className="mb-4">
            <button 
              onClick={() => onFilterChange('offer', 'onSale')}
              className={cn(
                "w-full flex items-center justify-between py-3 px-4 rounded-xl border transition-all duration-300 group",
                selectedOnSale 
                  ? "bg-primary-50 border-primary-400 text-primary-700 shadow-sm" 
                  : "bg-white border-gray-100 hover:border-gray-200 text-gray-500"
              )}
            >
              <div className="flex items-center">
                <div className={cn(
                  "p-1.5 rounded-lg mr-3 transition-colors",
                  selectedOnSale ? "bg-primary-500 text-white" : "bg-gray-50 text-gray-400 group-hover:text-primary-500"
                )}>
                  <Ticket size={16} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider">Ưu đãi hôm nay</span>
              </div>
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                selectedOnSale ? "border-primary-500 bg-primary-500" : "border-gray-200 bg-white"
              )}>
                {selectedOnSale && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          </div>

          {isSkincare && (
            <FilterSection 
              title="Loại da" 
              type="skinType"
              items={skinTypeFilters} 
              selectedItems={selectedSkinTypes}
              onToggle={onFilterChange}
            />
          )}

          <FilterSection 
            title="Khoảng giá" 
            type="price"
            items={priceFilters} 
            selectedItems={selectedPriceRange}
            onToggle={onFilterChange}
          />
        </div>

        <div className="p-6 border-t border-gray-100 bg-white sticky bottom-0 lg:hidden flex gap-4">
           <button 
             className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-colors uppercase tracking-widest text-[10px]" 
             onClick={() => { onReset(); setIsMobileOpen(false); }}
           >
             Mặc định
           </button>
           <button 
             className="flex-1 py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-gray-900/20 hover:bg-black transition-all hover:-translate-y-1 uppercase tracking-widest text-[10px]" 
             onClick={() => setIsMobileOpen(false)}
           >
             Áp Dụng
           </button>
        </div>
      </div>
    </>
  );
};
