export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface Wallet {
  id: string;
  name: string;
  type: 'CASH' | 'BANK' | 'E_WALLET' | 'SAVINGS' | 'CREDIT';
  balance: number;
  icon: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  toWalletId?: string; // used when type === 'TRANSFER'
  categoryId: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string YYYY-MM-DDTHH:mm:ss
  note: string;
  workHoursEquivalent?: number;
}

export interface Budget {
  id: string;
  categoryId?: string; // undefined or empty means total monthly budget
  amountLimit: number;
  month: string; // YYYY-MM
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface DebtItem {
  id: string;
  personName: string;
  amount: number;
  type: 'LENT' | 'BORROWED'; // LENT: Tôi cho vay, BORROWED: Tôi đi vay
  dueDate?: string;
  note: string;
  isSettled: boolean;
  createdAt: string;
}

// 1. Hóa đơn định kỳ & Nhắc hẹn thanh toán
export interface RecurringBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // Ngày trong tháng (1 - 31)
  category: string;
  walletId: string;
  lastPaidMonth?: string; // YYYY-MM
  note?: string;
}

// 2. Thẻ tín dụng & Quản lý sao kê
export interface CreditCardItem {
  id: string;
  cardName: string;
  bankName: string;
  limitAmount: number; // Hạn mức
  currentSpent: number; // Đã tiêu
  statementDay: number; // Ngày chốt sao kê (1 - 31)
  paymentDueDay: number; // Ngày đến hạn trả tiền (1 - 31)
  cardColor: string;
}

// 3. Gói trả góp (Shopee SPayLater, HomeCredit, Thẻ tín dụng)
export interface InstallmentItem {
  id: string;
  productName: string;
  platform: 'CREDIT_CARD' | 'SPAYLATER' | 'HOME_CREDIT' | 'OTHER';
  totalAmount: number;
  monthlyAmount: number;
  totalTerms: number; // Tổng số tháng (vd: 6)
  paidTerms: number; // Đã trả (vd: 2)
  dueDay: number; // Ngày đóng tiền mỗi tháng (1 - 31)
  startDate: string; // YYYY-MM
  note?: string;
}

// 4. Danh sách muốn mua & Trì hoãn 72h chống mua sắm bốc đồng
export interface WishlistItem {
  id: string;
  name: string;
  estimatedPrice: number;
  createdAt: string; // ISO string
  delayHours: number; // 72h, 48h, hoặc 168h (1 tuần)
  category: string;
  status: 'WAITING' | 'SAVED' | 'BOUGHT'; // SAVED: Đã từ bỏ thành công (tiết kiệm được tiền!), BOUGHT: Vẫn quyết định mua
  reason?: string;
}

// 5. Sổ mừng Cưới hỏi / Thôi nôi / Lễ Tết
export interface GiftEventItem {
  id: string;
  personName: string;
  eventName: string; // 'Đám cưới', 'Thôi nôi', 'Tân gia', 'Mừng Tết'
  amount: number;
  type: 'GIVEN' | 'RECEIVED'; // GIVEN: Mình đi mừng, RECEIVED: Người khác mừng mình
  date: string;
  note?: string;
}

export interface UserSettings {
  hourlyWage: number; // Tiền lương mỗi giờ (VND) để tính Time-Value Calculator
  salaryDay: number; // Ngày nhận lương hàng tháng (1 - 31) để dự báo dòng tiền
  isPrivacyMode: boolean; // Ẩn số dư
  currency: string;
  streakCount: number;
  lastActiveDate: string;
  soundEffects: boolean;
  notificationsEnabled: boolean;
}
