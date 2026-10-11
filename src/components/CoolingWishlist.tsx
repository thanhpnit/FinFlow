import React, { useState } from 'react';
import { ShoppingBag, Clock, Sparkles, Check, Trash2, Plus, X, HeartHandshake, DollarSign } from 'lucide-react';
import confetti from 'canvas-confetti';
import { WishlistItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CoolingWishlistProps {
  wishlist: WishlistItem[];
  isPrivacyMode: boolean;
  onAddWishlist: (item: Omit<WishlistItem, 'id'>) => void;
  onAbandonItem: (id: string) => void; // Quyết định KHÔNG MUA -> Tiết kiệm thành công!
  onConfirmBuy: (item: WishlistItem) => void; // Vẫn quyết định mua -> Chuyển thành Transaction
  onDeleteWishlist: (id: string) => void;
}

export const CoolingWishlist: React.FC<CoolingWishlistProps> = ({
  wishlist,
  isPrivacyMode,
  onAddWishlist,
  onAbandonItem,
  onConfirmBuy,
  onDeleteWishlist,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [delayHours, setDelayHours] = useState('72');
  const [reason, setReason] = useState('');

  // Tính tổng số tiền đã tiết kiệm được nhờ kiềm chế bốc đồng
  const totalMoneySaved = wishlist
    .filter((w) => w.status === 'SAVED')
    .reduce((s, w) => s + w.estimatedPrice, 0);

  const activeWaitingItems = wishlist.filter((w) => w.status === 'WAITING');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const numPrice = parseFloat(price);
    if (!name.trim() || !numPrice || numPrice <= 0) {
      alert('Vui lòng nhập tên món đồ và số tiền');
      return;
    }

    onAddWishlist({
      name: name.trim(),
      estimatedPrice: numPrice,
      createdAt: new Date().toISOString(),
      delayHours: parseInt(delayHours, 10) || 72,
      category: 'Mua sắm',
      status: 'WAITING',
      reason: reason.trim(),
    });

    setName('');
    setPrice('');
    setReason('');
    setIsModalOpen(false);
  };

  const handleAbandonSuccess = (id: string) => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    onAbandonItem(id);
  };

  const calculateHoursLeft = (item: WishlistItem) => {
    const createdTime = new Date(item.createdAt).getTime();
    const targetTime = createdTime + item.delayHours * 3600000;
    const diffMs = targetTime - Date.now();
    if (diffMs <= 0) return 0;
    return Math.ceil(diffMs / 3600000);
  };

  return (
    <div className="space-y-4">
      {/* Banner Tổng tiền cứu rỗi thành công */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-950 text-white rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-semibold text-emerald-200 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-300" /> Tiền tiết kiệm nhờ kiềm chế bốc đồng
          </span>
          <div className="text-2xl font-black font-mono mt-1">
            {formatCurrency(totalMoneySaved, '₫', isPrivacyMode)}
          </div>
          <p className="text-[11px] text-emerald-200/80 mt-1">
            Số tiền bạn suýt chi nhưng đã tỉnh táo từ bỏ sau 72 giờ suy nghĩ!
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-white text-emerald-950 font-bold px-3.5 py-2 rounded-2xl text-xs hover:bg-emerald-50 transition-all shadow-md flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm món muốn mua
        </button>
      </div>

      {/* Danh sách đang đếm ngược 72h */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Đang hoãn mua sắm ({activeWaitingItems.length})
          </span>
        </div>

        {activeWaitingItems.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
            Không có món đồ nào đang chờ. Khi thích một món đồ nào trên Shopee/TikTok, hãy thêm vào đây và chờ 72 giờ trước khi mua!
          </div>
        ) : (
          activeWaitingItems.map((item) => {
            const hoursLeft = calculateHoursLeft(item);
            const isReadyToDecide = hoursLeft === 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-4 border transition-all space-y-3 ${
                  isReadyToDecide ? 'border-amber-300 bg-amber-50/20 shadow-md' : 'border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.reason ? `Lý do muốn mua: ${item.reason}` : 'Mua theo cảm xúc'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(item.estimatedPrice, '₫', isPrivacyMode)}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      {isReadyToDecide ? 'Đã hết 72h! Hãy quyết định' : `Còn ${hoursLeft} giờ`}
                    </div>
                  </div>
                </div>

                {/* Question buttons when cooling period is done */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    {isReadyToDecide ? 'Bạn còn thực sự cần món này không?' : 'Đang trong thời gian suy ngẫm...'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAbandonSuccess(item.id)}
                      className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-xl transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Tôi không cần nữa!
                    </button>

                    <button
                      onClick={() => onConfirmBuy(item)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all"
                    >
                      Vẫn mua
                    </button>

                    <button
                      onClick={() => onDeleteWishlist(item.id)}
                      className="text-slate-300 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Thêm món muốn mua */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" /> Hoãn mua sắm bốc đồng (Cooling-off)
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Món đồ bạn đang muốn mua
                </label>
                <input
                  type="text"
                  placeholder="VD: Tai nghe Bluetooth, Giày sneaker mới, Bàn phím cơ..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Giá tiền dự kiến (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="VD: 1200000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Thời gian hoãn quyết định
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDelayHours('48')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      delayHours === '48'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    48 Giờ (2 ngày)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelayHours('72')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      delayHours === '72'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    72 Giờ (3 ngày)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelayHours('168')}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      delayHours === '168'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    7 Ngày (1 tuần)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tại sao bạn muốn mua món này?
                </label>
                <input
                  type="text"
                  placeholder="VD: Thấy đẹp trên TikTok, Đang sale 30%..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Bắt đầu hoãn mua sắm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

