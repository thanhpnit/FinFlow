import React, { useState } from 'react';
import { CreditCard, Plus, ShieldAlert, AlertTriangle, CheckCircle, Calendar, Trash2, X, Check, Sparkles } from 'lucide-react';
import { CreditCardItem, InstallmentItem } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CreditAndInstallmentsProps {
  creditCards: CreditCardItem[];
  installments: InstallmentItem[];
  isPrivacyMode: boolean;
  onAddCreditCard: (card: Omit<CreditCardItem, 'id'>) => void;
  onUpdateCreditCard: (card: CreditCardItem) => void;
  onDeleteCreditCard: (id: string) => void;
  onAddInstallment: (item: Omit<InstallmentItem, 'id'>) => void;
  onPayInstallmentTerm: (id: string) => void;
  onDeleteInstallment: (id: string) => void;
}

export const CreditAndInstallments: React.FC<CreditAndInstallmentsProps> = ({
  creditCards,
  installments,
  isPrivacyMode,
  onAddCreditCard,
  onDeleteCreditCard,
  onAddInstallment,
  onPayInstallmentTerm,
  onDeleteInstallment,
}) => {
  const [activeTab, setActiveTab] = useState<'CARDS' | 'INSTALLMENTS'>('CARDS');
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Form states Card
  const [cardName, setCardName] = useState('');
  const [bankName, setBankName] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [currentSpent, setCurrentSpent] = useState('0');
  const [statementDay, setStatementDay] = useState('20');
  const [paymentDueDay, setPaymentDueDay] = useState('5');
  const [cardColor, setCardColor] = useState('#6366f1');

  // Form states Installment
  const [productName, setProductName] = useState('');
  const [platform, setPlatform] = useState<InstallmentItem['platform']>('SPAYLATER');
  const [totalAmount, setTotalAmount] = useState('');
  const [totalTerms, setTotalTerms] = useState('6');
  const [dueDay, setDueDay] = useState('10');

  // Tính tổng gánh nặng trả góp hàng tháng
  const monthlyInstallmentBurden = installments
    .filter((i) => i.paidTerms < i.totalTerms)
    .reduce((s, i) => s + i.monthlyAmount, 0);

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(limitAmount);
    if (!cardName.trim() || !limit || limit <= 0) {
      alert('Vui lòng nhập tên thẻ và hạn mức tín dụng');
      return;
    }

    onAddCreditCard({
      cardName: cardName.trim(),
      bankName: bankName.trim() || 'Ngân hàng',
      limitAmount: limit,
      currentSpent: parseFloat(currentSpent) || 0,
      statementDay: parseInt(statementDay, 10) || 20,
      paymentDueDay: parseInt(paymentDueDay, 10) || 5,
      cardColor,
    });

    setCardName('');
    setLimitAmount('');
    setIsCardModalOpen(false);
  };

  const handleCreateInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    const terms = parseInt(totalTerms, 10) || 6;
    if (!productName.trim() || !total || total <= 0) {
      alert('Vui lòng nhập món hàng và tổng số tiền');
      return;
    }

    const monthly = Math.round(total / terms);

    onAddInstallment({
      productName: productName.trim(),
      platform,
      totalAmount: total,
      monthlyAmount: monthly,
      totalTerms: terms,
      paidTerms: 0,
      dueDay: parseInt(dueDay, 10) || 10,
      startDate: new Date().toISOString().slice(0, 7),
    });

    setProductName('');
    setTotalAmount('');
    setIsInstallModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs: Thẻ tín dụng vs Trả góp BNPL */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveTab('CARDS')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'CARDS'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" /> Thẻ Tín Dụng & Sao Kê ({creditCards.length})
        </button>
        <button
          onClick={() => setActiveTab('INSTALLMENTS')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'INSTALLMENTS'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Bẫy Trả Góp BNPL ({installments.length})
        </button>
      </div>

      {/* TAB 1: THẺ TÍN DỤNG */}
      {activeTab === 'CARDS' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Danh sách thẻ tín dụng
            </span>
            <button
              onClick={() => setIsCardModalOpen(true)}
              className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm thẻ mới
            </button>
          </div>

          {creditCards.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
              Chưa có thẻ tín dụng nào. Bấm "Thêm thẻ mới" để theo dõi ngày chốt sao kê và ngày miễn lãi!
            </div>
          ) : (
            creditCards.map((card) => {
              const available = Math.max(0, card.limitAmount - card.currentSpent);
              const utilization = (card.currentSpent / card.limitAmount) * 100;
              const isHighUtilization = utilization >= 70;

              return (
                <div
                  key={card.id}
                  className="rounded-3xl p-5 text-white shadow-xl relative overflow-hidden space-y-4"
                  style={{ backgroundColor: card.cardColor }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/70">
                        {card.bankName}
                      </span>
                      <h4 className="text-lg font-black tracking-tight">{card.cardName}</h4>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm(`Xóa thẻ "${card.cardName}"?`)) onDeleteCreditCard(card.id);
                      }}
                      className="p-1.5 bg-black/20 hover:bg-black/40 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white/80" />
                    </button>
                  </div>

                  {/* Amounts */}
                  <div className="grid grid-cols-2 gap-3 text-xs border-y border-white/15 py-3">
                    <div>
                      <span className="text-white/70 text-[10px]">Đã quẹt nợ:</span>
                      <div className="font-mono font-black text-base">
                        {formatCurrency(card.currentSpent, '₫', isPrivacyMode)}
                      </div>
                    </div>
                    <div>
                      <span className="text-white/70 text-[10px]">Hạn mức khả dụng:</span>
                      <div className="font-mono font-black text-base text-emerald-300">
                        {formatCurrency(available, '₫', isPrivacyMode)}
                      </div>
                    </div>
                  </div>

                  {/* Statement & Due Date */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-1.5 text-white/90">
                      <Calendar className="w-3.5 h-3.5 text-amber-300" />
                      <span>Chốt sao kê: <strong>Ngày {card.statementDay}</strong></span>
                    </div>
                    <div className="text-amber-200 font-bold">
                      Hạn trả: Ngày {card.paymentDueDay}
                    </div>
                  </div>

                  {/* High utilization warning */}
                  {isHighUtilization && (
                    <div className="bg-rose-950/50 border border-rose-400/40 p-2.5 rounded-2xl flex items-center gap-2 text-xs text-rose-200">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>
                        Cảnh báo: Bạn đã tiêu {utilization.toFixed(0)}% hạn mức. Cần trả bớt nợ để tránh nợ xấu!
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: BẪY TRẢ GÓP BNPL */}
      {activeTab === 'INSTALLMENTS' && (
        <div className="space-y-3">
          {/* Banner gánh nặng trả góp */}
          <div className="bg-rose-50 border border-rose-200/80 rounded-3xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-rose-700 uppercase flex items-center gap-1">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> Gánh nặng trả góp mỗi tháng
              </span>
              <div className="text-xl font-black font-mono text-rose-950 mt-1">
                {formatCurrency(monthlyInstallmentBurden, '₫', isPrivacyMode)}
              </div>
              <p className="text-[10px] text-rose-700/80 mt-0.5">
                Tổng tiền cố định bạn PHẢI trả hàng tháng cho các món đồ trả góp
              </p>
            </div>

            <button
              onClick={() => setIsInstallModalOpen(true)}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm khoản trả góp
            </button>
          </div>

          {/* Danh sách trả góp */}
          <div className="space-y-2.5">
            {installments.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
                Chưa có gói trả góp nào. Bấm "Thêm khoản trả góp" để theo dõi Shopee SPayLater, HomeCredit hoặc thẻ tín dụng!
              </div>
            ) : (
              installments.map((item) => {
                const percent = Math.min(100, (item.paidTerms / item.totalTerms) * 100);
                const isFinished = item.paidTerms >= item.totalTerms;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl p-4 border transition-all space-y-3 ${
                      isFinished ? 'border-slate-200/60 opacity-60' : 'border-slate-200/90 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-800 uppercase">
                            {item.platform === 'SPAYLATER' ? 'Shopee SPayLater' : item.platform}
                          </span>
                          <h4 className="font-bold text-slate-900 text-sm">{item.productName}</h4>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Ngày đóng: Ngày {item.dueDay} hàng tháng • Tổng: {formatCurrency(item.totalAmount)}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-rose-600 text-sm">
                          {formatCurrency(item.monthlyAmount, '₫', isPrivacyMode)}/tháng
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Đã trả: {item.paidTerms}/{item.totalTerms} kỳ
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-1">
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isFinished ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      {isFinished ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã trả hết 100%
                        </span>
                      ) : (
                        <button
                          onClick={() => onPayInstallmentTerm(item.id)}
                          className="px-2.5 py-1 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg transition-all"
                        >
                          + Đã đóng kỳ tháng này
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Xác nhận xóa khoản "${item.productName}"?`)) onDeleteInstallment(item.id);
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
        </div>
      )}

      {/* Modal Thêm Thẻ Tín Dụng */}
      {isCardModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Thêm thẻ tín dụng</h3>
              <button onClick={() => setIsCardModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tên thẻ / Loại thẻ
                </label>
                <input
                  type="text"
                  placeholder="VD: Techcombank Visa Signature, VIB Online Plus..."
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Ngân hàng phát hành
                </label>
                <input
                  type="text"
                  placeholder="VD: Techcombank, VPBank, MB Bank..."
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Hạn mức tín dụng (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 50000000"
                    value={limitAmount}
                    onChange={(e) => setLimitAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Số nợ hiện tại (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentSpent}
                    onChange={(e) => setCurrentSpent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Ngày chốt sao kê
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="VD: 20"
                    value={statementDay}
                    onChange={(e) => setStatementDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Hạn trả nợ thẻ
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="VD: 5"
                    value={paymentDueDay}
                    onChange={(e) => setPaymentDueDay(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Màu thẻ
                </label>
                <div className="flex gap-2">
                  {['#4f46e5', '#0f172a', '#059669', '#dc2626', '#d97706', '#9333ea'].map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCardColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${cardColor === c ? 'scale-125 ring-2 ring-indigo-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Lưu thông tin thẻ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Gói Trả Góp BNPL */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Thêm gói trả góp BNPL</h3>
              <button onClick={() => setIsInstallModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstallment} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Món hàng / Dịch vụ trả góp
                </label>
                <input
                  type="text"
                  placeholder="VD: iPhone 16 Pro Max, Tủ lạnh Panasonic..."
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Nền tảng trả góp
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as InstallmentItem['platform'])}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="SPAYLATER">Shopee SPayLater</option>
                  <option value="CREDIT_CARD">Trả góp qua Thẻ tín dụng 0%</option>
                  <option value="HOME_CREDIT">Home Credit / FE Credit</option>
                  <option value="OTHER">Nền tảng khác</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Tổng giá trị (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 18000000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Số kỳ trả (tháng)
                  </label>
                  <input
                    type="number"
                    placeholder="VD: 6 hoặc 12"
                    value={totalTerms}
                    onChange={(e) => setTotalTerms(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Ngày thanh toán mỗi tháng (1 - 31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="VD: 10"
                  value={dueDay}
                  onChange={(e) => setDueDay(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Lưu gói trả góp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

