import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../api';
import BookingStatusBadge from '../components/BookingStatusBadge';
import { ChevronLeft, Phone, MapPin, Calendar, RefreshCw, Loader2, CheckCircle2, XCircle, Play, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'pending',   label: 'Pending',   emoji: '⏳' },
  { key: 'active',    label: 'Active',    emoji: '🔧' },
  { key: 'history',   label: 'History',   emoji: '📋' },
];

function WorkerBookingCard({ booking, onUpdate }) {
  const [actionLoading, setActionLoading] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  const client = booking.clientId;
  const clientInitials = client?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const act = async (fn, label, successMsg) => {
    setActionLoading(label);
    try {
      const { data } = await fn();
      onUpdate(data.booking);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error');
    } finally {
      setActionLoading('');
      setShowRejectInput(false);
    }
  };

  const handleAccept = () => act(
    () => bookingsAPI.respond(booking._id, 'accept'),
    'accept', '✅ Booking accepted!'
  );

  const handleReject = () => act(
    () => bookingsAPI.respond(booking._id, 'reject', rejectReason),
    'reject', '❌ Booking rejected.'
  );

  const handleStart = () => act(
    () => bookingsAPI.startJob(booking._id),
    'start', '🔧 Job started!'
  );

  const handleConfirm = () => act(
    () => bookingsAPI.confirmPayment(booking._id),
    'confirm', '🎉 Payment confirmed! Job done!'
  );

  const isAccepted = ['accepted', 'in_progress', 'awaiting_payment', 'paid'].includes(booking.status);

  return (
    <div className="bg-white dark:bg-surface-2 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden mb-4 animate-fade-in">
      {/* Card header */}
      <div className="p-4 border-b border-gray-50 dark:border-white/5">
        <div className="flex items-center gap-3">
          {client?.avatar ? (
            <img src={client.avatar} alt={client.name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
              {clientInitials}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">{client?.name}</p>
            <p className="text-xs text-gray-500 dark:text-white/40">{client?.email}</p>
          </div>
          <BookingStatusBadge status={booking.status} size="sm" />
        </div>
      </div>

      {/* Contact details — revealed only after accept */}
      <div className="p-4 space-y-2 text-sm">
        {isAccepted ? (
          <>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">
                🔓 Client Contact Details
              </p>
              <div className="flex items-start gap-2 text-gray-700 dark:text-white/80">
                <MapPin size={14} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{booking.clientAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-white/80">
                <Phone size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                <a href={`tel:${booking.clientPhone}`} className="underline">{booking.clientPhone}</a>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 dark:text-white/30 text-xs">
            <span className="bg-gray-100 dark:bg-white/5 px-3 py-2 rounded-lg w-full text-center">
              🔒 Accept to reveal client address & phone
            </span>
          </div>
        )}

        {booking.serviceDate && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-white/60">
            <Calendar size={13} className="text-indigo-500" />
            <span>{new Date(booking.serviceDate).toLocaleString('en-IN')}</span>
          </div>
        )}

        {booking.notes && (
          <p className="text-gray-500 dark:text-white/40 text-xs italic border-l-2 border-indigo-300 dark:border-indigo-500/40 pl-3">
            "{booking.notes}"
          </p>
        )}

        <div className="flex items-center gap-2 text-gray-400 dark:text-white/30">
          <Clock size={12} />
          <span className="text-xs">{new Date(booking.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
        </div>

        {/* Payment confirmation badge */}
        {booking.status === 'paid' && (
          <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-center">
            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
              💰 Client paid via {booking.paymentMethod?.toUpperCase()}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 space-y-2">
        {/* Pending: Accept / Reject */}
        {booking.status === 'pending' && (
          <>
            {showRejectInput ? (
              <div className="space-y-2">
                <input
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (optional)…"
                  className="w-full text-sm rounded-xl border border-red-200 dark:border-red-500/30 bg-white dark:bg-surface-3 text-gray-800 dark:text-white px-3 py-2 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading === 'reject'}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {actionLoading === 'reject' ? '…' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl border-2 border-red-500/40 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                >
                  <XCircle size={16} /> Reject
                </button>
                <button
                  onClick={handleAccept}
                  disabled={actionLoading === 'accept'}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm shadow active:scale-95 transition-all disabled:opacity-60"
                >
                  {actionLoading === 'accept' ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  Accept
                </button>
              </div>
            )}
          </>
        )}

        {/* Accepted: Start Job */}
        {booking.status === 'accepted' && (
          <button
            onClick={handleStart}
            disabled={actionLoading === 'start'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm shadow active:scale-95 transition-all disabled:opacity-60"
          >
            {actionLoading === 'start' ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} fill="currentColor" />}
            Start Job
          </button>
        )}

        {/* Paid: Confirm payment */}
        {booking.status === 'paid' && (
          <button
            onClick={handleConfirm}
            disabled={actionLoading === 'confirm'}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-sm shadow active:scale-95 transition-all disabled:opacity-60"
          >
            {actionLoading === 'confirm' ? <Loader2 size={15} className="animate-spin" /> : '✅'}
            Confirm Payment Received
          </button>
        )}

        {/* Done */}
        {booking.status === 'done' && (
          <div className="text-center py-2">
            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold">🎉 Job successfully completed!</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkerBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('pending');

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const { data } = await bookingsAPI.getWorkerBookings();
      setBookings(data.bookings || []);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-poll every 10s
  useEffect(() => {
    const interval = setInterval(() => load(), 10000);
    return () => clearInterval(interval);
  }, [load]);

  const handleUpdate = (updated) => {
    setBookings(prev => prev.map(b => b._id === updated._id ? { ...b, ...updated } : b));
  };

  const filtered = bookings.filter(b => {
    if (tab === 'pending') return b.status === 'pending';
    if (tab === 'active')  return ['accepted', 'in_progress', 'awaiting_payment', 'paid'].includes(b.status);
    return ['rejected', 'done'].includes(b.status);
  });

  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3
        bg-white/90 dark:bg-surface/90 backdrop-blur-lg border-b border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">
            <ChevronLeft size={22} />
          </button>
          <h1 className="font-display font-bold text-base text-gray-900 dark:text-white">Booking Requests</h1>
          {pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="text-gray-400 dark:text-white/40 hover:text-indigo-500 dark:hover:text-indigo-400 transition"
        >
          <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-white/5 bg-white dark:bg-surface px-4">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70'
            }`}
          >
            <span>{t.emoji}</span> {t.label}
            {t.key === 'pending' && pendingCount > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="max-w-lg mx-auto px-4 py-5">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="animate-spin text-indigo-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">
              {tab === 'pending' ? '📬' : tab === 'active' ? '🔧' : '📋'}
            </p>
            <p className="font-semibold text-gray-700 dark:text-white/70">
              {tab === 'pending' ? 'No pending requests' : tab === 'active' ? 'No active jobs' : 'No completed jobs'}
            </p>
            <p className="text-sm text-gray-400 dark:text-white/40 mt-1">
              {tab === 'pending' ? 'New booking requests will appear here.' : 'Jobs will appear here when active.'}
            </p>
          </div>
        ) : (
          filtered.map(b => (
            <WorkerBookingCard key={b._id} booking={b} onUpdate={handleUpdate} />
          ))
        )}
      </div>
    </div>
  );
}
