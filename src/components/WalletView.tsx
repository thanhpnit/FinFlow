import React, { useState } from 'react';
import { Plus, Building2, Smartphone, Banknote, PiggyBank, CreditCard, Edit3, Trash2, X, Check } from 'lucide-react';
import { Wallet } from '../types';
import { formatCurrency } from '../utils/formatters';

interface WalletViewProps {
  wallets: Wallet[];
  isPrivacyMode: boolean;
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
  onUpdateWallet: (wallet: Wallet) => void;
  onDeleteWallet: (id: string) => void;
}

const WALLET_TYPES = [
  { type: 'CASH', label: 'Tiền mặt', icon: Banknote },
  { type: 'BANK', label: 'Tài khoản Ngân hàng', icon: Building2 },
  { type: 'E_WALLET', label: 'Ví điện tử (MoMo, ZaloPay)', icon: Smartphone },
  { type: 'SAVINGS', label: 'Sổ tiết kiệm / Heo đất', icon: PiggyBank },
  { type: 'CREDIT', label: 'Thẻ tín dụng (Credit)', icon: CreditCard },
];

export const WalletView: React.FC<WalletViewProps> = ({
  wallets,
  isPrivacyMode,
  onAddWallet,
  onUpdateWallet,
  onDeleteWallet,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [selectedType, setSelectedType] = useState<Wallet['type']>('BANK');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);

  const openCreateModal = () => {
    setEditingWallet(null);
    setName('');
    setBalance('0');
    setSelectedType('BANK');
    setSelectedColor('#3b82f6');
    setIsModalOpen(true);
  };

  const openEditModal = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setName(wallet.name);
    setBalance(wallet.balance.toString());
    setSelectedType(wallet.type);
    setSelectedColor(wallet.color);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên ví');
      return;
    }

    const numBalance = parseFloat(balance) || 0;

    if (editingWallet) {
      onUpdateWallet({
        ...editingWallet,
        name: name.trim(),
        balance: numBalance,
        type: selectedType,
        color: selectedColor,
      });
    } else {
      onAddWallet({
        name: name.trim(),
        balance: numBalance,
        type: selectedType,
        icon: 'Wallet',
        color: selectedColor,
      });
    }

    setIsModalOpen(false);
  };

  const getWalletIcon = (type: Wallet['type']) => {
    switch (type) {
      case 'CASH': return <Banknote className="w-5 h-5" />;
      case 'BANK': return <Building2 className="w-5 h-5" />;
      case 'E_WALLET': return <Smartphone className="w-5 h-5" />;
      case 'SAVINGS': return <PiggyBank className="w-5 h-5" />;
      case 'CREDIT': return <CreditCard className="w-5 h-5" />;
      default: return <Banknote className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Total Balance Overview Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-slate-400">Tổng tài sản khả dụng</span>
            <div className="text-3xl font-extrabold font-mono tracking-tight mt-1">
              {formatCurrency(totalBalance, '₫', isPrivacyMode)}
            </div>
          </div>
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-slate-300 font-medium">
            {wallets.length} ví/tài khoản
          </span>
        </div>

        <div className="mt-5 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
          <span className="text-slate-400">Quản lý các nguồn tiền cá nhân</span>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-medium transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Thêm ví mới
          </button>
        </div>
      </div>

      {/* List of Wallets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {wallets.map((wallet) => (
          <div
            key={wallet.id}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: wallet.color }}
              >
                {getWalletIcon(wallet.type)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{wallet.name}</h4>
                <div className="text-xs font-mono font-semibold text-slate-500">
                  {formatCurrency(wallet.balance, '₫', isPrivacyMode)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openEditModal(wallet)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Sửa / Điều chỉnh số dư"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {wallets.length > 1 && (
                <button
                  onClick={() => {
                    if (confirm(`Xác nhận xóa ví "${wallet.name}"?`)) {
                      onDeleteWallet(wallet.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Xóa ví"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Wallet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base">
                {editingWallet ? 'Chỉnh sửa / Điều chỉnh ví' : 'Thêm ví mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Tên ví / Tài khoản
                </label>
                <input
                  type="text"
                  placeholder="VD: Techcombank, Tiền tiêu vặt, Ví ShopeePay..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Số dư hiện tại (VNĐ)
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Loại tài khoản
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {WALLET_TYPES.map((t) => (
                    <button
                      type="button"
                      key={t.type}
                      onClick={() => setSelectedType(t.type as Wallet['type'])}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all ${
                        selectedType === t.type
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <t.icon className="w-4 h-4 text-indigo-600" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Màu sắc đại diện
                </label>
                <div className="flex gap-2.5 flex-wrap">
                  {['#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#f59e0b', '#06b6d4', '#64748b', '#ef4444'].map((col) => (
                    <button
                      type="button"
                      key={col}
                      onClick={() => setSelectedColor(col)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        selectedColor === col ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500 shadow-sm' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> {editingWallet ? 'Cập nhật ví' : 'Tạo ví mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

