import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Category,
  Transaction,
  Budget,
  SavingsGoal,
  DebtItem,
  RecurringBill,
  CreditCardItem,
  InstallmentItem,
  WishlistItem,
  GiftEventItem,
  UserSettings,
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { TransactionModal } from './components/TransactionModal';
import { CategoryModal } from './components/CategoryModal';
import { WalletView } from './components/WalletView';
import { AnalyticsView } from './components/AnalyticsView';
import { BudgetView } from './components/BudgetView';
import { SavingsGoals } from './components/SavingsGoals';
import { DebtTracker } from './components/DebtTracker';
import { FinancialTools } from './components/FinancialTools';
import { TransactionHistory } from './components/TransactionHistory';
import { BillManager } from './components/BillManager';
import { CreditAndInstallments } from './components/CreditAndInstallments';
import { CashFlowForecast } from './components/CashFlowForecast';
import { CoolingWishlist } from './components/CoolingWishlist';
import { VietnameseEventBook } from './components/VietnameseEventBook';
import { NotificationModal, PendingNotificationItem } from './components/NotificationModal';
import { formatCurrency } from './utils/formatters';
import {
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  PieChart,
  Target,
  PiggyBank,
  HandCoins,
  Wrench,
  BellRing,
  CreditCard,
  TrendingDown,
  ShoppingBag,
  Gift,
} from 'lucide-react';

export type MoreSubTabType =
  | 'BILLS'
  | 'CREDIT_BNPL'
  | 'FORECAST'
  | 'WISHLIST'
  | 'EVENTS'
  | 'GOALS'
  | 'DEBTS'
  | 'TOOLS';

