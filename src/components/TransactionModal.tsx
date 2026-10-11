import React, { useState, useEffect } from 'react';
import { X, Check, Plus, ArrowRightLeft, Calendar, FileText, Sparkles, Clock } from 'lucide-react';
import { Wallet, Category, Transaction, TransactionType } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  hourlyWage: number;
  initialType?: TransactionType;
  onSave: (transactionData: Omit<Transaction, 'id'>, continueAdding: boolean) => void;
  onAddCategoryClick: () => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  wallets,
  categories,
  hourlyWage,
  initialType = 'EXPENSE',
  onSave,
  onAddCategoryClick,
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState<string>(wallets[1]?.id || wallets[0]?.id || '');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [calculationExpression, setCalculationExpression] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setDisplayValue('0');
      setCalculationExpression('');
      setNote('');
      setDate(new Date().toISOString().slice(0, 16));
      if (wallets.length > 0 && !selectedWalletId) {
        setSelectedWalletId(wallets[0].id);
      }
    }
  }, [isOpen, initialType, wallets]);

  // Set default category when type changes
  useEffect(() => {
    const availableCategories = categories.filter((c) => c.type === (type === 'INCOME' ? 'INCOME' : 'EXPENSE'));
    if (availableCategories.length > 0) {
      setSelectedCategoryId(availableCategories[0].id);
    }
  }, [type, categories]);

  if (!isOpen) return null;

  // Safe parse numeric value
  const parseCurrentAmount = (): number => {
    try {
      // Evaluate expression if there are operators
      const cleaned = displayValue.replace(/,/g, '');
      if (/[+\-*/]/.test(cleaned)) {
        // Safe math evaluator for basic keypad
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${cleaned})`)();
        return isNaN(result) || !isFinite(result) ? 0 : Math.max(0, result);
      }
      const val = parseFloat(cleaned);
      return isNaN(val) ? 0 : Math.max(0, val);
    } catch {
      return 0;
    }
  };

  const currentAmount = parseCurrentAmount();
  const workHours = hourlyWage > 0 && type === 'EXPENSE' ? (currentAmount / hourlyWage).toFixed(1) : null;

  // Keypad Actions
  const handleNumberClick = (digit: string) => {
    if (displayValue === '0' && digit !== '.') {
      setDisplayValue(digit);
    } else {
      setDisplayValue((prev) => prev + digit);
    }
  };

  const handleOperatorClick = (op: string) => {
    // If last char is operator, replace it
    const lastChar = displayValue.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
      setDisplayValue((prev) => prev.slice(0, -1) + op);
    } else {
      setDisplayValue((prev) => prev + op);
    }
  };

  const handleAddThreeZeros = () => {
    if (displayValue === '0') return;
    setDisplayValue((prev) => prev + '000');
  };

  const handleClear = () => {
    setDisplayValue('0');
    setCalculationExpression('');
  };

  const handleBackspace = () => {
    if (displayValue.length <= 1) {
      setDisplayValue('0');
    } else {
      setDisplayValue((prev) => prev.slice(0, -1));
    }
  };

  const handleEvaluate = () => {
    const result = parseCurrentAmount();
    setDisplayValue(result.toString());
  };

  const handleSubmit = (continueAdding: boolean) => {
    const finalAmount = parseCurrentAmount();
    if (finalAmount <= 0) {
      alert('Vui lòng nhập số tiền lớn hơn 0');
      return;
    }

    if (type === 'TRANSFER' && selectedWalletId === toWalletId) {
      alert('Ví chuyển và ví nhận tiền không được trùng nhau');
      return;
    }

    const payload: Omit<Transaction, 'id'> = {
      walletId: selectedWalletId,
      toWalletId: type === 'TRANSFER' ? toWalletId : undefined,
      categoryId: type === 'TRANSFER' ? 'c-transfer' : selectedCategoryId,
      amount: finalAmount,
      type,
      date: new Date(date).toISOString(),
      note: note.trim(),
      workHoursEquivalent: workHours ? parseFloat(workHours) : undefined,
    };

    onSave(payload, continueAdding);

    if (continueAdding) {
      setDisplayValue('0');
      setNote('');
    } else {
      onClose();
    }
  };

  const filteredCategories = categories.filter((c) =>
    type === 'INCOME' ? c.type === 'INCOME' : c.type === 'EXPENSE'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh] overflow-hidden">
        {/* Header with Type Selector */}
        <div className="px-5 pt-3.5 pb-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <button
            onClick={onClose}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setType('EXPENSE')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chi tiền
            </button>
            <button
              onClick={() => setType('INCOME')}
              className={`px-4 py-1.5 rounded-lg transition-all ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Thu tiền
            </button>
            <button
              onClick={() => setType('TRANSFER')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                type === 'TRANSFER'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Chuyển
            </button>
          </div>

          <div className="w-8" />
        </div>

        {/* Amount Screen & Work-Hour Feature */}
        <div className="px-6 py-4 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
            <span>Số tiền ({type === 'EXPENSE' ? 'Chi ra' : type === 'INCOME' ? 'Thu vào' : 'Chuyển đi'})</span>
            {calculationExpression && <span className="font-mono text-slate-500">{calculationExpression}</span>}
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-900 overflow-x-auto whitespace-nowrap scrollbar-none py-1">
              {displayValue.includes('+') || displayValue.includes('-') || displayValue.includes('*') || displayValue.includes('/') ? (
                <span className="text-indigo-600">{displayValue}</span>
              ) : (
                formatCurrency(currentAmount)
              )}
            </div>
          </div>

          {/* CHỨC NĂNG ĐỘC ĐÁO: Đổi chi phí ra giờ làm việc (Work-hour cost insight) */}
          {type === 'EXPENSE' && currentAmount > 0 && workHours && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50/90 border border-amber-200/60 px-3 py-1.5 rounded-xl animate-pulse">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                Khoản này tương đương <strong>{workHours} giờ làm việc</strong> của bạn (lương{' '}
                {formatCurrency(hourlyWage)}/h).
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Form Body: Wallets & Categories */}
        <div className="overflow-y-auto px-5 py-3 space-y-4 max-h-[30vh]">
          {/* Wallets Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {type === 'TRANSFER' ? 'Từ Ví' : 'Nguồn tiền'}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => setSelectedWalletId(wallet.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                    selectedWalletId === wallet.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: wallet.color }}
                  />
                  {wallet.name}
                </button>
              ))}
            </div>
          </div>

          {/* Transfer To Wallet Picker */}
          {type === 'TRANSFER' && (
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Đến Ví nhận
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {wallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => setToWalletId(wallet.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium whitespace-nowrap transition-all ${
                      toWalletId === wallet.id
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-semibold shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: wallet.color }}
                    />
                    {wallet.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Categories 1-Touch Grid */}
          {type !== 'TRANSFER' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Danh mục (1 Chạm)
                </label>
                <button
                  onClick={onAddCategoryClick}
                  className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm mới
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {filteredCategories.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`flex flex-col items-center p-2 rounded-2xl transition-all text-center ${
                        isSelected
                          ? 'bg-slate-900 text-white shadow-md scale-102'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center mb-1 text-white shadow-xs"
                        style={{ backgroundColor: cat.color }}
                      >
                        {renderCategoryIcon(cat.icon, 'w-4 h-4')}
                      </div>
                      <span className="text-[11px] leading-tight line-clamp-1 font-medium">
                        {cat.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Note & Date Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Ghi chú nhanh (vd: Bún chả, Mua sữa...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent outline-none text-slate-800 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Integrated Speedy Keypad + Action Bar */}
        <div className="bg-slate-100/90 border-t border-slate-200/80 p-3 pb-[max(0.75rem,calc(env(safe-area-inset-bottom)+0.5rem))] shrink-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-2">
            <button
              onClick={() => handleNumberClick('7')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              7
            </button>
            <button
              onClick={() => handleNumberClick('8')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              8
            </button>
            <button
              onClick={() => handleNumberClick('9')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              9
            </button>
            <button
              onClick={() => handleOperatorClick('+')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 active:scale-95 transition-all font-mono"
            >
              +
            </button>

            <button
              onClick={() => handleNumberClick('4')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              4
            </button>
            <button
              onClick={() => handleNumberClick('5')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              5
            </button>
            <button
              onClick={() => handleNumberClick('6')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              6
            </button>
            <button
              onClick={() => handleOperatorClick('-')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 active:scale-95 transition-all font-mono"
            >
              -
            </button>

            <button
              onClick={() => handleNumberClick('1')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              1
            </button>
            <button
              onClick={() => handleNumberClick('2')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              2
            </button>
            <button
              onClick={() => handleNumberClick('3')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              3
            </button>
            <button
              onClick={handleClear}
              className="py-2.5 sm:py-3 text-sm font-bold bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 active:scale-95 transition-all"
            >
              C
            </button>

            {/* PHÍM TẮT THÔNG MINH +000 & BACKSPACE */}
            <button
              onClick={handleAddThreeZeros}
              className="py-2.5 sm:py-3 text-xs sm:text-sm font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 active:scale-95 transition-all font-mono"
            >
              +000
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="py-2.5 sm:py-3 text-lg font-bold bg-white text-slate-800 rounded-xl shadow-xs hover:bg-slate-50 active:scale-95 transition-all font-mono"
            >
              0
            </button>
            <button
              onClick={handleBackspace}
              className="py-2.5 sm:py-3 text-sm font-bold bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 active:scale-95 transition-all"
            >
              ⌫
            </button>
            <button
              onClick={handleEvaluate}
              className="py-2.5 sm:py-3 text-lg font-bold bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 active:scale-95 transition-all font-mono"
            >
              =
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={() => handleSubmit(true)}
              className="py-3 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              Lưu & Nhập tiếp
            </button>

            <button
              onClick={() => handleSubmit(false)}
              className={`py-3 px-3 rounded-xl text-white font-semibold text-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 shadow-md ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                  : type === 'INCOME'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
              }`}
            >
              <Check className="w-4 h-4 shrink-0" />
              Lưu chi tiêu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

