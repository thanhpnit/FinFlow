import React, { useState } from 'react';
import { AlertTriangle, Plus, CheckCircle2, TrendingUp, X, Check, Target } from 'lucide-react';
import { Budget, Category, Transaction } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface BudgetViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  isPrivacyMode: boolean;
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgets,
  categories,
  transactions,
  isPrivacyMode,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // empty string means Total Budget
  const [limitInput, setLimitInput] = useState('');

  const currentMonth = new Date().toISOString().slice(0, 7);

  // Filter expenses of current month
  const monthlyExpenses = transactions.filter(
    (t) => t.type === 'EXPENSE' && t.date.startsWith(currentMonth)
  );

  const totalSpent = monthlyExpenses.reduce((s, t) => s + t.amount, 0);

  // Find or compute Total Budget
  const totalBudget = budgets.find((b) => b.month === currentMonth && !b.categoryId);
  const totalLimit = totalBudget ? totalBudget.amountLimit : 0;
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  const handleOpenModal = () => {
    setSelectedCategoryId('');
    setLimitInput('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(limitInput);
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập định mức ngân sách hợp lệ');
      return;
    }

    const newBudget: Budget = {
      id: `b-${selectedCategoryId || 'total'}-${currentMonth}`,
      categoryId: selectedCategoryId ? selectedCategoryId : undefined,
      amountLimit: amount,
      month: currentMonth,
    };

    onSaveBudget(newBudget);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Total Monthly Budget Banner */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ngân sách tháng {currentMonth.split('-')[1]}/{currentMonth.split('-')[0]}
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-slate-900">
                {formatCurrency(totalSpent, '₫', isPrivacyMode)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {totalLimit > 0 ? formatCurrency(totalLimit, '₫', isPrivacyMode) : 'Chưa đặt'}
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Thiết lập
          </button>
        </div>

        {/* Total Progress Bar */}
        {totalLimit > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span
                className={`flex items-center gap-1 ${
                  totalPercent > 100
                    ? 'text-rose-600'
                    : totalPercent > 80
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                }`}
              >
                {totalPercent > 100 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5" /> Bội chi {Math.round(totalPercent - 100)}%
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Đã dùng {Math.round(totalPercent)}%
                  </>
                )}
              </span>
              <span className="text-slate-500 font-mono">
                Còn lại: {formatCurrency(Math.max(0, totalLimit - totalSpent), '₫', isPrivacyMode)}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  totalPercent > 100
                    ? 'bg-rose-500'
                    : totalPercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, totalPercent)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Category Specific Budgets */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Định mức theo từng danh mục
        </h4>

        {budgets
          .filter((b) => b.categoryId && b.month === currentMonth)
          .map((budget) => {
            const cat = categories.find((c) => c.id === budget.categoryId);
            if (!cat) return null;

            const spent = monthlyExpenses
              .filter((t) => t.categoryId === cat.id)
              .reduce((s, t) => s + t.amount, 0);

            const percent = (spent / budget.amountLimit) * 100;

            return (
              <div
                key={budget.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                      style={{ backgroundColor: cat.color }}
                    >
                      {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{cat.name}</div>
                      <div className="text-xs text-slate-400">
                        {formatCurrency(spent, '₫', isPrivacyMode)} /{' '}
                        {formatCurrency(budget.amountLimit, '₫', isPrivacyMode)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        percent >= 100
                          ? 'bg-rose-100 text-rose-700'
                          : percent >= 80
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {Math.round(percent)}%
                    </span>
                    <button
                      onClick={() => onDeleteBudget(budget.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      percent > 100
                        ? 'bg-rose-500'
                        : percent > 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percent)}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Set Budget Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Thiết lập hạn mức ngân sách
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Phạm vi ngân sách
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Ngân sách tổng cả tháng</option>
                  {categories
                    .filter((c) => c.type === 'EXPENSE')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Số tiền hạn mức tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="VD: 5000000"
                  value={limitInput}
                  onChange={(e) => setLimitInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Lưu ngân sách
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