export const App: React.FC = () => {
  // App Data States
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [debts, setDebts] = useState<DebtItem[]>([]);
  const [bills, setBills] = useState<RecurringBill[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCardItem[]>([]);
  const [installments, setInstallments] = useState<InstallmentItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [giftEvents, setGiftEvents] = useState<GiftEventItem[]>([]);
  const [settings, setSettings] = useState<UserSettings>(StorageService.getSettings());

  // UI States
  const [currentTab, setCurrentTab] = useState<TabType>('HOME');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [transactionTypePreset, setTransactionTypePreset] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [isMobileMockup, setIsMobileMockup] = useState(false);
  const [nativeNotificationGranted, setNativeNotificationGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  // Sub-tabs
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'CHARTS' | 'BUDGETS'>('CHARTS');
  const [moreSubTab, setMoreSubTab] = useState<MoreSubTabType>('BILLS');

  // Initial load
  useEffect(() => {
    setWallets(StorageService.getWallets());
    setCategories(StorageService.getCategories());
    setTransactions(StorageService.getTransactions());
    setBudgets(StorageService.getBudgets());
    setGoals(StorageService.getGoals());
    setDebts(StorageService.getDebts());
    setBills(StorageService.getBills());
    setCreditCards(StorageService.getCreditCards());
    setInstallments(StorageService.getInstallments());
    setWishlist(StorageService.getWishlist());
    setGiftEvents(StorageService.getGiftEvents());
    setSettings(StorageService.getSettings());
  }, []);

  // Quick calculations for Home overview
  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentDay = new Date().getDate();
  const monthTransactions = transactions.filter((t) => t.date.startsWith(currentMonth));
  const monthIncome = monthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  // ==========================================
  // HỆ THỐNG QUÉT & TẠO THÔNG BÁO TỰ ĐỘNG
  // ==========================================
  const computeNotifications = (): PendingNotificationItem[] => {
    const list: PendingNotificationItem[] = [];

    // 1. Quét Hóa đơn định kỳ
    bills.forEach((b) => {
      const isPaid = b.lastPaidMonth === currentMonth;
      if (!isPaid) {
        const daysRemaining = b.dueDay - currentDay;
        if (daysRemaining <= 3) {
          list.push({
            id: `notif-bill-${b.id}`,
            type: 'BILL',
            title: `Hóa đơn: ${b.name}`,
            amount: b.amount,
            subtitle: `Định kỳ ngày ${b.dueDay} hàng tháng`,
            daysRemaining,
            rawItem: b,
          });
        }
      }
    });

    // 2. Quét Thẻ tín dụng đến hạn thanh toán
    creditCards.forEach((c) => {
      if (c.currentSpent > 0) {
        const daysRemaining = c.paymentDueDay - currentDay;
        if (daysRemaining <= 3) {
          list.push({
            id: `notif-card-${c.id}`,
            type: 'CREDIT_CARD',
            title: `Hạn thanh toán thẻ ${c.cardName}`,
            amount: c.currentSpent,
            subtitle: `Hạn chót ngày ${c.paymentDueDay}`,
            daysRemaining,
            rawItem: c,
          });
        }
      }
    });

    // 3. Quét Gói trả góp BNPL
    installments.forEach((i) => {
      if (i.paidTerms < i.totalTerms) {
        const daysRemaining = i.dueDay - currentDay;
        if (daysRemaining <= 3) {
          list.push({
            id: `notif-inst-${i.id}`,
            type: 'INSTALLMENT',
            title: `Trả góp: ${i.productName} (Kỳ ${i.paidTerms + 1}/${i.totalTerms})`,
            amount: i.monthlyAmount,
            subtitle: `Đến hạn ngày ${i.dueDay}`,
            daysRemaining,
            rawItem: i,
          });
        }
      }
    });

    // 4. Quét Sổ nợ phải trả
    debts.forEach((d) => {
      if (d.type === 'BORROWED' && !d.isSettled && d.dueDate) {
        const dueTime = new Date(d.dueDate).getTime();
        const diffDays = Math.ceil((dueTime - Date.now()) / 86400000);
        if (diffDays <= 3) {
          list.push({
            id: `notif-debt-${d.id}`,
            type: 'DEBT',
            title: `Trả nợ: ${d.personName}`,
            amount: d.amount,
            subtitle: d.note || 'Khoản nợ đến hạn',
            daysRemaining: diffDays,
            rawItem: d,
          });
        }
      }
    });

    // 5. Quét Danh sách muốn mua (Đã hết 72h)
    wishlist.forEach((w) => {
      if (w.status === 'WAITING') {
        const createdTime = new Date(w.createdAt).getTime();
        const targetTime = createdTime + w.delayHours * 3600000;
        if (Date.now() >= targetTime) {
          list.push({
            id: `notif-wish-${w.id}`,
            type: 'WISHLIST',
            title: `Đã hết 72h suy ngẫm: ${w.name}`,
            amount: w.estimatedPrice,
            subtitle: 'Bạn còn muốn mua món này không?',
            daysRemaining: 0,
            rawItem: w,
          });
        }
      }
    });

    // Sắp xếp: Quá hạn & Hôm nay lên trước
    return list.sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const pendingNotifications = computeNotifications();

  // Bật thông báo đẩy native
  const handleRequestNativeNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNativeNotificationGranted(true);
        if (pendingNotifications.length > 0) {
          const first = pendingNotifications[0];
          new Notification('FinFlow: Khoản phí đến hạn!', {
            body: `${first.title} (${formatCurrency(first.amount || 0)}) cần thanh toán!`,
            icon: '/favicon.svg',
          });
        }
      }
    }
  };

  // HANDLERS: Transactions
  const handleSaveTransaction = (
    data: Omit<Transaction, 'id'>,
    continueAdding: boolean
  ) => {
    const newTx: Transaction = {
      ...data,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };

    const updatedWallets = wallets.map((w) => {
      if (data.type === 'EXPENSE' && w.id === data.walletId) {
        return { ...w, balance: w.balance - data.amount };
      }
      if (data.type === 'INCOME' && w.id === data.walletId) {
        return { ...w, balance: w.balance + data.amount };
      }
      if (data.type === 'TRANSFER') {
        if (w.id === data.walletId) return { ...w, balance: w.balance - data.amount };
        if (w.id === data.toWalletId) return { ...w, balance: w.balance + data.amount };
      }
      return w;
    });

    const updatedTxs = [newTx, ...transactions];

    setWallets(updatedWallets);
    setTransactions(updatedTxs);

    StorageService.saveWallets(updatedWallets);
    StorageService.saveTransactions(updatedTxs);

    if (!continueAdding) {
      setIsTransactionModalOpen(false);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    const updatedWallets = wallets.map((w) => {
      if (target.type === 'EXPENSE' && w.id === target.walletId) {
        return { ...w, balance: w.balance + target.amount };
      }
      if (target.type === 'INCOME' && w.id === target.walletId) {
        return { ...w, balance: w.balance - target.amount };
      }
      if (target.type === 'TRANSFER') {
        if (w.id === target.walletId) return { ...w, balance: w.balance + target.amount };
        if (w.id === target.toWalletId) return { ...w, balance: w.balance - target.amount };
      }
      return w;
    });

    const updatedTxs = transactions.filter((t) => t.id !== id);

    setWallets(updatedWallets);
    setTransactions(updatedTxs);

    StorageService.saveWallets(updatedWallets);
    StorageService.saveTransactions(updatedTxs);
  };

  // HANDLERS: Bills
  const handleAddBill = (billData: Omit<RecurringBill, 'id'>) => {
    const newBill: RecurringBill = {
      ...billData,
      id: `bill-${Date.now()}`,
    };
    const updated = [...bills, newBill];
    setBills(updated);
    StorageService.saveBills(updated);
  };

  const handlePayBill = (bill: RecurringBill) => {
    // 1. Tạo giao dịch chi tiêu tương ứng
    const payload: Omit<Transaction, 'id'> = {
      walletId: bill.walletId || wallets[0]?.id || 'w-cash',
      categoryId: 'c-bills',
      amount: bill.amount,
      type: 'EXPENSE',
      date: new Date().toISOString(),
      note: `Thanh toán hóa đơn: ${bill.name}`,
    };
    handleSaveTransaction(payload, false);

    // 2. Đánh dấu hóa đơn đã thanh toán tháng này
    const updatedBills = bills.map((b) =>
      b.id === bill.id ? { ...b, lastPaidMonth: currentMonth } : b
    );
    setBills(updatedBills);
    StorageService.saveBills(updatedBills);
  };

  const handleDeleteBill = (id: string) => {
    const updated = bills.filter((b) => b.id !== id);
    setBills(updated);
    StorageService.saveBills(updated);
  };

  // HANDLERS: Credit Cards
  const handleAddCreditCard = (cardData: Omit<CreditCardItem, 'id'>) => {
    const newCard: CreditCardItem = {
      ...cardData,
      id: `card-${Date.now()}`,
    };
    const updated = [...creditCards, newCard];
    setCreditCards(updated);
    StorageService.saveCreditCards(updated);
  };

  const handleUpdateCreditCard = (card: CreditCardItem) => {
    const updated = creditCards.map((c) => (c.id === card.id ? card : c));
    setCreditCards(updated);
    StorageService.saveCreditCards(updated);
  };

  const handleDeleteCreditCard = (id: string) => {
    const updated = creditCards.filter((c) => c.id !== id);
    setCreditCards(updated);
    StorageService.saveCreditCards(updated);
  };

  // HANDLERS: Installments
  const handleAddInstallment = (itemData: Omit<InstallmentItem, 'id'>) => {
    const newInst: InstallmentItem = {
      ...itemData,
      id: `inst-${Date.now()}`,
    };
    const updated = [...installments, newInst];
    setInstallments(updated);
    StorageService.saveInstallments(updated);
  };

  const handlePayInstallmentTerm = (id: string) => {
    const target = installments.find((i) => i.id === id);
    if (!target) return;

    // Tạo giao dịch chi tiêu
    const payload: Omit<Transaction, 'id'> = {
      walletId: wallets[0]?.id || 'w-bank',
      categoryId: 'c-shopping',
      amount: target.monthlyAmount,
      type: 'EXPENSE',
      date: new Date().toISOString(),
      note: `Trả góp: ${target.productName} (Kỳ ${target.paidTerms + 1}/${target.totalTerms})`,
    };
    handleSaveTransaction(payload, false);

    const updated = installments.map((i) =>
      i.id === id ? { ...i, paidTerms: Math.min(i.totalTerms, i.paidTerms + 1) } : i
    );
    setInstallments(updated);
    StorageService.saveInstallments(updated);
  };

  const handleDeleteInstallment = (id: string) => {
    const updated = installments.filter((i) => i.id !== id);
    setInstallments(updated);
    StorageService.saveInstallments(updated);
  };

  // HANDLERS: Wishlist (72h Cooling-off)
  const handleAddWishlist = (itemData: Omit<WishlistItem, 'id'>) => {
    const newItem: WishlistItem = {
      ...itemData,
      id: `wish-${Date.now()}`,
    };
    const updated = [newItem, ...wishlist];
    setWishlist(updated);
    StorageService.saveWishlist(updated);
  };

  const handleAbandonWishlist = (id: string) => {
    const updated = wishlist.map((w) => (w.id === id ? { ...w, status: 'SAVED' as const } : w));
    setWishlist(updated);
    StorageService.saveWishlist(updated);
  };

  const handleConfirmBuyWishlist = (item: WishlistItem) => {
    // Chuyển thành giao dịch chi tiêu
    const payload: Omit<Transaction, 'id'> = {
      walletId: wallets[0]?.id || 'w-cash',
      categoryId: 'c-shopping',
      amount: item.estimatedPrice,
      type: 'EXPENSE',
      date: new Date().toISOString(),
      note: `Mua sau 72h: ${item.name}`,
    };
    handleSaveTransaction(payload, false);

    const updated = wishlist.map((w) => (w.id === item.id ? { ...w, status: 'BOUGHT' as const } : w));
    setWishlist(updated);
    StorageService.saveWishlist(updated);
  };

  const handleDeleteWishlist = (id: string) => {
    const updated = wishlist.filter((w) => w.id !== id);
    setWishlist(updated);
    StorageService.saveWishlist(updated);
  };

  // HANDLERS: Gift Events
  const handleAddGiftEvent = (itemData: Omit<GiftEventItem, 'id'>) => {
    const newEvent: GiftEventItem = {
      ...itemData,
      id: `gift-${Date.now()}`,
    };
    const updated = [newEvent, ...giftEvents];
    setGiftEvents(updated);
    StorageService.saveGiftEvents(updated);
  };

  const handleDeleteGiftEvent = (id: string) => {
    const updated = giftEvents.filter((e) => e.id !== id);
    setGiftEvents(updated);
    StorageService.saveGiftEvents(updated);
  };

  // HANDLERS: Wallets & Settings
  const handleAddWallet = (walletData: Omit<Wallet, 'id'>) => {
    const newWallet: Wallet = {
      ...walletData,
      id: `w-${Date.now()}`,
    };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    StorageService.saveWallets(updated);
  };

  const handleUpdateWallet = (updatedWallet: Wallet) => {
    const updated = wallets.map((w) => (w.id === updatedWallet.id ? updatedWallet : w));
    setWallets(updated);
    StorageService.saveWallets(updated);
  };

  const handleDeleteWallet = (id: string) => {
    const updated = wallets.filter((w) => w.id !== id);
    setWallets(updated);
    StorageService.saveWallets(updated);
  };

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `c-${Date.now()}`,
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    StorageService.saveCategories(updated);
  };

  const handleSaveBudget = (budget: Budget) => {
    const exists = budgets.find((b) => b.id === budget.id);
    let updated: Budget[];
    if (exists) {
      updated = budgets.map((b) => (b.id === budget.id ? budget : b));
    } else {
      updated = [...budgets, budget];
    }
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  const handleDeleteBudget = (id: string) => {
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    StorageService.saveBudgets(updated);
  };

  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goalData,
      id: `g-${Date.now()}`,
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    StorageService.saveGoals(updated);
  };

  const handleDepositGoal = (goalId: string, amount: number) => {
    const updated = goals.map((g) =>
      g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
    );
    setGoals(updated);
    StorageService.saveGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    StorageService.saveGoals(updated);
  };

  const handleAddDebt = (debtData: Omit<DebtItem, 'id'>) => {
    const newDebt: DebtItem = {
      ...debtData,
      id: `d-${Date.now()}`,
    };
    const updated = [newDebt, ...debts];
    setDebts(updated);
    StorageService.saveDebts(updated);
  };

  const handleToggleSettleDebt = (id: string) => {
    const updated = debts.map((d) => (d.id === id ? { ...d, isSettled: !d.isSettled } : d));
    setDebts(updated);
    StorageService.saveDebts(updated);
  };

  const handleDeleteDebt = (id: string) => {
    const updated = debts.filter((d) => d.id !== id);
    setDebts(updated);
    StorageService.saveDebts(updated);
  };

  const handleTogglePrivacy = () => {
    const updated: UserSettings = {
      ...settings,
      isPrivacyMode: !settings.isPrivacyMode,
    };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinFlow_SaoLuu_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (json: string): boolean => {
    const ok = StorageService.importData(json);
    if (ok) {
      setWallets(StorageService.getWallets());
      setCategories(StorageService.getCategories());
      setTransactions(StorageService.getTransactions());
      setBudgets(StorageService.getBudgets());
      setGoals(StorageService.getGoals());
      setDebts(StorageService.getDebts());
      setBills(StorageService.getBills());
      setCreditCards(StorageService.getCreditCards());
      setInstallments(StorageService.getInstallments());
      setWishlist(StorageService.getWishlist());
      setGiftEvents(StorageService.getGiftEvents());
      setSettings(StorageService.getSettings());
    }
    return ok;
  };

  const handleResetData = () => {
    StorageService.resetToCleanInstall();
    setWallets(StorageService.getWallets());
    setCategories(StorageService.getCategories());
    setTransactions([]);
    setBudgets([]);
    setGoals([]);
    setDebts([]);
    setBills([]);
    setCreditCards([]);
    setInstallments([]);
    setWishlist([]);
    setGiftEvents([]);
    setSettings(StorageService.getSettings());
  };

  const openModalWithType = (type: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setTransactionTypePreset(type);
    setIsTransactionModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex justify-center items-start sm:py-6 sm:px-4 antialiased">
      <div
        className={`w-full bg-white flex flex-col min-h-screen sm:min-h-[88vh] sm:max-h-[92vh] sm:rounded-3xl shadow-sm sm:shadow-xl sm:border border-slate-200/90 transition-all relative overflow-hidden ${
          isMobileMockup
            ? 'max-w-md sm:border-[6px] sm:border-slate-800 sm:rounded-[40px]'
            : 'max-w-xl sm:max-w-2xl'
        }`}
      >
        {isMobileMockup && (
          <div className="hidden sm:flex justify-center pt-2 pb-1 bg-white sticky top-0 z-50">
            <div className="w-24 h-3.5 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
          </div>
        )}

        {/* Global App Header with Notification Bell */}
        <Header
          settings={settings}
          onTogglePrivacy={handleTogglePrivacy}
          isMobileMockup={isMobileMockup}
          onToggleMockup={() => setIsMobileMockup(!isMobileMockup)}
          notificationCount={pendingNotifications.length}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
        />

        {/* Main Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-3.5 sm:px-5 py-4 pb-28 sm:pb-24 space-y-4">
          {/* TAB 1: HOME */}
          {currentTab === 'HOME' && (
            <div className="space-y-4">
              {/* Overview Net Worth Banner */}
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Tổng tài sản hiện có
                </span>
                <div className="text-3xl font-black font-mono tracking-tight mt-1">
                  {formatCurrency(totalBalance, '₫', settings.isPrivacyMode)}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 pt-3.5 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Thu tháng này</div>
                      <div className="font-mono font-bold text-emerald-300">
                        {formatCurrency(monthIncome, '₫', settings.isPrivacyMode)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">Chi tháng này</div>
                      <div className="font-mono font-bold text-rose-300">
                        {formatCurrency(monthExpense, '₫', settings.isPrivacyMode)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fast Action Quick Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => openModalWithType('EXPENSE')}
                  className="bg-white hover:bg-rose-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 text-slate-700"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Chi tiền</span>
                </button>

                <button
                  onClick={() => openModalWithType('INCOME')}
                  className="bg-white hover:bg-emerald-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 text-slate-700"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Thu tiền</span>
                </button>

                <button
                  onClick={() => openModalWithType('TRANSFER')}
                  className="bg-white hover:bg-indigo-50 border border-slate-200/80 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 text-slate-700"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold">Chuyển ví</span>
                </button>
              </div>

              {/* Transaction History Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-2 px-1">
                  <h3 className="font-extrabold text-slate-800 text-sm">Lịch sử thu chi</h3>
                  <span className="text-xs text-slate-400">
                    {transactions.length} giao dịch
                  </span>
                </div>
                <TransactionHistory
                  transactions={transactions}
                  categories={categories}
                  wallets={wallets}
                  isPrivacyMode={settings.isPrivacyMode}
                  onDeleteTransaction={handleDeleteTransaction}
                />
              </div>
            </div>
          )}

          {/* TAB 2: WALLETS */}
          {currentTab === 'WALLETS' && (
            <WalletView
              wallets={wallets}
              isPrivacyMode={settings.isPrivacyMode}
              onAddWallet={handleAddWallet}
              onUpdateWallet={handleUpdateWallet}
              onDeleteWallet={handleDeleteWallet}
            />
          )}

          {/* TAB 3: ANALYTICS & BUDGETS */}
          {currentTab === 'ANALYTICS' && (
            <div className="space-y-4">
              <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs font-semibold">
                <button
                  onClick={() => setAnalyticsSubTab('CHARTS')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    analyticsSubTab === 'CHARTS'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PieChart className="w-4 h-4" /> Biểu đồ chi tiêu
                </button>
                <button
                  onClick={() => setAnalyticsSubTab('BUDGETS')}
                  className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    analyticsSubTab === 'BUDGETS'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Target className="w-4 h-4" /> Hạn mức ngân sách
                </button>
              </div>

              {analyticsSubTab === 'CHARTS' ? (
                <AnalyticsView
                  transactions={transactions}
                  categories={categories}
                  wallets={wallets}
                  isPrivacyMode={settings.isPrivacyMode}
                />
              ) : (
                <BudgetView
                  budgets={budgets}
                  categories={categories}
                  transactions={transactions}
                  isPrivacyMode={settings.isPrivacyMode}
                  onSaveBudget={handleSaveBudget}
                  onDeleteBudget={handleDeleteBudget}
                />
              )}
            </div>
          )}

          {/* TAB 4: MORE (TẤT CẢ TIỆN ÍCH ĐỘT PHÁ) */}
          {currentTab === 'MORE' && (
            <div className="space-y-4">
              {/* Category Pills Navigation */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs font-semibold">
                <button
                  onClick={() => setMoreSubTab('BILLS')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'BILLS'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BellRing className="w-3.5 h-3.5" /> Hóa đơn định kỳ
                </button>

                <button
                  onClick={() => setMoreSubTab('CREDIT_BNPL')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'CREDIT_BNPL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" /> Thẻ tín dụng & Trả góp
                </button>

                <button
                  onClick={() => setMoreSubTab('FORECAST')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'FORECAST'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <TrendingDown className="w-3.5 h-3.5" /> Dự báo dòng tiền
                </button>

                <button
                  onClick={() => setMoreSubTab('WISHLIST')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'WISHLIST'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" /> Hoãn mua 72h
                </button>

                <button
                  onClick={() => setMoreSubTab('EVENTS')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'EVENTS'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Gift className="w-3.5 h-3.5" /> Sổ mừng cưới & Lễ
                </button>

                <button
                  onClick={() => setMoreSubTab('GOALS')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'GOALS'
                      ? 'bg-purple-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <PiggyBank className="w-3.5 h-3.5" /> Heo đất
                </button>

                <button
                  onClick={() => setMoreSubTab('DEBTS')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'DEBTS'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <HandCoins className="w-3.5 h-3.5" /> Sổ nợ
                </button>

                <button
                  onClick={() => setMoreSubTab('TOOLS')}
                  className={`px-3 py-2 rounded-xl whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    moreSubTab === 'TOOLS'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" /> Công cụ
                </button>
              </div>

              {/* NỘI DUNG TỪNG TIỆN ÍCH */}
              {moreSubTab === 'BILLS' && (
                <BillManager
                  bills={bills}
                  wallets={wallets}
                  isPrivacyMode={settings.isPrivacyMode}
                  onAddBill={handleAddBill}
                  onPayBill={handlePayBill}
                  onDeleteBill={handleDeleteBill}
                />
              )}

              {moreSubTab === 'CREDIT_BNPL' && (
                <CreditAndInstallments
                  creditCards={creditCards}
                  installments={installments}
                  isPrivacyMode={settings.isPrivacyMode}
                  onAddCreditCard={handleAddCreditCard}
                  onUpdateCreditCard={handleUpdateCreditCard}
                  onDeleteCreditCard={handleDeleteCreditCard}
                  onAddInstallment={handleAddInstallment}
                  onPayInstallmentTerm={handlePayInstallmentTerm}
                  onDeleteInstallment={handleDeleteInstallment}
                />
              )}

              {moreSubTab === 'FORECAST' && (
                <CashFlowForecast
                  wallets={wallets}
                  bills={bills}
                  installments={installments}
                  transactions={transactions}
                  salaryDay={settings.salaryDay || 10}
                  isPrivacyMode={settings.isPrivacyMode}
                  onUpdateSalaryDay={(day) => {
                    const updated = { ...settings, salaryDay: day };
                    setSettings(updated);
                    StorageService.saveSettings(updated);
                  }}
                />
              )}

              {moreSubTab === 'WISHLIST' && (
                <CoolingWishlist
                  wishlist={wishlist}
                  isPrivacyMode={settings.isPrivacyMode}
                  onAddWishlist={handleAddWishlist}
                  onAbandonItem={handleAbandonWishlist}
                  onConfirmBuy={handleConfirmBuyWishlist}
                  onDeleteWishlist={handleDeleteWishlist}
                />
              )}

              {moreSubTab === 'EVENTS' && (
                <VietnameseEventBook
                  events={giftEvents}
                  isPrivacyMode={settings.isPrivacyMode}
                  onAddEvent={handleAddGiftEvent}
                  onDeleteEvent={handleDeleteGiftEvent}
                />
              )}

              {moreSubTab === 'GOALS' && (
                <SavingsGoals
                  goals={goals}
                  isPrivacyMode={settings.isPrivacyMode}
                  onAddGoal={handleAddGoal}
                  onDeposit={handleDepositGoal}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {moreSubTab === 'DEBTS' && (
                <DebtTracker
                  debts={debts}
                  isPrivacyMode={settings.isPrivacyMode}
                  onAddDebt={handleAddDebt}
                  onToggleSettle={handleToggleSettleDebt}
                  onDeleteDebt={handleDeleteDebt}
                />
              )}

              {moreSubTab === 'TOOLS' && (
                <FinancialTools
                  settings={settings}
                  transactions={transactions}
                  budgets={budgets}
                  onUpdateSettings={handleUpdateSettings}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                  onResetData={handleResetData}
                />
              )}
            </div>
          )}
        </main>

        {/* Global Bottom Navigation */}
        <BottomNav
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenAddModal={() => openModalWithType('EXPENSE')}
        />

        {/* Speedy Keypad & Manual Input Modal */}
        <TransactionModal
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          wallets={wallets}
          categories={categories}
          hourlyWage={settings.hourlyWage}
          initialType={transactionTypePreset}
          onSave={handleSaveTransaction}
          onAddCategoryClick={() => setIsCategoryModalOpen(true)}
        />

        {/* Custom Category Creation Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onAddCategory={handleAddCategory}
        />

        {/* Trung tâm Thông báo nhắc nợ & Hạn thanh toán */}
        <NotificationModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          notifications={pendingNotifications}
          onMarkPaidBill={(billId) => {
            const bill = bills.find((b) => b.id === billId);
            if (bill) handlePayBill(bill);
          }}
          onRequestNativeNotification={handleRequestNativeNotification}
          nativeNotificationGranted={nativeNotificationGranted}
        />
      </div>
    </div>
  );
};

export default App;
