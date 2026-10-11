import React from 'react';
import * as Icons from 'lucide-react';
import { Transaction, Budget } from '../types';

export const formatCurrency = (amount: number, currency: string = '₫', hideAmount: boolean = false): string => {
  if (hideAmount) return '••••••';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ' + currency;
};

export const formatCompactNumber = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000_000) {
    return (amount / 1_000_000_000).toFixed(1).replace('.0', '') + ' Tỷ';
  }
  if (Math.abs(amount) >= 1_000_000) {
    return (amount / 1_000_000).toFixed(1).replace('.0', '') + ' Tr';
  }
  if (Math.abs(amount) >= 1_000) {
    return (amount / 1_000).toFixed(0) + 'k';
  }
  return amount.toString();
};

export const formatDateDisplay = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const timeStr = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (isToday) return `Hôm nay, ${timeStr}`;
    if (isYesterday) return `Hôm qua, ${timeStr}`;

    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')} - ${timeStr}`;
  } catch {
    return isoDate;
  }
};

// Render Lucide Icon dynamically
export const renderCategoryIcon = (iconName: string, className: string = 'w-5 h-5') => {
  // @ts-expect-error dynamic lookup
  const IconComponent = Icons[iconName] || Icons.CircleDot;
  return React.createElement(IconComponent, { className });
};

// Calculate Financial Health Score (0 - 100) & Rank
export interface FinancialHealthResult {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  title: string;
  advice: string;
  savingsRate: number; // %
  budgetAdherence: number; // %
}

export const calculateFinancialHealth = (
  transactions: Transaction[],
  budgets: Budget[],
  streakCount: number
): FinancialHealthResult => {
  // Lấy dữ liệu 30 ngày gần nhất
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const recent = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
  const totalIncome = recent.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  const totalExpense = recent.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);

  // 1. Tỷ lệ tiết kiệm (Max 40 điểm)
  let savingsRate = 0;
  let savingsPoints = 15;
  if (totalIncome > 0) {
    savingsRate = Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)));
    if (savingsRate >= 40) savingsPoints = 40;
    else if (savingsRate >= 25) savingsPoints = 35;
    else if (savingsRate >= 15) savingsPoints = 25;
    else if (savingsRate >= 5) savingsPoints = 15;
    else savingsPoints = 5;
  }

  // 2. Tuân thủ ngân sách (Max 40 điểm)
  let budgetPoints = 30;
  let budgetAdherence = 100;
  const currentMonth = now.toISOString().slice(0, 7);
  const totalBudget = budgets.find(b => b.month === currentMonth && !b.categoryId);
  if (totalBudget && totalBudget.amountLimit > 0) {
    const monthlyExpense = transactions
      .filter(t => t.type === 'EXPENSE' && t.date.startsWith(currentMonth))
      .reduce((s, t) => s + t.amount, 0);
    const usagePercent = (monthlyExpense / totalBudget.amountLimit) * 100;
    budgetAdherence = Math.max(0, Math.round(100 - (usagePercent > 100 ? usagePercent - 100 : 0)));
    if (usagePercent <= 80) budgetPoints = 40;
    else if (usagePercent <= 100) budgetPoints = 32;
    else if (usagePercent <= 120) budgetPoints = 18;
    else budgetPoints = 5;
  }

  // 3. Chuỗi kỷ luật ghi chép (Max 20 điểm)
  const streakPoints = Math.min(20, (streakCount || 1) * 3);

  const totalScore = Math.min(100, Math.max(10, savingsPoints + budgetPoints + streakPoints));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'B';
  let title = 'Tài chính Ổn định';
  let advice = 'Bạn duy trì mức chi tiêu khá an toàn. Hãy tiếp tục tối ưu các khoản nhỏ để tăng tiền tiết kiệm.';

  if (totalScore >= 90) {
    grade = 'A+';
    title = 'Bậc thầy Quản lý Tài chính';
    advice = 'Xuất sắc! Bạn giữ kỷ luật chi tiêu tuyệt vời và tỷ lệ tiết kiệm rất cao. Nên cân nhắc mở rộng danh mục đầu tư.';
  } else if (totalScore >= 78) {
    grade = 'A';
    title = 'Sức khỏe Tài chính Tốt';
    advice = 'Bạn đang kiểm soát tốt dòng tiền của mình. Hãy duy trì thói quen ghi chép và đầu tư thêm vào các mục tiêu dài hạn.';
  } else if (totalScore >= 60) {
    grade = 'B';
    title = 'Tài chính Tạm ổn';
    advice = 'Bạn đang duy trì cân bằng thu chi, nhưng ngân sách dự phòng còn mỏng. Hãy cố gắng trích ít nhất 15% thu nhập tiết kiệm.';
  } else if (totalScore >= 45) {
    grade = 'C';
    title = 'Cần Thận Trọng Chi Tiêu';
    advice = 'Khoản chi tiêu đang tiệm cận tổng thu nhập. Cân nhắc cắt giảm các buổi cafe, ăn ngoài và mua sắm không thiết yếu.';
  } else {
    grade = 'D';
    title = 'Báo động Thâm Hụt';
    advice = 'Chi tiêu đang vượt quá khả năng tài chính! Hãy kích hoạt ngay chế độ tiết kiệm khẩn cấp để tránh rơi vào nợ nần.';
  }

  return {
    score: totalScore,
    grade,
    title,
    advice,
    savingsRate,
    budgetAdherence,
  };
};

