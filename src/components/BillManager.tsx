import React, { useState } from 'react';
import { Calendar, Plus, CheckCircle2, AlertCircle, Trash2, X, Check, BellRing } from 'lucide-react';
import { RecurringBill, Wallet } from '../types';
import { formatCurrency } from '../utils/formatters';

interface BillManagerProps {
  bills: RecurringBill[];
  wallets: Wallet[];
  isPrivacyMode: boolean;
  onAddBill: (bill: Omit<RecurringBill, 'id'>) => void;
  onPayBill: (bill: RecurringBill) => void;
  onDeleteBill: (id: string) => void;
}

export const BillManager: React.FC<BillManagerProps> = ({
  bills,
  wallets,
  isPrivacyMode,
  onAddBill,
  onPayBill,
  onDeleteBill,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDay, setDueDay] = useState('5');
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');
  const [note, setNote] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentDay = new Date().getDate();

  const totalMonthlyBills = bills.reduce((sum, b) => sum + b.amount, 0);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const day = parseInt(dueDay, 10);
    if (!name.trim() || !numAmount || numAmount <= 0) {
      alert('Vui lòng nhập tên và số tiền hóa đơn');
      return;
    }

    onAddBill({
      name: name.trim(),
      amount: numAmount,
      dueDay: Math.min(31, Math.max(1, day || 1)),
      category: 'Hóa đơn định kỳ',
      walletId: selectedWalletId || wallets[0]?.id || 'w-cash',
      note: note.trim(),
    });

    setName('');
    setAmount('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Banner tổng tiền hóa đơn cố định */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-semibold text-blue-200 flex items-center gap-1.5">
            <BellRing className="w-4 h-4 text-blue-300" /> Hóa đơn cố định hàng tháng
          </span>
          <div className="text-2xl font-black font-mono mt-1">
            {formatCurrency(totalMonthlyBills, '₫', isPrivacyMode)}
          </div>
          <p className="text-[11px] text-blue-200/80 mt-1">
            {bills.length} khoản phí (tiền nhà, điện nước, mạng, dịch vụ)
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-blue-900 font-bold px-3.5 py-2 rounded-2xl text-xs hover:bg-blue-50 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Thêm hóa đơn
        </button>
      </div>

      {/* Danh sách các hóa đơn */}
      <div className="space-y-2.5">
        {bills.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
            Chưa có hóa đơn nào. Bấm "Thêm hóa đơn" để hệ thống tự động nhắc bạn trước ngày đóng tiền!
          </div>
        ) : (
          bills.map((bill) => {
            const isPaid = bill.lastPaidMonth === currentMonth;
            const daysLeft = bill.dueDay - currentDay;
            const isOverdue = !isPaid && daysLeft < 0;
            const isDueToday = !isPaid && daysLeft === 0;

            return (
              <div
                key={bill.id}
                className={`bg-white rounded-2xl p-4 border transition-all flex items-center justify-between ${
                  isPaid
                    ? 'border-emerald-100/80 bg-emerald-50/20'
                    : isOverdue
                    ? 'border-rose-200 bg-rose-50/30'
                    : isDueToday
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                      isPaid
                        ? 'bg-emerald-100 text-emerald-800'
                        : isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    N.{bill.dueDay}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-sm">{bill.name}</h4>
                      {isPaid ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Đã đóng tháng này
                        </span>
                      ) : isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <AlertCircle className="w-3 h-3" /> Quá hạn {Math.abs(daysLeft)} ngày
                        </span>
                      ) : isDueToday ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          Hạn chót hôm nay!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Còn {daysLeft} ngày
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5">
                      Định kỳ ngày {bill.dueDay} hàng tháng
                      {bill.note && ` • ${bill.note}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-slate-900">
                      {formatCurrency(bill.amount, '₫', isPrivacyMode)}
                    </div>
                  </div>

                  {!isPaid && (
                    <button
                      onClick={() => onPayBill(bill)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Đã đóng
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Xác nhận xóa hóa đơn "${bill.name}"?`)) onDeleteBill(bill.id);
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Thêm Hóa đơn định kỳ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" /> Thêm hóa đơn định kỳ
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tên hóa đơn / Dịch vụ
                </label>
                <input
                  type="text"
                  placeholder="VD: Tiền phòng trọ, Tiền điện, Internet FPT, Netflix..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 3000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Ngày đến hạn (1 - 31)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="VD: 5"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Trừ tiền từ ví
                </label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Ghi chú thêm (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="VD: Chuyển khoản cho chủ nhà trước ngày 5"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Lưu hóa đơn nhắc hẹn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

