import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Category } from '../types';
import { renderCategoryIcon } from '../utils/formatters';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (category: Omit<Category, 'id'>) => void;
}

const AVAILABLE_ICONS = [
  'Utensils', 'Coffee', 'ShoppingCart', 'Car', 'Zap', 'ShoppingBag', 'Film', 'HeartPulse',
  'Home', 'GraduationCap', 'Plane', 'Smartphone', 'Laptop', 'Coins', 'TrendingUp', 'Gift',
  'Gamepad2', 'Briefcase', 'Dumbbell', 'Music', 'Sparkles', 'Tag', 'Fuel', 'BookOpen'
];

const AVAILABLE_COLORS = [
  '#f97316', '#b45309', '#10b981', '#06b6d4', '#eab308', '#ec4899', '#a855f7', '#ef4444',
  '#6366f1', '#3b82f6', '#14b8a6', '#84cc16', '#64748b', '#0ea5e9', '#f43f5e', '#8b5cf6'
];

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onAddCategory }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên danh mục');
      return;
    }

    onAddCategory({
      name: name.trim(),
      type,
      icon: selectedIcon,
      color: selectedColor,
    });

    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-base">Thêm danh mục mới</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Type Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                type === 'EXPENSE' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Khoản Chi
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                type === 'INCOME' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Khoản Thu
            </button>
          </div>

          {/* Name Input & Live Preview */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
              Tên danh mục
            </label>
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: selectedColor }}
              >
                {renderCategoryIcon(selectedIcon, 'w-5 h-5')}
              </div>
              <input
                type="text"
                placeholder="VD: Nuôi mèo, Spa làm đẹp, Tiền điện..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>
          </div>

          {/* Icon Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Chọn biểu tượng
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
              {AVAILABLE_ICONS.map((icon) => (
                <button
                  type="button"
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                    selectedIcon === icon ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {renderCategoryIcon(icon, 'w-5 h-5')}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Chọn màu sắc
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 shadow-xs' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Tạo danh mục
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

