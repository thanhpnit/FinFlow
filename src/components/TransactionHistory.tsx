import React, { useState } from 'react';
import { Search, Filter, Trash2, ArrowRightLeft, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { Transaction, Category, Wallet } from '../types';
import { formatCurrency, formatDateDisplay, renderCategoryIcon } from '../utils/formatters';

interface TransactionHistoryProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  isPrivacyMode: boolean;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({
  transactions,
  categories,
  wallets,
  isPrivacyMode,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'TRANSFER'>('ALL');
  const [filterWalletId, setFilterWalletId] = useState<string>('ALL');

  // Filter logic
  const filtered = transactions.filter((t) => {
    // Type filter
    if (filterType !== 'ALL' && t.type !== filterType) return false;

    // Wallet filter
    if (filterWalletId !== 'ALL' && t.walletId !== filterWalletId && t.toWalletId !== filterWalletId) {
      return false;
    }

    // Search keyword
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      const cat = categories.find((c) => c.id === t.categoryId)?.name.toLowerCase() || '';
      const wal = wallets.find((w) => w.id === t.walletId)?.name.toLowerCase() || '';
      const note = (t.note || '').toLowerCase();
      const amount = t.amount.toString();
      if (!cat.includes(lower) && !wal.includes(lower) && !note.includes(lower) && !amount.includes(lower)) {
        return false;
      }
    }

    return true;
  });

  // Sort descending by date
  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-3">
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo ghi chú, danh mục, số tiền..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-xl text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <div className="flex bg-slate-100 p-0.5 rounded-xl shrink-0 font-semibold">
            {(['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterType === t
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === 'ALL' ? 'Tất cả' : t === 'EXPENSE' ? 'Khoản Chi' : t === 'INCOME' ? 'Khoản Thu' : 'Chuyển ví'}
              </button>
            ))}
          </div>

          <select
            value={filterWalletId}
            onChange={(e) => setFilterWalletId(e.target.value)}
            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 outline-none shrink-0"
          >
            <option value="ALL">Mọi ví</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100">
            Không tìm thấy giao dịch nào.
          </div>
        ) : (
          sorted.map((item) => {
            const cat = categories.find((c) => c.id === item.categoryId);
            const sourceWallet = wallets.find((w) => w.id === item.walletId);
            const destWallet = item.toWalletId
              ? wallets.find((w) => w.id === item.toWalletId)
              : null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{
                      backgroundColor:
                        item.type === 'TRANSFER'
                          ? '#6366f1'
                          : cat?.color || '#94a3b8',
                    }}
                  >
                    {item.type === 'TRANSFER' ? (
                      <ArrowRightLeft className="w-4 h-4" />
                    ) : (
                      renderCategoryIcon(cat?.icon || 'CircleDot', 'w-4 h-4')
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 text-xs">
                        {item.type === 'TRANSFER'
                          ? `Chuyển ví: ${sourceWallet?.name} → ${destWallet?.name}`
                          : cat?.name || 'Khác'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <span>{formatDateDisplay(item.date)}</span>
                      <span>•</span>
                      <span className="text-slate-600 font-medium">
                        {sourceWallet?.name}
                      </span>
                      {item.note && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 italic font-normal line-clamp-1">
                            {item.note}
                          </span>
                        </>
                      )}
                    </div>

                    {item.workHoursEquivalent && (
                      <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                        ⚡ ~{item.workHoursEquivalent} giờ làm việc
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div
                      className={`font-mono font-bold text-sm ${
                        item.type === 'EXPENSE'
                          ? 'text-rose-600'
                          : item.type === 'INCOME'
                          ? 'text-emerald-600'
                          : 'text-indigo-600'
                      }`}
                    >
                      {item.type === 'EXPENSE'
                        ? '-'
                        : item.type === 'INCOME'
                        ? '+'
                        : ''}
                      {formatCurrency(item.amount, '₫', isPrivacyMode)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Xác nhận xóa giao dịch này? Số dư ví sẽ được tự động hoàn lại.')) {
                        onDeleteTransaction(item.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-all"
                    title="Xóa giao dịch"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

