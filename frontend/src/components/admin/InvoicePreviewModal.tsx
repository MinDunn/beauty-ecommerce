import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, FileSpreadsheet, Clock, User } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import * as XLSX from 'xlsx';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptGroup: {
    receivedAt: string;
    items: any[];
    totalAmount: number;
    totalQuantity: number;
    id: number;
  } | null;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ isOpen, onClose, receiptGroup }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Hoa_Don_Nhap_Hang_${receiptGroup?.id || ''}`,
  });

  const exportToExcel = () => {
    if (!receiptGroup) return;

    const data = receiptGroup.items.map((item, index) => ({
      'STT': index + 1,
      'Mã Đơn': `RC-${item.id}`,
      'Tên Sản Phẩm': item.productName || 'N/A',
      'Phân loại': item.variantName || 'Mặc định',
      'Số Lượng': item.quantity,
      'Giá Nhập (VNĐ)': item.costPrice,
      'Thành Tiền (VNĐ)': item.quantity * item.costPrice,
      'Ngày Nhập': new Date(item.receivedAt).toLocaleString('vi-VN')
    }));

    // Thêm dòng tổng cộng
    data.push({
      'STT': null as any,
      'Mã Đơn': 'TỔNG CỘNG',
      'Tên Sản Phẩm': '',
      'Phân loại': '',
      'Số Lượng': receiptGroup.totalQuantity,
      'Giá Nhập (VNĐ)': null as any,
      'Thành Tiền (VNĐ)': receiptGroup.totalAmount,
      'Ngày Nhập': ''
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hóa Đơn Nhập Hàng');

    // Tự động điều chỉnh độ rộng cột
    const wscols = [
      { wch: 5 },  // STT
      { wch: 15 }, // Mã Đơn
      { wch: 40 }, // Tên SP
      { wch: 20 }, // Phân loại
      { wch: 10 }, // SL
      { wch: 15 }, // Giá Nhập
      { wch: 15 }, // Thành Tiền
      { wch: 20 }  // Ngày Nhập
    ];
    worksheet['!cols'] = wscols;

    XLSX.writeFile(workbook, `Hoa_Don_Nhap_Hang_${receiptGroup.id}.xlsx`);
  };

  if (!receiptGroup) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header / Actions */}
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-500/10 rounded-xl">
                  <FileSpreadsheet className="text-primary-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">Chi tiết hóa đơn nhập</h3>
                  <p className="text-xs text-slate-500 font-medium italic">Mã tham chiếu: #RC-{receiptGroup.id}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl border border-emerald-500/20 transition-all font-bold text-xs"
                >
                  <FileSpreadsheet size={16} />
                  Xuất Excel
                </button>
                <button
                  onClick={() => handlePrint()}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl border border-primary-500/20 transition-all font-bold text-xs"
                >
                  <Printer size={16} />
                  In hóa đơn
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content (Printable area) */}
            <div className="flex-1 overflow-y-auto p-10 scrollbar-thin scrollbar-track-slate-900 scrollbar-thumb-slate-800">
              <div 
                ref={printRef}
                className="bg-white text-slate-900 p-12 rounded-xl shadow-inner min-h-[600px] flex flex-col font-sans"
              >
                {/* Brand Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Beauty Ecommerce</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hệ thống quản lý kho chuyên nghiệp</p>
                    <div className="mt-4 text-xs text-slate-500 space-y-1 font-medium">
                      <p>Địa chỉ: 123 Đường Sắc Đẹp, Quận 1, TP. HCM</p>
                      <p>Hotline: 1900 1234 | Email: contact@beauty.com</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-black text-slate-900 uppercase mb-2">Phiếu Nhập Kho</h2>
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">
                      SỐ: {receiptGroup.id}
                    </div>
                    <div className="mt-4 text-xs text-slate-500 font-medium">
                      <p>Ngày lập: {new Date(receiptGroup.receivedAt).toLocaleDateString('vi-VN')}</p>
                      <p>Giờ: {new Date(receiptGroup.receivedAt).toLocaleTimeString('vi-VN')}</p>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-10">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                      <User size={10} /> Đơn vị nhập hàng
                    </p>
                    <p className="text-sm font-black text-slate-800 uppercase">Kho Tổng Beauty Ecommerce</p>
                    <p className="text-xs text-slate-500 mt-1">Người phụ trách: Quản trị viên</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 flex items-center gap-1">
                      <Clock size={10} /> Thông tin chứng từ
                    </p>
                    <p className="text-sm font-black text-slate-800 uppercase italic">Nhập kho định kỳ</p>
                    <p className="text-xs text-slate-500 mt-1">Hình thức: Nhập kho hệ thống</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-slate-900">
                        <th className="py-4 text-[10px] font-black uppercase text-slate-900">STT</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-900">Sản phẩm / Biến thể</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-900 text-center">SL</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-900 text-right">Đơn giá</th>
                        <th className="py-4 text-[10px] font-black uppercase text-slate-900 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {receiptGroup.items.map((item, index) => (
                        <tr key={item.id} className="text-slate-700">
                          <td className="py-4 text-xs font-bold text-slate-400">{index + 1}</td>
                          <td className="py-4">
                            <p className="text-sm font-black text-slate-900">{item.productName}</p>
                            <p className="text-[10px] font-medium text-slate-400 italic">Mã SP: {item.productId} {item.variantName ? `| Biến thể: ${item.variantName}` : ''}</p>
                          </td>
                          <td className="py-4 text-sm font-black text-center">{item.quantity}</td>
                          <td className="py-4 text-sm font-bold text-right">{item.costPrice.toLocaleString('vi-VN')} đ</td>
                          <td className="py-4 text-sm font-black text-slate-900 text-right">
                            {(item.quantity * item.costPrice).toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="mt-10 pt-8 border-t-2 border-slate-900 flex flex-col items-end gap-2">
                  <div className="flex justify-between w-64 text-sm text-slate-500 font-bold">
                    <span>Tổng số mặt hàng:</span>
                    <span>{receiptGroup.items.length}</span>
                  </div>
                  <div className="flex justify-between w-64 text-sm text-slate-500 font-bold">
                    <span>Tổng số lượng:</span>
                    <span>{receiptGroup.totalQuantity}</span>
                  </div>
                  <div className="flex justify-between w-64 text-lg font-black text-slate-900 bg-slate-50 p-4 rounded-xl mt-2">
                    <span>TỔNG TIỀN:</span>
                    <span className="text-emerald-600">{receiptGroup.totalAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <p className="mt-2 text-[10px] font-bold text-slate-400 italic">
                    * Bằng chữ: {receiptGroup.totalAmount.toLocaleString('vi-VN')} đồng.
                  </p>
                </div>

                {/* Signatures */}
                <div className="mt-16 grid grid-cols-3 gap-8 text-center">
                  <div className="space-y-16">
                    <p className="text-xs font-black uppercase text-slate-900">Người lập phiếu</p>
                    <p className="text-xs font-medium text-slate-400 italic">(Ký, họ tên)</p>
                  </div>
                  <div className="space-y-16">
                    <p className="text-xs font-black uppercase text-slate-900">Người giao hàng</p>
                    <p className="text-xs font-medium text-slate-400 italic">(Ký, họ tên)</p>
                  </div>
                  <div className="space-y-16">
                    <p className="text-xs font-black uppercase text-slate-900">Thủ kho</p>
                    <p className="text-xs font-medium text-slate-400 italic">(Ký, họ tên)</p>
                  </div>
                </div>

                {/* Footer Tip */}
                <p className="mt-auto pt-16 text-center text-[10px] text-slate-400 font-medium italic">
                  Hệ thống quản lý kho Beauty Ecommerce <br/>
                  Trang 1 / 1
                </p>
              </div>
            </div>

            {/* Footer / Final Actions */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-2xl transition-all font-bold text-xs"
              >
                Từ chối / Đóng
              </button>
              <button
                onClick={exportToExcel}
                className="px-8 py-2.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded-2xl transition-all font-black text-xs shadow-xl shadow-emerald-500/20"
              >
                Chấp nhận & Xuất Excel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
