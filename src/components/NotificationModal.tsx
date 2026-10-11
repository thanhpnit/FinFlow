import React from 'react';
import { Bell, X, Check, AlertCircle, Calendar, CreditCard, ShoppingBag, ShieldAlert } from 'lucide-react';
import { RecurringBill, CreditCardItem, InstallmentItem, DebtItem, WishlistItem } from '../types';
import { formatCurrency } from '../utils/formatters';

export interface PendingNotificationItem {
  id: string;
  type: 'BILL' | 'CREDIT_CARD' | 'INSTALLMENT' | 'DEBT' | 'WISHLIST';
  title: string;
  amount?: number;
  subtitle: string;
  daysRemaining: number; // 0: Hôm nay, < 0: Quá hạn, > 0: Còn n ngày
  rawItem: RecurringBill | CreditCardItem | InstallmentItem | DebtItem | WishlistItem;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PendingNotificationItem[];
  onMarkPaidBill: (billId: string) => void;
  onRequestNativeNotification: () => void;
  nativeNotificationGranted: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkPaidBill,
  onRequestNativeNotification,
  nativeNotificationGranted,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 ring-2 ring-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Nhắc nhở & Hạn thanh toán</h3>
              <p className="text-[11px] text-slate-400">
                {notifications.length === 0
                  ? 'Tuyệt vời! Không có khoản nợ/phí nào cần đóng.'
                  : `Có ${notifications.length} khoản cần bạn lưu ý.`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Native Notification Permission Banner */}
        {!nativeNotificationGranted && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 flex items-center justify-between text-xs text-indigo-900 shrink-0">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Bật thông báo đẩy để không lỡ hạn thanh toán</span>
            </div>
            <button
              onClick={onRequestNativeNotification}
              className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-bold text-[11px] hover:bg-indigo-700 transition-all shrink-0 ml-2"
            >
              Bật ngay
            </button>
          </div>
        )}

        {/* List of Notification Items */}
        <div className="overflow-y-auto space-y-2.5 flex-1 pr-1">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-2">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="font-medium text-slate-600">Bạn đã thanh toán đầy đủ các khoản!</p>
              <p className="text-[11px]">Hóa đơn, sao kê thẻ tín dụng và tiền nhà đều đang đúng tiến độ.</p>
            </div>
          ) : (
            notifications.map((item) => {
              const isOverdue = item.daysRemaining < 0;
              const isToday = item.daysRemaining === 0;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isOverdue
                      ? 'bg-rose-50/60 border-rose-200'
                      : isToday
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        item.type === 'BILL'
                          ? 'bg-blue-100 text-blue-700'
                          : item.type === 'CREDIT_CARD'
                          ? 'bg-purple-100 text-purple-700'
                          : item.type === 'INSTALLMENT'
                          ? 'bg-rose-100 text-rose-700'
                          : item.type === 'WISHLIST'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.type === 'BILL' && <Calendar className="w-4 h-4" />}
                      {item.type === 'CREDIT_CARD' && <CreditCard className="w-4 h-4" />}
                      {item.type === 'INSTALLMENT' && <ShieldAlert className="w-4 h-4" />}
                      {item.type === 'WISHLIST' && <ShoppingBag className="w-4 h-4" />}
                      {item.type === 'DEBT' && <AlertCircle className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-slate-800 text-xs">{item.title}</h4>
                        <span
                          className={`text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                            isOverdue
                              ? 'bg-rose-200 text-rose-800'
                              : isToday
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isOverdue
                            ? `Quá hạn ${Math.abs(item.daysRemaining)} ngày`
                            : isToday
                            ? 'Hạn chót Hôm nay!'
                            : `Còn ${item.daysRemaining} ngày`}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-0.5">{item.subtitle}</p>

                      {item.amount !== undefined && (
                        <div className="font-mono font-bold text-xs text-slate-900 mt-1">
                          {formatCurrency(item.amount)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {item.type === 'BILL' && (
                    <button
                      onClick={() => onMarkPaidBill(item.rawItem.id)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold shrink-0 shadow-xs flex items-center gap-1 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Đã đóng
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

