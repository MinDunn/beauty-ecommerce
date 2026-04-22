import React from 'react';
import type { Order } from '../../../types';
import { format } from 'date-fns';

interface Props {
  order: Order;
}

export const VATInvoiceTemplate = React.forwardRef<HTMLDivElement, Props>(({ order }, ref) => {
  const totalPrice = order.totalPrice;
  const subTotal = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = subTotal - totalPrice;

  return (
    <div ref={ref} className="p-12 bg-white text-slate-900 font-serif" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">GLOWZY<span className="text-orange-600">.</span></h1>
          <div className="text-sm space-y-1 font-bold text-slate-600">
            <p>CÔNG TY TNHH GLOWZY BEAUTY VIỆT NAM</p>
            <p>Mã số thuế: 0123456789</p>
            <p>Địa chỉ: 123 Đường ABC, Phường Bến Nghé, Quận 1, TP. HCM</p>
            <p>Hotline: 1900 1234 | Email: contact@glowzy.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900 mb-2">Hóa Đơn Giá Trị Gia Tăng</h2>
          <p className="text-sm font-bold text-slate-500 uppercase">Mã đơn hàng: <span className="text-slate-900">#{order.id}</span></p>
          <p className="text-sm font-bold text-slate-500 uppercase">Ngày lập: <span className="text-slate-900">{format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}</span></p>
        </div>
      </div>

      {/* Invoice Info Section */}
      <div className="grid grid-cols-2 gap-12 mb-10">
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 border-b border-slate-100 pb-2">Người mua hàng</h3>
          <div className="space-y-2 text-sm">
            <p className="font-black text-lg">{order.receiverName}</p>
            <p className="font-bold text-slate-600">{order.receiverPhone}</p>
            <p className="text-slate-500 leading-relaxed">{order.shippingAddress}</p>
          </div>
        </div>
        
        {order.vatRequested ? (
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-orange-600 mb-4 border-b border-orange-100 pb-2">Thông tin xuất hóa đơn</h3>
            <div className="space-y-2 text-sm bg-orange-50/30 p-4 rounded-xl border border-orange-100">
              <p className="font-black text-slate-900 uppercase">{order.companyName}</p>
              <p className="font-bold text-slate-700">Mã số thuế: <span className="text-orange-700">{order.taxCode}</span></p>
              <p className="text-slate-500 italic text-xs leading-relaxed">{order.companyAddress}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl opacity-40">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Không yêu cầu hóa đơn VAT</p>
          </div>
        )}
      </div>

      {/* Items Table */}
      <table className="w-full mb-10 border-collapse">
        <thead>
          <tr className="bg-slate-900 text-white uppercase text-[10px] font-black tracking-widest">
            <th className="p-4 text-left rounded-l-xl">Sản phẩm</th>
            <th className="p-4 text-center">Đơn giá</th>
            <th className="p-4 text-center">Số lượng</th>
            <th className="p-4 text-right rounded-r-xl">Thành tiền</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {order.items.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-100 group">
              <td className="p-4">
                <p className="font-black text-slate-900 uppercase">{item.productName}</p>
                {item.variantName && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.variantName}</p>}
              </td>
              <td className="p-4 text-center font-bold text-slate-600">
                {item.price.toLocaleString()}đ
              </td>
              <td className="p-4 text-center font-black text-slate-900">
                {item.quantity}
              </td>
              <td className="p-4 text-right font-black text-slate-900">
                {(item.price * item.quantity).toLocaleString()}đ
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end mb-16">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-sm font-bold text-slate-500">
            <span>Tạm tính:</span>
            <span>{subTotal.toLocaleString()}đ</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm font-bold text-emerald-600">
              <span>Giảm giá:</span>
              <span>-{discount.toLocaleString()}đ</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-500">
            <span>Thuế VAT (0%):</span>
            <span>0đ</span>
          </div>
          <div className="pt-4 border-t-2 border-slate-900 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest">Tổng cộng</span>
            <span className="text-2xl font-black text-slate-900">{totalPrice.toLocaleString()}đ</span>
          </div>
        </div>
      </div>

      {/* Footer / Signatures */}
      <div className="grid grid-cols-2 gap-12 text-center">
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-20 text-slate-400">Người mua hàng</p>
          <div className="border-t border-slate-100 pt-4">
            <p className="text-sm font-black text-slate-900">{order.receiverName}</p>
          </div>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-20 text-slate-400">Người bán hàng</p>
          <div className="border-t border-slate-100 pt-4 relative">
             <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-20 pointer-events-none">
                <div className="w-32 h-32 rounded-full border-8 border-rose-600 flex items-center justify-center rotate-12">
                   <span className="text-rose-600 font-black text-[10px] uppercase text-center leading-none">GLOWZY BEAUTY<br/>VIỆT NAM</span>
                </div>
             </div>
            <p className="text-sm font-black text-slate-900">Kế toán trưởng</p>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-slate-100 text-[10px] text-center text-slate-400 font-bold uppercase tracking-[0.3em]">
        Cảm ơn bạn đã tin tưởng Glowzy Beauty • Website: www.glowzy.com
      </div>
    </div>
  );
});

VATInvoiceTemplate.displayName = 'VATInvoiceTemplate';
