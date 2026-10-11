import React, { useState } from 'react';
import { PiggyBank, Plus, Sparkles, TrendingUp, X, Check, ArrowDownToLine } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SavingsGoal } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  isPrivacyMode: boolean;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onDeposit: (goalId: string, amount: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  isPrivacyMode,
  onAddGoal,
  onDeposit,
  onDeleteGoal,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialAmount, setInitialAmount] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('PiggyBank');
  const [color, setColor] = useState('#8b5cf6');

  const triggerCelebration = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!name.trim() || !target || target <= 0) {
      alert('Vui lòng nhập tên và số tiền mục tiêu');
      return;
    }

    onAddGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: parseFloat(initialAmount) || 0,
      deadline: deadline || undefined,
      icon,
      color,
    });

    setName('');
    setTargetAmount('');
    setIsCreateOpen(false);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      alert('Vui lòng nhập số tiền nạp hợp lệ');
      return;
    }

    const currentGoal = goals.find((g) => g.id === depositGoalId);
    if (currentGoal && currentGoal.currentAmount + amount >= currentGoal.targetAmount) {
      triggerCelebration();
    }

    onDeposit(depositGoalId, amount);
    setDepositGoalId(null);
    setDepositAmount('');
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-5 text-white shadow-lg flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-semibold text-purple-200">Kế hoạch tương lai</span>
          <h3 className="text-xl font-black mt-0.5 flex items-center gap-2">
            <PiggyBank className="w-6 h-6 text-purple-200" /> Heo đất & Mục tiêu
          </h3>
          <p className="text-xs text-purple-100 mt-1">
            Tích lũy từng ngày cho những ước mơ lớn!
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-white text-purple-900 font-bold px-3.5 py-2 rounded-2xl text-xs hover:bg-purple-50 transition-all shadow-md flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Tạo mục tiêu
        </button>
      </div>

      {/* Goals Grid */}
      <div className="space-y-3">
        {goals.map((goal) => {
          const percent = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          const isCompleted = percent >= 100;

          return (
            <div
              key={goal.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3 relative overflow-hidden"
            >
              {isCompleted && (
                <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" /> Hoàn thành 100%
                </div>
              )}

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm"
                  style={{ backgroundColor: goal.color }}
                >
                  {renderCategoryIcon(goal.icon, 'w-6 h-6')}
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">{goal.name}</h4>
                  <div className="text-xs text-slate-400">
                    {goal.deadline ? `Hạn chót: ${goal.deadline}` : 'Không giới hạn thời gian'}
                  </div>
                </div>
              </div>

              {/* Progress & Amounts */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline text-xs font-semibold">
                  <span className="font-mono text-slate-900 font-bold text-sm">
                    {formatCurrency(goal.currentAmount, '₫', isPrivacyMode)}
                  </span>
                  <span className="text-slate-400 font-mono">
                    Mục tiêu: {formatCurrency(goal.targetAmount, '₫', isPrivacyMode)}
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percent}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>Tiến độ: <strong className="text-slate-700">{percent.toFixed(1)}%</strong></span>
                  <button
                    onClick={() => setDepositGoalId(goal.id)}
                    className="flex items-center gap-1 text-indigo-600 font-bold hover:underline"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" /> Nạp thêm tiền
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-purple-600" /> Bỏ thêm tiền vào Heo đất
            </h3>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Số tiền nạp (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="VD: 200000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 text-white font-semibold text-xs rounded-xl hover:bg-purple-700 shadow-sm"
                >
                  Xác nhận nạp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">Tạo mục tiêu tích lũy</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3 pt-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tên mục tiêu
                </label>
                <input
                  type="text"
                  placeholder="VD: Mua xe máy mới, Đi Đà Lạt, Dự phòng..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Cần đạt (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="10000000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Đã có sẵn (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Thời hạn dự kiến (tùy chọn)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Bắt đầu tích lũy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

