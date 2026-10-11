import React from 'react';
import { Home, WalletCards, Plus, BarChart3, LayoutGrid } from 'lucide-react';

export type TabType = 'HOME' | 'WALLETS' | 'ANALYTICS' | 'BUDGETS' | 'MORE';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-2 pt-1.5 pb-[max(0.6rem,calc(env(safe-area-inset-bottom)+0.3rem))] z-40 max-w-lg mx-auto sm:rounded-t-3xl sm:border-x shadow-lg">
      <div className="flex items-center justify-around">
        {/* Tab Home */}
        <button
          onClick={() => onSelectTab('HOME')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all active:scale-95 ${
            currentTab === 'HOME'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 tracking-tight">Sổ thu chi</span>
        </button>

        {/* Tab Wallets */}
        <button
          onClick={() => onSelectTab('WALLETS')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all active:scale-95 ${
            currentTab === 'WALLETS'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <WalletCards className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 tracking-tight">Ví tiền</span>
        </button>

        {/* Big Center Floating Add Button */}
        <div className="relative -top-4 sm:-top-5">
          <button
            onClick={onOpenAddModal}
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-300/80 hover:scale-105 active:scale-90 transition-all border-2 border-white"
            title="Thêm thu chi siêu tốc"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Analytics & Budgets */}
        <button
          onClick={() => onSelectTab('ANALYTICS')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all active:scale-95 ${
            currentTab === 'ANALYTICS'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 tracking-tight">Thống kê</span>
        </button>

        {/* Tab More (Tools, Goals, Debts) */}
        <button
          onClick={() => onSelectTab('MORE')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-2xl transition-all active:scale-95 ${
            currentTab === 'MORE'
              ? 'text-indigo-600 font-bold'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 tracking-tight">Tiện ích</span>
        </button>
      </div>
    </nav>
  );
};
