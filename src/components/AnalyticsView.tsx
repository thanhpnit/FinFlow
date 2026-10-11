import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Download, Filter, TrendingDown } from 'lucide-react';
import { Transaction, Category, Wallet } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface AnalyticsViewProps {
  transactions: Transaction[];
  categories: Category[];
  wallets: Wallet[];
  isPrivacyMode: boolean;
}

type PeriodFilter = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL';

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  transactions,
  categories,
  wallets,
  isPrivacyMode,
}) => {
  const [period, setPeriod] = useState<PeriodFilter>('MONTH');

  // Filter transactions according to period
  const filterTransactions = () => {
    const now = new Date();
    return transactions.filter((t) => {
      const tDate = new Date(t.date);
      if (period === 'TODAY') {
        return tDate.toDateString() === now.toDateString();
      }
      if (period === 'WEEK') {
        const oneWeekAgo = new Date(now.getTime() - 7 * 86400000);
        return tDate >= oneWeekAgo;
      }
      if (period === 'MONTH') {
        return (
          tDate.getMonth() === now.getMonth() &&
          tDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });
  };

  const filtered = filterTransactions();

  const totalExpense = filtered
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const totalIncome = filtered
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate =
    totalIncome > 0
      ? Math.max(0, Math.min(100, Math.round((netSavings / totalIncome) * 100)))
      : 0;

  // Group expenses by category
  const categoryStats: { category: Category; amount: number; count: number; percentage: number }[] = [];

  const expenseTransactions = filtered.filter((t) => t.type === 'EXPENSE');

  categories
    .filter((c) => c.type === 'EXPENSE')
    .forEach((cat) => {
      const items = expenseTransactions.filter((t) => t.categoryId === cat.id);
      const amount = items.reduce((s, t) => s + t.amount, 0);
      if (amount > 0) {
        categoryStats.push({
          category: cat,
          amount,
          count: items.length,
          percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        });
      }
    });

  // Sort descending by amount
  categoryStats.sort((a, b) => b.amount - a.amount);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã GD', 'Thời gian', 'Loại', 'Số tiền (VND)', 'Danh mục', 'Ví', 'Ghi chú'];
    const rows = filtered.map((t) => {
      const cat = categories.find((c) => c.id === t.categoryId)?.name || 'Khác';
      const wal = wallets.find((w) => w.id === t.walletId)?.name || 'Khác';
      return [
        t.id,
        new Date(t.date).toLocaleString('vi-VN'),
        t.type === 'EXPENSE' ? 'Chi tiêu' : t.type === 'INCOME' ? 'Thu nhập' : 'Chuyển khoản',
        t.amount,
        `"${cat}"`,
        `"${wal}"`,
        `"${t.note || ''}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `FinFlow_BaoCao_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Period Filter & Export Toolbar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
          {(['TODAY', 'WEEK', 'MONTH', 'ALL'] as PeriodFilter[]).map((p) => {
            const labels: Record<PeriodFilter, string> = {
              TODAY: 'Hôm nay',
              WEEK: '7 Ngày',
              MONTH: 'Tháng này',
              ALL: 'Tất cả',
            };
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  period === p
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-2xl transition-all shadow-xs"
          title="Xuất file Excel/CSV"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">Xuất CSV</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Thu vào */}
        <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mb-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Thu nhập
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-emerald-950">
            {formatCurrency(totalIncome, '₫', isPrivacyMode)}
          </div>
        </div>

        {/* Chi ra */}
        <div className="bg-rose-50/80 border border-rose-100 rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-700 mb-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Chi tiêu
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-rose-950">
            {formatCurrency(totalExpense, '₫', isPrivacyMode)}
          </div>
        </div>

        {/* Tiết kiệm / Dôi dư */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-3.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-700 mb-1">
            <TrendingDown className="w-3.5 h-3.5" /> Tỉ lệ tích lũy
          </div>
          <div className="text-sm sm:text-base font-extrabold font-mono text-indigo-950">
            {savingsRate}%
          </div>
        </div>
      </div>

      {/* Visual Spending Breakdown Bars */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" /> Phân bổ chi tiêu theo danh mục
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {categoryStats.length} danh mục phát sinh
          </span>
        </div>

        {categoryStats.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Chưa có giao dịch chi tiêu nào trong khoảng thời gian này.
          </div>
        ) : (
          <div className="space-y-3.5">
            {/* Color Distribution Bar */}
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
              {categoryStats.map((item) => (
                <div
                  key={item.category.id}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.category.color,
                  }}
                  title={`${item.category.name}: ${item.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Category Detail List */}
            <div className="space-y-3 pt-2">
              {categoryStats.map((item) => (
                <div key={item.category.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: item.category.color }}
                    >
                      {renderCategoryIcon(item.category.icon, 'w-4 h-4')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{item.category.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {item.count} lần chi • {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">
                      {formatCurrency(item.amount, '₫', isPrivacyMode)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

