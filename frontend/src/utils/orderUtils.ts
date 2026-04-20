import { Clock, Check, Package, Truck, Home, XCircle, AlertCircle } from 'lucide-react';
import type { Order } from '../types';

export interface TimelineStep {
  label: string;
  time?: string;
  date?: string;
  icon: any;
  status: string;
  isCompleted: boolean;
  isActive: boolean;
  isError?: boolean;
}

export const ORDER_STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
  'PENDING': { label: 'Chờ duyệt', color: 'amber', icon: Clock },
  'CONFIRMED': { label: 'Chuẩn bị hàng', color: 'purple', icon: Package },
  'SHIPPING': { label: 'Đang giao', color: 'blue', icon: Truck },
  'DELIVERED': { label: 'Hoàn thành', color: 'emerald', icon: Home },
  'CANCELLED': { label: 'Đã hủy', color: 'rose', icon: XCircle },
  'CANCELLATION_REQUESTED': { label: 'Yêu cầu hủy', color: 'pink', icon: AlertCircle }
};

export const getFullTimeline = (order: Order): TimelineStep[] => {
  const date = new Date(order.orderDate);
  const statusPriority: Record<string, number> = { 
    'PENDING': 0, 
    'CONFIRMED': 1, 
    'SHIPPING': 2, 
    'DELIVERED': 3,
    'CANCELLED': -1,
    'CANCELLATION_REQUESTED': -2
  };

  const currentPriority = statusPriority[order.status] || 0;

  // Happy Path Steps (6 Steps)
  const steps = [
    { label: 'Đơn hàng đã được đặt', status: 'PENDING', icon: Clock, offsetHours: 0 },
    { label: 'Đã xác nhận thanh toán', status: 'PENDING', icon: Check, offsetMinutes: 15 },
    { label: 'Shop đang chuẩn bị hàng', status: 'CONFIRMED', icon: Package, offsetHours: 2 },
    { label: 'Đã bàn giao vận chuyển', status: 'SHIPPING', icon: Truck, offsetHours: 12 },
    { label: 'Đang giao hàng đến bạn', status: 'SHIPPING', icon: Truck, offsetHours: 18 },
    { label: 'Giao hàng thành công', status: 'DELIVERED', icon: Home, offsetHours: 42 }
  ];

  // Handle Cancellation
  if (order.status === 'CANCELLED' || order.status === 'CANCELLATION_REQUESTED') {
     const errorStep = {
        label: order.status === 'CANCELLED' ? 'Đơn hàng đã bị hủy' : 'Đang chờ duyệt hủy đơn',
        status: order.status,
        icon: order.status === 'CANCELLED' ? XCircle : AlertCircle,
        isCompleted: false,
        isActive: true,
        isError: true,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('vi-VN')
     };
     
     // Filter existing steps that were completed before cancellation
     const completedSteps = steps.filter((s) => {
        const stepPriority = statusPriority[s.status];
        return stepPriority >= 0 && stepPriority < Math.abs(currentPriority);
     }).map(s => {
        const stepDate = new Date(date.getTime());
        return { ...s, isCompleted: true, isActive: false, time: stepDate.toLocaleTimeString('vi-VN'), date: stepDate.toLocaleDateString('vi-VN') };
     });

     return [...completedSteps as any, errorStep];
  }

  // Find the index of the furthest step reached
  const lastReachedIdx = steps.reduce((last, step, idx) => {
    return statusPriority[step.status] <= currentPriority ? idx : last;
  }, 0);

  return steps.map((step, idx) => {
    const isCompleted = idx < lastReachedIdx;
    const isActive = idx === lastReachedIdx;
    
    // Calculate mock time
    const stepDate = new Date(date.getTime());
    if (step.offsetHours) stepDate.setHours(stepDate.getHours() + step.offsetHours);
    if (step.offsetMinutes) stepDate.setMinutes(stepDate.getMinutes() + step.offsetMinutes);

    return {
      label: step.label,
      time: stepDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      date: stepDate.toLocaleDateString('vi-VN'),
      icon: step.icon,
      status: step.status,
      isCompleted,
      isActive
    };
  });
};
