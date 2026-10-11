import React from 'react';
import { Eye, EyeOff, Flame, Smartphone, Monitor, Bell } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  settings: UserSettings;
  onTogglePrivacy: () => void;
  isMobileMockup: boolean;
  onToggleMockup: () => void;
  notificationCount: number;
  onOpenNotifications: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onTogglePrivacy,
  isMobileMockup,
  onToggleMockup,
  notificationCount,
  onOpenNotifications,
}) => {
  return (
    <header className="px-4 sm:px-5 py-3.5 bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-100">
          F
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-1.5">
            FinFlow
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              PRO
            </span>
          </h1>
          <span className="text-[10px] text-slate-400 font-medium">Quản lý thu chi thông minh</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Chuông thông báo nhắc hạn thanh toán */}
        <button
          onClick={onOpenNotifications}
          className={`p-2 rounded-xl border relative transition-all active:scale-95 ${
            notificationCount > 0
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
          }`}
          title="Thông báo hạn thanh toán"
        >
          <Bell className="w-4 h-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[9px] font-black font-mono ring-2 ring-white animate-pulse">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Streak Counter */}
        <div
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200/60 rounded-xl text-xs font-bold text-amber-800"
          title={`Chuỗi kỷ luật: Bạn đã duy trì ghi chép ${settings.streakCount} ngày liên tiếp!`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>{settings.streakCount}d</span>
        </div>

        {/* Privacy Eye Toggle */}
        <button
          onClick={onTogglePrivacy}
          className={`p-2 rounded-xl border transition-all ${
            settings.isPrivacyMode
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          }`}
          title={settings.isPrivacyMode ? 'Hiện số dư' : 'Ẩn số dư (Chế độ riêng tư)'}
        >
          {settings.isPrivacyMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Mobile View Toggle (Useful on desktop) */}
        <button
          onClick={onToggleMockup}
          className="hidden sm:flex p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all"
          title={isMobileMockup ? 'Chuyển sang chế độ toàn màn hình' : 'Mô phỏng khung điện thoại'}
        >
          {isMobileMockup ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
