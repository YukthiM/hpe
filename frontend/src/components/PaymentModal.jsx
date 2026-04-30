import { useState } from 'react';
import { bookingsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { X, CreditCard, Wallet, Smartphone, CheckCircle } from 'lucide-react';

const methods = [
  { id: 'upi',    label: 'UPI',    icon: <Smartphone size={22} />,  color: 'text-emerald-400', desc: 'Pay via UPI ID or QR Code' },
  { id: 'card',   label: 'Card',   icon: <CreditCard size={22} />,  color: 'text-blue-400',    desc: 'Credit / Debit Card' },
  { id: 'wallet', label: 'Wallet', icon: <Wallet size={22} />,      color: 'text-purple-400',  desc: 'Paytm, PhonePe, GPay' },
];

export default function PaymentModal({ bookingId, onSuccess, onClose }) {
  const { user } = useAuth();
  const [selected, setSelected] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    if (user?.role !== 'client') {
      toast.error('Only clients can make payment');
      return;
    }
    setLoading(true);
    try {
      const { data } = await bookingsAPI.pay(bookingId, { paymentMethod: selected });
      setDone(true);
      setTimeout(() => {
        onSuccess(data.booking);
      }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-surface-2 rounded-3xl shadow-2xl border border-white/10 dark:border-white/10 border-gray-200 overflow-hidden animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 dark:border-white/5 border-gray-100">
          <div>
            <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">Complete Payment</h2>
            <p className="text-sm text-gray-500 dark:text-white/50 mt-0.5">Choose your payment method</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/20 transition">
            <X size={16} className="text-gray-600 dark:text-white" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <p className="font-bold text-xl text-gray-900 dark:text-white">Payment Successful!</p>
            <p className="text-gray-500 dark:text-white/50 text-sm mt-2">Waiting for worker confirmation…</p>
          </div>
        ) : (
          <>
            {/* Payment methods */}
            <div className="px-6 py-5 space-y-3">
              {methods.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selected === m.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-surface-3 hover:border-indigo-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    selected === m.id ? 'bg-indigo-500/20' : 'bg-gray-100 dark:bg-white/5'
                  } ${m.color}`}>
                    {m.icon}
                  </div>
                  <div className="text-left">
                    <p className={`font-semibold ${selected === m.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-800 dark:text-white'}`}>{m.label}</p>
                    <p className="text-xs text-gray-500 dark:text-white/40">{m.desc}</p>
                  </div>
                  {selected === m.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* UPI note */}
            {selected === 'upi' && (
              <div className="mx-6 mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  💡 This is a demo payment. No real money will be deducted.
                </p>
              </div>
            )}

            {/* Pay button */}
            <div className="px-6 pb-6">
              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base shadow-lg hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  `Pay with ${methods.find(m => m.id === selected)?.label}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
