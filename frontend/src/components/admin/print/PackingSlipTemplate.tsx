import React from 'react';
import type { Order } from '../../../types';
import { format } from 'date-fns';

interface Props {
  order: Order;
}

export const PackingSlipTemplate = React.forwardRef<HTMLDivElement, Props>(({ order }, ref) => {
  return (
    <div ref={ref} className="p-10 bg-white text-slate-900 font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
      <div className="border-4 border-slate-900 p-8 h-full">
        <div className="text-center border-b-4 border-slate-900 pb-6 mb-8">
          <h1 className="text-4xl font-black uppercase tracking-[0.2em] mb-2">Phiếu Xuất Kho</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Glowzy Beauty Warehouse System</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="space-y-4">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mã vận đơn</h3>
              <p className="text-2xl font-black text-slate-900">#GLW{order.id}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ngày in phiếu</h3>
              <p className="font-bold text-slate-700">{format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Thông tin giao hàng</h3>
             <p className="font-black text-slate-900 mb-1">{order.receiverName}</p>
             <p className="font-bold text-slate-600 text-sm mb-2">{order.receiverPhone}</p>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">{order.shippingAddress}</p>
          </div>
        </div>

        <div className="mb-10">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-y-2 border-slate-900">
                <th className="p-4 text-center w-16 text-xs font-black uppercase">SHT</th>
                <th className="p-4 text-left text-xs font-black uppercase">Tên sản phẩm / Phân loại</th>
                <th className="p-4 text-center w-32 text-xs font-black uppercase">Số lượng</th>
                <th className="p-4 text-center w-24 text-xs font-black uppercase">Kểm tra</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-200">
                  <td className="p-4 text-center text-sm font-bold text-slate-400">{idx + 1}</td>
                  <td className="p-4">
                    <p className="font-black text-slate-900 uppercase">{item.productName}</p>
                    {item.variantName && <p className="text-[10px] font-bold text-slate-500 uppercase italic">{item.variantName}</p>}
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-2xl font-black text-slate-900">x{item.quantity}</span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="w-8 h-8 border-2 border-slate-300 rounded-lg mx-auto"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-12 mt-auto pt-20 text-center">
           <div>
              <p className="text-xs font-black uppercase tracking-widest mb-16 text-slate-400">Người đóng gói</p>
              <div className="w-48 border-b border-slate-200 mx-auto"></div>
           </div>
           <div>
              <p className="text-xs font-black uppercase tracking-widest mb-16 text-slate-400">Người nhận hàng</p>
              <div className="w-48 border-b border-slate-200 mx-auto"></div>
           </div>
        </div>

        <div className="mt-20 flex justify-between items-center opacity-30 grayscale">
           <div className="text-[8px] font-black uppercase tracking-[0.3em]">
              GLOWZY BEAUTY • INTERNAL WAREHOUSE DOCUMENT • NOT AN INVOICE
           </div>
           <div className="text-[8px] font-black uppercase tracking-[0.3em]">
              PAGE 1 / 1
           </div>
        </div>
      </div>
    </div>
  );
});

PackingSlipTemplate.displayName = 'PackingSlipTemplate';
