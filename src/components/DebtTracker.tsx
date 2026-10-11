import React, { useState } from 'react';
import { HandCoins, Plus, CheckCircle, Clock, Check, X, MessageSquareQuote, Sparkles } from 'lucide-react';
import { DebtItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface DebtTrackerProps {
  debts: DebtItem[];
  isPrivacyMode: boolean;
  onAddDebt: (debt: Omit<DebtItem, 'id'>) => void;
  onToggleSettle: (id: string) => void;
  onDeleteDebt: (id: string) => void;
}

type ToneType = 'FRIENDLY' | 'FUNNY' | 'POLITE';

export const DebtTracker: React.FC<DebtTrackerProps> = ({
  debts,
  isPrivacyMode,
  onAddDebt,
  onToggleSettle,
  onDeleteDebt,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'LENT' | 'BORROWED'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'LENT' | 'BORROWED'>('LENT');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  // Reminder popup states
  const [selectedDebtForReminder, setSelectedDebtForReminder] = useState<DebtItem | null>(null);
  const [selectedTone, setSelectedTone] = useState<ToneType>('FRIENDLY');
  const [customText, setCustomText] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const totalLent = debts
    .filter((d) => d.type === 'LENT' && !d.isSettled)
    .reduce((s, d) => s + d.amount, 0);

  const totalBorrowed = debts
    .filter((d) => d.type === 'BORROWED' && !d.isSettled)
    .reduce((s, d) => s + d.amount, 0);

  const filteredDebts = debts.filter((d) => {
    if (filterType === 'ALL') return true;
    return d.type === filterType;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!personName.trim() || !numAmount || numAmount <= 0) {
      alert('Vui lòng điền đầy đủ tên và số tiền');
      return;
    }

    onAddDebt({
      personName: personName.trim(),
      amount: numAmount,
      type,
      dueDate: dueDate || undefined,
      note: note.trim(),
      isSettled: false,
      createdAt: new Date().toISOString().split('T')[0],
    });

    setPersonName('');
    setAmount('');
    setNote('');
    setIsModalOpen(false);
  };

  // Các mẫu tin nhắn đời thường thực tế, không văn mẫu AI
  const generateMessage = (debt: DebtItem, tone: ToneType): string => {
    const formatted = formatCurrency(debt.amount);
    const itemReason = debt.note ? `vụ ${debt.note}` : 'tiền hôm nọ';

    switch (tone) {
      case 'FRIENDLY':
        return `Ê ${debt.personName} ơi, đợt trước ${itemReason} hết ${formatted} í, lúc nào tiện tay bắn lại tôi nha. Cảm ơn bồ nhiều! 😉`;
      case 'FUNNY':
        return `Alo ${debt.personName} ới ời, vụ ${itemReason} ${formatted} hôm trước nè, nhớ chuyển lại tôi với nha không tôi hết tiền ăn cơm rùi haha 😂`;
      case 'POLITE':
        return `${debt.personName} ơi, hôm trước tiền ${itemReason} là ${formatted} á, khi nào tiện chuyển khoản lại giúp mình nhé. Cảm ơn bạn nhiều!`;
    }
  };

  const openReminderModal = (debt: DebtItem) => {
    setSelectedDebtForReminder(debt);
    setSelectedTone('FRIENDLY');
    setCustomText(generateMessage(debt, 'FRIENDLY'));
    setIsCopied(false);
  };

  const handleToneChange = (tone: ToneType) => {
    if (!selectedDebtForReminder) return;
    setSelectedTone(tone);
    setCustomText(generateMessage(selectedDebtForReminder, tone));
    setIsCopied(false);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50/90 border border-emerald-200/60 rounded-3xl p-4">
          <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-1">
            <HandCoins className="w-4 h-4 text-emerald-600" /> Người khác nợ tôi
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-950">
            {formatCurrency(totalLent, '₫', isPrivacyMode)}
          </div>
        </div>

        <div className="bg-rose-50/90 border border-rose-200/60 rounded-3xl p-4">
          <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5 mb-1">
            <Clock className="w-4 h-4 text-rose-600" /> Tôi nợ người khác
          </div>
          <div className="text-lg sm:text-xl font-black font-mono text-rose-950">
            {formatCurrency(totalBorrowed, '₫', isPrivacyMode)}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterType('LENT')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'LENT' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Cho mượn
          </button>
          <button
            onClick={() => setFilterType('BORROWED')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterType === 'BORROWED' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Đi mượn
          </button>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-2xl text-xs font-semibold shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Ghi nợ mới
        </button>
      </div>

      {/* Debt Item List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
            Chưa có khoản nợ nào được ghi nhận. Bấm "Ghi nợ mới" để thêm.
          </div>
        ) : (
          filteredDebts.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-2xl p-4 border transition-all ${
                item.isSettled
                  ? 'border-slate-200/50 opacity-60 bg-slate-50/50'
                  : item.type === 'LENT'
                  ? 'border-emerald-100 shadow-xs'
                  : 'border-rose-100 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        item.type === 'LENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.type === 'LENT' ? 'Cho mượn' : 'Đi mượn'}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{item.personName}</h4>
                  </div>

                  <div className="text-xs text-slate-500 mt-1">
                    {item.note || 'Không có ghi chú'}
                  </div>

                  {item.dueDate && (
                    <div className="text-[11px] text-amber-600 mt-0.5 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Hạn trả: {item.dueDate}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-base text-slate-900">
                    {formatCurrency(item.amount, '₫', isPrivacyMode)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Tạo: {item.createdAt}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onToggleSettle(item.id)}
                  className={`flex items-center gap-1 font-semibold transition-colors ${
                    item.isSettled
                      ? 'text-slate-400 hover:text-slate-600'
                      : 'text-emerald-600 hover:text-emerald-700'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {item.isSettled ? 'Đánh dấu chưa trả' : 'Đã trả xong'}
                </button>

                <div className="flex items-center gap-2">
                  {/* Nhắc nợ tự nhiên bằng Zalo/Messenger */}
                  {item.type === 'LENT' && !item.isSettled && (
                    <button
                      onClick={() => openReminderModal(item)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-all border border-indigo-100"
                    >
                      <MessageSquareQuote className="w-3.5 h-3.5" />
                      Nhắn tin nhắc nợ
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm(`Xác nhận xóa khoản này?`)) onDeleteDebt(item.id);
                    }}
                    className="text-slate-300 hover:text-rose-500 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* POPUP NHẮC NỢ KHÉO ĐỜI THƯỜNG (KHÔNG VĂN MẪU AI) */}
      {selectedDebtForReminder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MessageSquareQuote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Nhắn tin cho {selectedDebtForReminder.personName}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Số tiền: {formatCurrency(selectedDebtForReminder.amount)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDebtForReminder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chọn Tone giọng nhắn tin đời thường */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Chọn phong cách nhắn tin:
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleToneChange('FRIENDLY')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTone === 'FRIENDLY'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  😉 Bạn bè
                </button>
                <button
                  type="button"
                  onClick={() => handleToneChange('FUNNY')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTone === 'FUNNY'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  😂 Hài hước
                </button>
                <button
                  type="button"
                  onClick={() => handleToneChange('POLITE')}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all border ${
                    selectedTone === 'POLITE'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  🤝 Lịch sự
                </button>
              </div>
            </div>

            {/* Khung soạn thảo tin nhắn trực tiếp */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Nội dung tin nhắn (bạn có thể sửa lại theo ý thích):
              </label>
              <textarea
                rows={4}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed font-sans resize-none"
              />
            </div>

            {/* Nút Sao chép */}
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handleCopyText}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md ${
                  isCopied
                    ? 'bg-emerald-600 text-white shadow-emerald-100'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4" /> Đã copy! Mở Zalo/Messenger dán vào gửi ngay
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Sao chép tin nhắn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GHI NỢ MỚI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Ghi sổ vay / mượn nợ</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 pt-3">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setType('LENT')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    type === 'LENT' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tôi cho mượn
                </button>
                <button
                  type="button"
                  onClick={() => setType('BORROWED')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    type === 'BORROWED' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tôi đi mượn
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tên người liên quan
                </label>
                <input
                  type="text"
                  placeholder="VD: Tuấn, Chị Lan, Nam..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="VD: 200000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Hạn trả nợ (tùy chọn)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Lý do / Món tiền gì
                </label>
                <input
                  type="text"
                  placeholder="VD: Ăn lẩu hôm qua, Tiền trà sữa..."
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
                  <Check className="w-4 h-4" /> Lưu khoản nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
