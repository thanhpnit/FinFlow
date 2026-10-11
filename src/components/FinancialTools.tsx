import React, { useState } from 'react';
import { ShieldCheck, Flame, Clock, PieChart, Download, Upload, RotateCcw, Calculator, Sparkles } from 'lucide-react';
import { UserSettings, Transaction, Budget } from '../types';
import { formatCurrency, calculateFinancialHealth } from '../utils/formatters';

interface FinancialToolsProps {
  settings: UserSettings;
  transactions: Transaction[];
  budgets: Budget[];
  onUpdateSettings: (settings: UserSettings) => void;
  onExportData: () => void;
  onImportData: (json: string) => boolean;
  onResetData: () => void;
}

export const FinancialTools: React.FC<FinancialToolsProps> = ({
  settings,
  transactions,
  budgets,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
}) => {
  // Simulator input
  const [testAmount, setTestAmount] = useState('500000');
  const [wageInput, setWageInput] = useState(settings.hourlyWage.toString());

  // Rule 50/30/20 simulator
  const [incomeSim, setIncomeSim] = useState('15000000');
  const [methodType, setMethodType] = useState<'50-30-20' | '6-JARS'>('50-30-20');

  const health = calculateFinancialHealth(transactions, budgets, settings.streakCount);

  const numTestAmount = parseFloat(testAmount) || 0;
  const numWage = parseFloat(wageInput) || 60000;
  const simulatedHours = numWage > 0 ? (numTestAmount / numWage).toFixed(1) : '0';

  const simIncomeNum = parseFloat(incomeSim) || 0;

  const handleSaveWage = () => {
    onUpdateSettings({
      ...settings,
      hourlyWage: numWage,
    });
    alert('Đã cập nhật mức thu nhập theo giờ!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = onImportData(content);
        if (ok) alert('Khôi phục dữ liệu thành công!');
        else alert('File sao lưu không hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* 1. FINANCIAL HEALTH SCORE CARD */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Điểm sức khỏe tài chính
            </div>
            <div className="text-3xl font-black mt-1 flex items-baseline gap-2">
              <span>{health.score}/100</span>
              <span className="text-sm px-2.5 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                Hạng {health.grade}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-200 mt-1">{health.title}</p>
          </div>

          <div className="text-right">
            <div className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-2xl text-xs font-bold">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" /> {settings.streakCount} ngày Streak
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-300 mt-3 pt-3 border-t border-white/10 leading-relaxed">
          {health.advice}
        </p>

        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10 text-xs">
          <div>
            <span className="text-slate-400">Tỷ lệ tiết kiệm tháng:</span>{' '}
            <strong className="text-emerald-400">{health.savingsRate}%</strong>
          </div>
          <div>
            <span className="text-slate-400">Tuân thủ ngân sách:</span>{' '}
            <strong className="text-indigo-300">{health.budgetAdherence}%</strong>
          </div>
        </div>
      </div>

      {/* 2. CHỨC NĂNG ĐỘC ĐÁO: QUY ĐỔI GIỜ LÀM VIỆC (TIME-VALUE CALCULATOR) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" /> Thước đo giá trị bằng giờ làm việc
          </h3>
          <span className="text-[11px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full">
            Độc quyền
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Biết một món đồ trị giá bao nhiêu giờ cày cuốc giúp bạn kiềm chế chi tiêu bốc đồng!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Thu nhập mỗi giờ của bạn (VNĐ/h)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={wageInput}
                onChange={(e) => setWageInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
              />
              <button
                onClick={handleSaveWage}
                className="px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 shrink-0"
              >
                Lưu
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 block mb-1">
              Thử nghiệm món đồ bạn muốn mua
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
            />
          </div>
        </div>

        <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Để chi tiêu <strong>{formatCurrency(numTestAmount)}</strong>, bạn cần làm việc chăm chỉ{' '}
            <strong className="text-amber-700 text-sm underline">{simulatedHours} giờ</strong>!
          </span>
        </div>
      </div>

      {/* 3. MÁY PHÂN BỔ THU NHẬP 50/30/20 & 6 CHIẾC LỌ */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600" /> Phân bổ thu nhập thông minh
          </h3>

          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMethodType('50-30-20')}
              className={`px-2.5 py-1 rounded-lg ${
                methodType === '50-30-20' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              50/30/20
            </button>
            <button
              onClick={() => setMethodType('6-JARS')}
              className={`px-2.5 py-1 rounded-lg ${
                methodType === '6-JARS' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              6 Chiếc Lọ
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 block mb-1">
            Tổng thu nhập hàng tháng dự kiến (VNĐ)
          </label>
          <input
            type="number"
            value={incomeSim}
            onChange={(e) => setIncomeSim(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
          />
        </div>

        {methodType === '50-30-20' ? (
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-2.5">
              <div className="text-[10px] font-bold text-blue-700 uppercase">Thiết yếu (50%)</div>
              <div className="text-xs font-mono font-extrabold text-blue-950 mt-1">
                {formatCurrency(simIncomeNum * 0.5)}
              </div>
              <div className="text-[9px] text-blue-600 mt-0.5">Tiền trọ, ăn uống, điện</div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-2.5">
              <div className="text-[10px] font-bold text-amber-700 uppercase">Sở thích (30%)</div>
              <div className="text-xs font-mono font-extrabold text-amber-950 mt-1">
                {formatCurrency(simIncomeNum * 0.3)}
              </div>
              <div className="text-[9px] text-amber-600 mt-0.5">Cafe, mua sắm, chơi</div>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-2.5">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Tiết kiệm (20%)</div>
              <div className="text-xs font-mono font-extrabold text-emerald-950 mt-1">
                {formatCurrency(simIncomeNum * 0.2)}
              </div>
              <div className="text-[9px] text-emerald-600 mt-0.5">Đầu tư, trả nợ, quỹ</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 pt-1 text-center">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <div className="text-[9px] font-bold text-slate-600">NEC (55%)</div>
              <div className="text-[10px] font-mono font-bold">{formatCurrency(simIncomeNum * 0.55)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <div className="text-[9px] font-bold text-slate-600">FFA (10%)</div>
              <div className="text-[10px] font-mono font-bold">{formatCurrency(simIncomeNum * 0.1)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <div className="text-[9px] font-bold text-slate-600">LTSS (10%)</div>
              <div className="text-[10px] font-mono font-bold">{formatCurrency(simIncomeNum * 0.1)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <div className="text-[9px] font-bold text-slate-600">EDU (10%)</div>
              <div className="text-[10px] font-mono font-bold">{formatCurrency(simIncomeNum * 0.1)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <div className="text-[9px] font-bold text-slate-600">PLAY (10%)</div>
              <div className="text-[10px] font-mono font-bold">{formatCurrency(simIncomeNum * 0.1)}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-2">
              <div className="text-[9px] font-bold text-slate-600">GIVE (5%)</div>
              <div className="text-[10px] font-mono font-bold">{formatCurrency(simIncomeNum * 0.05)}</div>
            </div>
          </div>
        )}
      </div>

      {/* 4. SAO LƯU & BẢO MẬT DỮ LIỆU */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="font-bold text-slate-800 text-sm">Quản lý & Lưu trữ Dữ liệu An Toàn</h3>
        <p className="text-xs text-slate-500">
          Dữ liệu được lưu vĩnh viễn trên máy của bạn và không bao giờ gửi đi đâu nếu không có sự cho phép.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={onExportData}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-indigo-600" /> Tải file sao lưu (JSON)
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer">
            <Upload className="w-4 h-4 text-emerald-600" /> Khôi phục từ file
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="pt-2">
          <button
            onClick={() => {
              if (confirm('Bạn có chắc muốn xóa trắng toàn bộ dữ liệu để sử dụng như lúc mới tải ứng dụng?')) {
                onResetData();
              }
            }}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-rose-200/60"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Xóa trắng dữ liệu (Như vừa tải app)
          </button>
        </div>
      </div>
    </div>
  );
};

