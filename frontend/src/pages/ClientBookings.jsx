import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api';
import BookingStatusBadge from '../components/BookingStatusBadge';
import PaymentModal from '../components/PaymentModal';
import BookingReviewForm from '../components/BookingReviewForm';
import { ChevronLeft, MapPin, Phone, Calendar, RefreshCw, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { key: 'pending',          label: 'Request Sent' },
  { key: 'accepted',         label: 'Accepted' },
  { key: 'in_progress',      label: 'In Progress' },
  { key: 'awaiting_payment', label: 'Mark Complete' },
  { key: 'paid',             label: 'Payment Done' },
  { key: 'done',             label: 'Confirmed' },
];
const STEP_IDX = Object.fromEntries(STEPS.map((s, i) => [s.key, i]));

function StatusTimeline({ status }) {
  const currentIdx = STEP_IDX[status] ?? 0;
  return (
    <div className="flex items-center gap-0 mt-4 mb-2 overflow-x-auto pb-1 scrollbar-hide">
      {STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.key} className="flex items-center shrink-0">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                done ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-gray-300 dark:border-white/20'
              } ${active ? 'ring-2 ring-indigo-400/40 ring-offset-1' : ''}`}>
                {done ? <CheckCircle2 size={14} className="text-white" /> : <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-white/20" />}
              </div>
              <span className={`text-[9px] font-medium w-14 text-center leading-tight ${
                done ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-white/30'
              }`}>{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 mb-4 ${i < currentIdx ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-white/10'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function BookingCard({ booking, onUpdate }) {
  const [showPayment, setShowPayment] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [showReview, setShowReview] = useState(false);

  const worker = booking.workerId;
  const workerInitials = worker?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleMarkCompleted = async () => {
    setActionLoading('complete');
    try {
      const { data } = await bookingsAPI.markCompleted(booking._id);
      onUpdate(data.booking);
      toast.success('Job marked as completed!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="bg-white dark:bg-surface-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <div className="p-4 border-b border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          {worker?.avatar ? (
            <img src={worker.avatar} alt={worker.name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {workerInitials}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{worker?.name}</p>
            <p className="text-xs text-gray-500 dark:text-white/40">{worker?.skills?.slice(0, 2).join(', ')}</p>
          </div>
          <BookingStatusBadge status={booking.status} size="sm" />
        </div>

        {/* Rejected message */}
        {booking.status === 'rejected' && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">❌ Request Rejected by Worker</p>
            {booking.rejectionReason && (
              <p className="text-xs text-red-500/80 dark:text-red-400/70 mt-0.5">{booking.rejectionReason}</p>
            )}
          </div>
        )}

        {/* Timeline (only for active bookings) */}
        {!['rejected'].includes(booking.status) && (
          <StatusTimeline status={booking.status} />
        )}
      </div>

      {/* Details */}
      <div className="p-4 space-y-2 text-sm">
        <div className="flex items-start gap-2 text-gray-600 dark:text-white/60">
          <MapPin size={14} className="mt-0.5 shrink-0 text-indigo-500" />
          <span>{booking.clientAddress}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
          <Phone size={14} className="shrink-0 text-indigo-500" />
          <span>{booking.clientPhone}</span>
        </div>
        {booking.serviceDate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
            <Calendar size={14} className="shrink-0 text-indigo-500" />
            <span>{new Date(booking.serviceDate).toLocaleString('en-IN')}</span>
          </div>
        )}
        {booking.notes && (
          <p className="text-gray-500 dark:text-white/40 text-xs italic">"{booking.notes}"</p>
        )}
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/30">
          <Clock size={12} />
          <span className="text-xs">Booked {new Date(booking.createdAt).toLocaleDateString('en-IN')}</span>
        </div>

        {/* Payment info */}
        {booking.paymentMethod && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-medium">
              Paid via {booking.paymentMethod.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4">
        {booking.status === 'in_progress' && (
          <button
            onClick={handleMarkCompleted}
            disabled={actionLoading === 'complete'}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {actionLoading === 'complete' ? (
              <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" />Processing…</span>
            ) : '✅ Mark as Completed'}
          </button>
        )}

        {booking.status === 'awaiting_payment' && (
          <button
            onClick={() => setShowPayment(true)}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm active:scale-95 transition-all shadow-md"
          >
            💳 Pay Now
          </button>
        )}

        {booking.status === 'done' && !booking.reviewId && (
          <div className="mt-1">
            {showReview ? (
              <BookingReviewForm bookingId={booking._id} onSuccess={() => onUpdate({ ...booking, reviewId: 'submitted' })} />
            ) : (
              <button
                onClick={() => setShowReview(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold text-sm active:scale-95 transition-all"
              >
                ⭐ Leave a Review
              </button>
            )}
          </div>
        )}

        {booking.status === 'done' && booking.reviewId && (
          <div className="text-center py-2">
            <span className="text-xs text-gray-400 dark:text-white/40">✓ Review submitted — thank you!</span>
          </div>
        )}
      </div>

      {/* Payment modal */}
      {showPayment && (
        <PaymentModal
          bookingId={booking._id}
          onSuccess={(updated) => { setShowPayment(false); onUpdate(updated); }}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}

export default function ClientBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await bookingsAPI.getMyBookings();
      setBookings(data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-poll every 15s
  useEffect(() => {
    const interval = setInterval(() => load(), 15000);
    return () => clearInterval(interval);
  }, [load]);

  const handleUpdate = (updated) => {
    setBookings(prev => prev.map(b => b._id === updated._id ? { ...b, ...updated } : b));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3
        bg-white/90 dark:bg-surface/90 backdrop-blur-lg border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-display font-bold text-base text-gray-900 dark:text-white">My Bookings</h1>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-gray-400 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
        >
          <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="font-semibold text-gray-700 dark:text-white/70">No bookings yet</p>
            <p className="text-sm text-gray-400 dark:text-white/40 mt-1">Browse workers and book one to get started!</p>
            <button
              onClick={() => navigate('/discover')}
              className="mt-6 px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm active:scale-95 transition"
            >
              Browse Workers
            </button>
          </div>
        ) : (
          bookings.map(b => (
            <BookingCard key={b._id} booking={b} onUpdate={handleUpdate} />
          ))
        )}
      </div>
    </div>
  );
}
