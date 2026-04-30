import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI, workersAPI } from '../api';
import { useEffect } from 'react';
import { MapPin, Phone, Calendar, FileText, ChevronLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BookingPage() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [worker, setWorker] = useState(null);
  const [loadingWorker, setLoadingWorker] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    clientAddress: '',
    clientPhone: user?.phone || '',
    serviceDate: '',
    notes: '',
  });

  useEffect(() => {
    workersAPI.getById(workerId)
      .then(({ data }) => setWorker(data.worker))
      .catch(() => { toast.error('Worker not found'); navigate(-1); })
      .finally(() => setLoadingWorker(false));
  }, [workerId]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientAddress.trim()) return toast.error('Please enter your address.');
    if (!form.clientPhone.trim()) return toast.error('Please enter your phone number.');

    setSubmitting(true);
    try {
      await bookingsAPI.create({ workerId, ...form });
      toast.success('Booking request sent! Worker will respond shortly.');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send booking.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingWorker) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-surface">
      <Loader2 size={32} className="animate-spin text-indigo-500" />
    </div>
  );

  const initials = worker?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-surface">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3
        bg-white/80 dark:bg-surface/80 backdrop-blur-lg
        border-b border-gray-100 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white transition">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-display font-bold text-base text-gray-900 dark:text-white">Book Worker</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Worker info card */}
        {worker && (
          <div className="flex items-center gap-4 p-4 mb-6 rounded-2xl
            bg-white dark:bg-surface-2
            border border-gray-100 dark:border-white/5 shadow-sm">
            {worker.avatar ? (
              <img src={worker.avatar} alt={worker.name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {initials}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{worker.name}</p>
              <p className="text-sm text-gray-500 dark:text-white/50">{worker.skills?.slice(0, 2).join(', ')}</p>
              {worker.location && (
                <p className="text-xs text-gray-400 dark:text-white/30 flex items-center gap-1 mt-0.5">
                  <MapPin size={11} />{worker.location}
                </p>
              )}
            </div>
            <div className="ml-auto text-right">
              <div className="text-yellow-500 text-sm font-semibold">★ {(worker.averageRating || 0).toFixed(1)}</div>
              <div className="text-xs text-gray-400 dark:text-white/30">{worker.totalRatings || 0} reviews</div>
            </div>
          </div>
        )}

        {/* Booking form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wide mb-2">Your Details</h2>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
              <MapPin size={13} className="inline mr-1" />Service Address *
            </label>
            <textarea
              name="clientAddress"
              value={form.clientAddress}
              onChange={handleChange}
              placeholder="Full address where the service is needed…"
              rows={3}
              required
              className="w-full rounded-xl border border-gray-200 dark:border-white/10
                bg-white dark:bg-surface-3
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-white/30
                px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                dark:focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
              <Phone size={13} className="inline mr-1" />Phone Number *
            </label>
            <input
              type="tel"
              name="clientPhone"
              value={form.clientPhone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              required
              className="w-full rounded-xl border border-gray-200 dark:border-white/10
                bg-white dark:bg-surface-3
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-white/30
                px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                dark:focus:border-indigo-500 transition"
            />
          </div>

          {/* Service date (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
              <Calendar size={13} className="inline mr-1" />Preferred Date (optional)
            </label>
            <input
              type="datetime-local"
              name="serviceDate"
              value={form.serviceDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10
                bg-white dark:bg-surface-3
                text-gray-900 dark:text-white
                px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                dark:focus:border-indigo-500 transition"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
              <FileText size={13} className="inline mr-1" />Additional Notes (optional)
            </label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Describe what you need…"
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10
                bg-white dark:bg-surface-3
                text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-white/30
                px-4 py-3 text-sm focus:outline-none focus:border-indigo-500
                dark:focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Info notice */}
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
              🔒 Your address and phone number will only be revealed to the worker <strong>after they accept</strong> your request.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600
              text-white font-bold text-base shadow-lg hover:from-indigo-500 hover:to-purple-500
              active:scale-95 transition-all disabled:opacity-60 mt-2"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />Sending Request…
              </span>
            ) : (
              'Send Booking Request 🚀'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
