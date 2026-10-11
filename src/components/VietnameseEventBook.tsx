import React, { useState } from 'react';
import { Gift, Plus, Search, ArrowUpRight, ArrowDownRight, Trash2, X, Check, Heart } from 'lucide-react';
import { GiftEventItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface VietnameseEventBookProps {
  events: GiftEventItem[];
  isPrivacyMode: boolean;
  onAddEvent: (item: Omit<GiftEventItem, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

export const VietnameseEventBook: React.FC<VietnameseEventBookProps> = ({
  events,
  isPrivacyMode,
  onAddEvent,
  onDeleteEvent,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'GIVEN' | 'RECEIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [personName, setPersonName] = useState('');
  const [eventName, setEventName] = useState('Đám cưới');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'GIVEN' | 'RECEIVED'>('GIVEN');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const totalGiven = events
    .filter((e) => e.type === 'GIVEN')
    .reduce((s, e) => s + e.amount, 0);

  const totalReceived = events
    .filter((e) => e.type === 'RECEIVED')
    .reduce((s, e) => s + e.amount, 0);

  const filtered = events.filter((e) => {
    if (filterType !== 'ALL' && e.type !== filterType) return false;
    if (search.trim()) {
      const lower = search.toLowerCase();
      return (
        e.personName.toLowerCase().includes(lower) ||
        e.eventName.toLowerCase().includes(lower) ||
        (e.note || '').toLowerCase().includes(lower)
      );
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!personName.trim() || !num || num <= 0) {
      alert('Vui lòng nhập tên người và số tiền');
      return;
    }

    onAddEvent({
      personName: personName.trim(),
      eventName: eventName.trim(),
      amount: num,
      type,
      date,
      note: note.trim(),
    });

    setPersonName('');
    setAmount('');
    setNote('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-rose-50 border border-rose-200/80 rounded-3xl p-4">
          <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" /> Tôi đi mừng người khác
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-rose-950">
            {formatCurrency(totalGiven, '₫', isPrivacyMode)}
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200/80 rounded-3xl p-4">
          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mb-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" /> Người khác mừng tôi
          </span>
          <div className="text-lg sm:text-xl font-black font-mono text-emerald-950">
            {formatCurrency(totalReceived, '₫', isPrivacyMode)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên bạn bè, sự kiện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white rounded-xl text-xs border border-slate-200 outline-none"
          />
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Ghi sổ mừng
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
            Chưa có ghi chép nào. Lưu lại tiền mừng đám cưới, thôi nôi để sau này đi lại cho đúng lễ!
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    item.type === 'GIVEN'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 text-xs">{item.personName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded-md font-semibold">
                      {item.eventName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.date} {item.note && `• ${item.note}`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right font-mono font-bold text-xs text-slate-900">
                  {formatCurrency(item.amount, '₫', isPrivacyMode)}
                </div>
                <button
                  onClick={() => onDeleteEvent(item.id)}
                  className="text-slate-300 hover:text-rose-500 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal thêm ghi chép */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Ghi sổ mừng cưới & Lễ nghĩa</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 pt-3">
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setType('GIVEN')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    type === 'GIVEN' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tôi đi mừng
                </button>
                <button
                  type="button"
                  onClick={() => setType('RECEIVED')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    type === 'RECEIVED' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Người khác mừng tôi
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tên người thân / Bạn bè
                </label>
                <input
                  type="text"
                  placeholder="VD: Bạn Hùng đại học, Chị Vân..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Sự kiện
                  </label>
                  <select
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="Đám cưới">Đám cưới</option>
                    <option value="Thôi nôi / Đầy tháng">Thôi nôi / Đầy tháng</option>
                    <option value="Tân gia nhà mới">Tân gia nhà mới</option>
                    <option value="Mừng thọ / Sinh nhật">Mừng thọ / Sinh nhật</option>
                    <option value="Lì xì / Mừng Tết">Lì xì / Mừng Tết</option>
                    <option value="Khác">Sự kiện khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Số tiền (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 500000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Ngày diễn ra
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Ghi chú
                </label>
                <input
                  type="text"
                  placeholder="VD: Cưới ở quê, Đi chung với nhóm bạn..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Lưu vào sổ mừng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

