import React, { useState } from 'react';
import { TrendingDown, Calendar, AlertTriangle, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { Wallet, RecurringBill, InstallmentItem, Transaction } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CashFlowForecastProps {
  wallets: Wallet[];
  bills: RecurringBill[];
  installments: InstallmentItem[];
  transactions: Transaction[];
  salaryDay: number;
  isPrivacyMode: boolean;
  onUpdateSalaryDay: (day: number) => void;
}

export const CashFlowForecast: React.FC<CashFlowForecastProps> = ({
  wallets,
  bills,
  installments,
  transactions,
  salaryDay,
  isPrivacyMode,
  onUpdateSalaryDay,
}) => {
  const [testSpendAmount, setTestSpendAmount] = useState('');
  const [isEditingSalaryDay, setIsEditingSalaryDay] = useState(false);
  const [salaryDayInput, setSalaryDayInput] = useState(salaryDay.toString());

  // Tính số ngày còn lại đến kỳ lương tiếp theo
  const now = new Date();
  const currentDay = now.getDate();

  let daysUntilPaycheck = 0;
  if (currentDay < salaryDay) {
    daysUntilPaycheck = salaryDay - currentDay;
  } else if (currentDay === salaryDay) {
    daysUntilPaycheck = 0;
  } else {
    // Qua ngày lương tháng này rồi, tính đến ngày lương tháng sau
    const daysInCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    daysUntilPaycheck = daysInCurrentMonth - currentDay + salaryDay;
  }

  // Tổng số dư khả dụng (Tiền mặt + Ngân hàng + Ví điện tử)
  const liquidBalance = wallets
    .filter((w) => w.type !== 'SAVINGS')
    .reduce((s, w) => s + w.balance, 0);

  // Tổng hóa đơn và trả góp chưa thanh toán trước ngày nhận lương
  const currentMonthStr = now.toISOString().slice(0, 7);
  const upcomingBills = bills
    .filter((b) => b.lastPaidMonth !== currentMonthStr)
    .reduce((s, b) => s + b.amount, 0);

  const upcomingInstallments = installments
    .filter((i) => i.paidTerms < i.totalTerms)
    .reduce((s, i) => s + i.monthlyAmount, 0);

  const totalCommittedExpenses = upcomingBills + upcomingInstallments;

  // Số dư tự do còn lại
  const freeCash = liquidBalance - totalCommittedExpenses;

  // Hạn mức chi tiêu an toàn mỗi ngày
  const safeDailyBudget =
    daysUntilPaycheck > 0 ? Math.max(0, Math.floor(freeCash / daysUntilPaycheck)) : freeCash;

  // Mô phỏng mua sắm
  const testNum = parseFloat(testSpendAmount) || 0;
  const simulatedFreeCash = freeCash - testNum;
  const simulatedDailyBudget =
    daysUntilPaycheck > 0
      ? Math.floor(simulatedFreeCash / daysUntilPaycheck)
      : simulatedFreeCash;

  const handleSaveSalaryDay = () => {
    const day = parseInt(salaryDayInput, 10);
    if (day >= 1 && day <= 31) {
      onUpdateSalaryDay(day);
      setIsEditingSalaryDay(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Paycheck Countdown Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
              <Calendar className="w-4 h-4 text-emerald-400" /> Đếm ngược ngày nhận lương
            </div>
            <div className="text-3xl font-black font-mono tracking-tight mt-1 flex items-baseline gap-2">
              <span>{daysUntilPaycheck === 0 ? 'Hôm nay!' : `${daysUntilPaycheck} ngày nữa`}</span>
              <span className="text-xs text-slate-300 font-normal">
                (Ngày {salaryDay} hàng tháng)
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEditingSalaryDay(!isEditingSalaryDay)}
            className="text-[11px] bg-white/10 hover:bg-white/20 text-indigo-200 px-3 py-1.5 rounded-xl font-medium transition-all"
          >
            Đổi ngày lương
          </button>
        </div>

        {isEditingSalaryDay && (
          <div className="bg-white/10 p-3 rounded-2xl flex items-center gap-2 text-xs">
            <span>Ngày nhận lương của bạn (1 - 31):</span>
            <input
              type="number"
              min="1"
              max="31"
              value={salaryDayInput}
              onChange={(e) => setSalaryDayInput(e.target.value)}
              className="w-16 px-2 py-1 bg-white text-slate-900 rounded-lg text-center font-bold font-mono"
            />
            <button
              onClick={handleSaveSalaryDay}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold"
            >
              Lưu
            </button>
          </div>
        )}

        {/* Safe Daily Budget Highlight */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">Hạn mức chi an toàn / ngày:</span>
            <div
              className={`font-mono font-black text-lg mt-0.5 ${
                safeDailyBudget <= 50000 ? 'text-amber-300' : 'text-emerald-300'
              }`}
            >
              {formatCurrency(safeDailyBudget, '₫', isPrivacyMode)}
            </div>
          </div>

          <div>
            <span className="text-slate-400 text-[11px]">Dự phòng còn lại:</span>
            <div
              className={`font-mono font-black text-lg mt-0.5 ${
                freeCash < 0 ? 'text-rose-400' : 'text-indigo-200'
              }`}
            >
              {formatCurrency(freeCash, '₫', isPrivacyMode)}
            </div>
          </div>
        </div>

        {freeCash < 0 && (
          <div className="bg-rose-500/20 border border-rose-500/40 p-2.5 rounded-xl text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Cảnh báo: Bạn sẽ bị thiếu hụt tài chính trước kỳ lương tới do các hóa đơn sắp tới vượt số dư hiện có!
            </span>
          </div>
        )}
      </div>

      {/* MÔ PHỎNG: "NẾU TÔI MUA MÓN NÀY THÌ SAO?" */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Giả lập: "Nếu tôi mua món này thì sao?"
          </h3>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
            Dự báo tương lai
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Nhập số tiền món đồ bạn đang phân vân mua để xem nó ảnh hưởng thế nào đến túi tiền của bạn trước ngày nhận lương.
        </p>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Số tiền dự định chi (VNĐ)
          </label>
          <input
            type="number"
            placeholder="VD: 500000"
            value={testSpendAmount}
            onChange={(e) => setTestSpendAmount(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {testNum > 0 && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-2 transition-all ${
              simulatedFreeCash < 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : simulatedDailyBudget < 50000
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="font-bold flex items-center gap-1.5">
              {simulatedFreeCash < 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600" /> Không nên mua! Bạn sẽ cạn tiền trước ngày nhận lương.
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Bạn có thể mua, nhưng cần thắt chặt các ngày sau.
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <span className="text-[11px] opacity-80">Số dư còn lại sau khi mua:</span>
                <div className="font-mono font-bold text-sm">
                  {formatCurrency(simulatedFreeCash)}
                </div>
              </div>
              <div>
                <span className="text-[11px] opacity-80">Ngân sách mỗi ngày giảm còn:</span>
                <div className="font-mono font-bold text-sm">
                  {formatCurrency(simulatedDailyBudget)}/ngày
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

