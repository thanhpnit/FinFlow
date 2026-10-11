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
} from '../types';

const STORAGE_KEYS = {
  WALLETS: 'finflow_v2_wallets',
  CATEGORIES: 'finflow_v2_categories',
  TRANSACTIONS: 'finflow_v2_transactions',
  BUDGETS: 'finflow_v2_budgets',
  GOALS: 'finflow_v2_goals',
  DEBTS: 'finflow_v2_debts',
  BILLS: 'finflow_v2_bills',
  CREDIT_CARDS: 'finflow_v2_credit_cards',
  INSTALLMENTS: 'finflow_v2_installments',
  WISHLIST: 'finflow_v2_wishlist',
  GIFT_EVENTS: 'finflow_v2_gift_events',
  SETTINGS: 'finflow_v2_settings',
};

// Sạch sẽ cho người dùng mới: Chỉ có 2 ví cơ bản với số dư 0đ
export const DEFAULT_WALLETS: Wallet[] = [
  { id: 'w-cash', name: 'Tiền mặt', type: 'CASH', balance: 0, icon: 'Banknote', color: '#10b981' },
  { id: 'w-bank', name: 'Tài khoản Ngân hàng', type: 'BANK', balance: 0, icon: 'Building2', color: '#3b82f6' },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // KHOẢN CHI (EXPENSES)
  { id: 'c-food', name: 'Ăn uống', type: 'EXPENSE', icon: 'Utensils', color: '#f97316' },
  { id: 'c-coffee', name: 'Cafe & Trà sữa', type: 'EXPENSE', icon: 'Coffee', color: '#b45309' },
  { id: 'c-groceries', name: 'Đi chợ & Siêu thị', type: 'EXPENSE', icon: 'ShoppingCart', color: '#10b981' },
  { id: 'c-transport', name: 'Xăng xe & Di chuyển', type: 'EXPENSE', icon: 'Car', color: '#06b6d4' },
  { id: 'c-bills', name: 'Điện, Nước, Net', type: 'EXPENSE', icon: 'Zap', color: '#eab308' },
  { id: 'c-shopping', name: 'Mua sắm & Quần áo', type: 'EXPENSE', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'c-entertainment', name: 'Xem phim & Vui chơi', type: 'EXPENSE', icon: 'Film', color: '#a855f7' },
  { id: 'c-health', name: 'Sức khỏe & Thuốc', type: 'EXPENSE', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'c-housing', name: 'Tiền thuê trọ/nhà', type: 'EXPENSE', icon: 'Home', color: '#6366f1' },
  { id: 'c-education', name: 'Học tập & Sách', type: 'EXPENSE', icon: 'GraduationCap', color: '#3b82f6' },
  { id: 'c-other-exp', name: 'Chi tiêu khác', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#64748b' },

  // KHOẢN THU (INCOMES)
  { id: 'c-salary', name: 'Tiền lương', type: 'INCOME', icon: 'Coins', color: '#10b981' },
  { id: 'c-freelance', name: 'Làm thêm / Thưởng', type: 'INCOME', icon: 'Laptop', color: '#0ea5e9' },
  { id: 'c-investment', name: 'Lãi đầu tư', type: 'INCOME', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'c-gift', name: 'Quà biếu / Lì xì', type: 'INCOME', icon: 'Gift', color: '#f43f5e' },
  { id: 'c-other-inc', name: 'Thu nhập khác', type: 'INCOME', icon: 'PlusCircle', color: '#64748b' },
];

export const DEFAULT_SETTINGS: UserSettings = {
  hourlyWage: 0,
  salaryDay: 10, // Mặc định ngày 10 hàng tháng nhận lương
  isPrivacyMode: false,
  currency: '₫',
  streakCount: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  soundEffects: true,
  notificationsEnabled: true,
};

// Dữ liệu trống hoàn toàn như vừa tải ứng dụng
export const DEFAULT_GOALS: SavingsGoal[] = [];
export const DEFAULT_DEBTS: DebtItem[] = [];
export const DEFAULT_BUDGETS: Budget[] = [];
export const DEFAULT_TRANSACTIONS: Transaction[] = [];
export const DEFAULT_BILLS: RecurringBill[] = [];
export const DEFAULT_CREDIT_CARDS: CreditCardItem[] = [];
export const DEFAULT_INSTALLMENTS: InstallmentItem[] = [];
export const DEFAULT_WISHLIST: WishlistItem[] = [];
export const DEFAULT_GIFT_EVENTS: GiftEventItem[] = [];

// Helper lưu trữ Offline-first LocalStorage
export const StorageService = {
  getWallets(): Wallet[] {
    const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return data ? JSON.parse(data) : DEFAULT_WALLETS;
  },
  saveWallets(wallets: Wallet[]): void {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  },

  getCategories(): Category[] {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
  },
  saveCategories(categories: Category[]): void {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : DEFAULT_TRANSACTIONS;
  },
  saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getBudgets(): Budget[] {
    const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    return data ? JSON.parse(data) : DEFAULT_BUDGETS;
  },
  saveBudgets(budgets: Budget[]): void {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getGoals(): SavingsGoal[] {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : DEFAULT_GOALS;
  },
  saveGoals(goals: SavingsGoal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  getDebts(): DebtItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.DEBTS);
    return data ? JSON.parse(data) : DEFAULT_DEBTS;
  },
  saveDebts(debts: DebtItem[]): void {
    localStorage.setItem(STORAGE_KEYS.DEBTS, JSON.stringify(debts));
  },

  // Bills
  getBills(): RecurringBill[] {
    const data = localStorage.getItem(STORAGE_KEYS.BILLS);
    return data ? JSON.parse(data) : DEFAULT_BILLS;
  },
  saveBills(bills: RecurringBill[]): void {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  },

  // Credit Cards
  getCreditCards(): CreditCardItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.CREDIT_CARDS);
    return data ? JSON.parse(data) : DEFAULT_CREDIT_CARDS;
  },
  saveCreditCards(cards: CreditCardItem[]): void {
    localStorage.setItem(STORAGE_KEYS.CREDIT_CARDS, JSON.stringify(cards));
  },

  // Installments
  getInstallments(): InstallmentItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.INSTALLMENTS);
    return data ? JSON.parse(data) : DEFAULT_INSTALLMENTS;
  },
  saveInstallments(installments: InstallmentItem[]): void {
    localStorage.setItem(STORAGE_KEYS.INSTALLMENTS, JSON.stringify(installments));
  },

  // Wishlist
  getWishlist(): WishlistItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.WISHLIST);
    return data ? JSON.parse(data) : DEFAULT_WISHLIST;
  },
  saveWishlist(list: WishlistItem[]): void {
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(list));
  },

  // Gift Events
  getGiftEvents(): GiftEventItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.GIFT_EVENTS);
    return data ? JSON.parse(data) : DEFAULT_GIFT_EVENTS;
  },
  saveGiftEvents(events: GiftEventItem[]): void {
    localStorage.setItem(STORAGE_KEYS.GIFT_EVENTS, JSON.stringify(events));
  },

  getSettings(): UserSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const settings: UserSettings = data ? JSON.parse(data) : DEFAULT_SETTINGS;
    
    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    if (settings.lastActiveDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (settings.lastActiveDate === yesterday) {
        settings.streakCount = (settings.streakCount || 0) + 1;
      } else {
        settings.streakCount = 1;
      }
      settings.lastActiveDate = today;
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }
    return settings;
  },
  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Export full backup data as JSON
  exportData(): string {
    const backup = {
      wallets: this.getWallets(),
      categories: this.getCategories(),
      transactions: this.getTransactions(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
      debts: this.getDebts(),
      bills: this.getBills(),
      creditCards: this.getCreditCards(),
      installments: this.getInstallments(),
      wishlist: this.getWishlist(),
      giftEvents: this.getGiftEvents(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
      version: '3.0',
    };
    return JSON.stringify(backup, null, 2);
  },

  // Import full backup
  importData(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.wallets) this.saveWallets(parsed.wallets);
      if (parsed.categories) this.saveCategories(parsed.categories);
      if (parsed.transactions) this.saveTransactions(parsed.transactions);
      if (parsed.budgets) this.saveBudgets(parsed.budgets);
      if (parsed.goals) this.saveGoals(parsed.goals);
      if (parsed.debts) this.saveDebts(parsed.debts);
      if (parsed.bills) this.saveBills(parsed.bills);
      if (parsed.creditCards) this.saveCreditCards(parsed.creditCards);
      if (parsed.installments) this.saveInstallments(parsed.installments);
      if (parsed.wishlist) this.saveWishlist(parsed.wishlist);
      if (parsed.giftEvents) this.saveGiftEvents(parsed.giftEvents);
      if (parsed.settings) this.saveSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  // Xóa toàn bộ dữ liệu trở về trắng tinh như mới tải app
  resetToCleanInstall(): void {
    this.saveWallets(DEFAULT_WALLETS);
    this.saveCategories(DEFAULT_CATEGORIES);
    this.saveTransactions([]);
    this.saveBudgets([]);
    this.saveGoals([]);
    this.saveDebts([]);
    this.saveBills([]);
    this.saveCreditCards([]);
    this.saveInstallments([]);
    this.saveWishlist([]);
    this.saveGiftEvents([]);
    this.saveSettings(DEFAULT_SETTINGS);
  },
  resetToDefault(): void {
    this.resetToCleanInstall();
  }
};
