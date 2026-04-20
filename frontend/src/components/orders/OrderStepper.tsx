import { Check, Package, Truck, Home, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

interface OrderStepperProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const OrderStepper = ({ status, className, size = 'md' }: OrderStepperProps) => {
  const steps = [
    { id: 'PENDING', label: 'Chờ duyệt', icon: Clock },
    { id: 'CONFIRMED', label: 'Chuẩn bị hàng', icon: Package },
    { id: 'SHIPPING', label: 'Đang giao', icon: Truck },
    { id: 'DELIVERED', label: 'Hoàn thành', icon: Home }
  ];

  const getStepStatus = (stepId: string) => {
    const statusPriority: Record<string, number> = {
      'PENDING': 0,
      'CONFIRMED': 1,
      'SHIPPING': 2,
      'DELIVERED': 3,
      'CANCELLED': -1,
      'CANCELLATION_REQUESTED': -1
    };

    const currentPriority = statusPriority[status] ?? 0;
    const stepPriority = statusPriority[stepId];

    if (status === 'CANCELLED' || status === 'CANCELLATION_REQUESTED') return 'error';
    if (currentPriority >= stepPriority) return 'completed';
    if (currentPriority + 1 === stepPriority) return 'active';
    return 'upcoming';
  };

  if (status === 'CANCELLED' || status === 'CANCELLATION_REQUESTED') {
      return (
          <div className={cn("flex items-center justify-between px-4 py-3 bg-red-50 rounded-2xl border border-red-100", className)}>
              <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white">
                      <Package size={16} />
                  </div>
                  <div>
                      <p className="text-[10px] font-black uppercase text-red-600 tracking-widest">{status === 'CANCELLED' ? 'Đã hủy đơn' : 'Chờ duyệt hủy'}</p>
                      <p className="text-[9px] text-red-400 font-bold italic">Đơn hàng không được tiếp tục xử lý</p>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative flex justify-between">
        {/* Progress Line */}
        <div className="absolute top-4 md:top-5 left-0 w-full h-[2px] bg-slate-100 z-0" />
        <div 
          className="absolute top-4 md:top-5 left-0 h-[2px] bg-primary-500 z-0 transition-all duration-1000 ease-out" 
          style={{ width: `${(Math.min(3, steps.findIndex(s => s.id === status) === -1 ? 0 : steps.findIndex(s => s.id === status)) / 3) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                stepStatus === 'completed' 
                  ? "bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30" 
                  : stepStatus === 'active'
                    ? "bg-white border-primary-500 text-primary-500 animate-pulse"
                    : "bg-white border-slate-200 text-slate-300"
              )}>
                {stepStatus === 'completed' && index < steps.findIndex(s => s.id === status) ? <Check size={16} /> : <Icon size={size === 'sm' ? 14 : 18} />}
              </div>
              
              <div className="mt-2 text-center">
                <p className={cn(
                  "text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-colors duration-300",
                  stepStatus === 'completed' || stepStatus === 'active' ? "text-primary-600" : "text-slate-400"
                )}>
                  {step.label}
                </p>
              </div>

              {/* Status Dot for mobile */}
              <div className={cn(
                "absolute top-4 md:top-5 w-2 h-2 rounded-full border-2 border-white transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
                stepStatus === 'completed' ? "bg-primary-500" : "bg-slate-200"
              )} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
