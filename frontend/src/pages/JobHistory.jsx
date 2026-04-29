import { useState, useEffect } from 'react';
import { jobsAPI } from '../api';
import QRModal from '../components/QRModal';
import { Plus, Briefcase, QrCode, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const SKILLS = ['Electrician', 'Plumber', 'Carpenter', 'Painter', 'Tutor', 'Cleaner', 'Mechanic', 'Mason', 'AC Repair', 'Other'];

export default function JobHistory() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddJob, setShowAddJob] = useState(false);
  const [qrJob, setQrJob] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: '', skill: '', location: '', amount: '', clientName: '', clientEmail: '', description: '',
  });

  const loadJobs = async () => {
    try {
      const { data } = await jobsAPI.getMyJobs();
      setJobs(data.jobs || []);
    } catch (err) {
      toast.error('Could not load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddJob = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await jobsAPI.createJob(form);
      setJobs([data.job, ...jobs]);
      setQrJob({ ...data.job, reviewUrl: data.reviewUrl });
      setShowAddJob(false);
      setForm({ title: '', skill: '', location: '', amount: '', clientName: '', clientEmail: '', description: '' });
      toast.success('Job added! Share QR with your client.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add job');
    } finally {
      setSubmitting(false);
    }
  };

  const reviewUrl = qrJob
    ? `${window.location.origin}/review/${qrJob.qrToken}`
    : '';

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl font-bold">Job History</h1>
        <button
          onClick={() => setShowAddJob(true)}
          className="flex items-center gap-2 btn-primary py-2.5 px-4 text-sm"
        >
          <Plus size={16} /> Add Job
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex gap-3 mb-5">
        <div className="card flex-1 text-center py-3">
          <p className="font-bold text-xl text-primary-400">{jobs.length}</p>
          <p className="text-white/50 text-xs">Total Jobs</p>
        </div>
        <div className="card flex-1 text-center py-3">
          <p className="font-bold text-xl text-emerald-400">{jobs.filter(j => j.status === 'reviewed').length}</p>
          <p className="text-white/50 text-xs">Reviewed</p>
        </div>
        <div className="card flex-1 text-center py-3">
          <p className="font-bold text-xl text-yellow-400">{jobs.filter(j => j.status !== 'reviewed').length}</p>
          <p className="text-white/50 text-xs">Pending</p>
        </div>
      </div>

      {/* Jobs list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-pulse bg-surface-3" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 text-white/30">
          <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No jobs yet</p>
          <p className="text-sm mt-1">Add your completed jobs to collect verified reviews</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="card">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  job.status === 'reviewed' ? 'bg-emerald-500/15' : 'bg-yellow-500/15'
                }`}>
                  {job.status === 'reviewed'
                    ? <CheckCircle size={18} className="text-emerald-400" />
                    : <Clock size={18} className="text-yellow-400" />
                  }
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{job.title}</p>
                  <div className="flex items-center gap-2 text-xs text-white/40 mt-0.5">
                    <span>{job.skill}</span>
                    {job.location && <span>• {job.location}</span>}
                    {job.amount && <span>• ₹{job.amount}</span>}
                  </div>
                  <p className="text-white/30 text-xs mt-0.5">{new Date(job.completedAt).toLocaleDateString('en-IN')}</p>
                </div>

                {/* QR button - show for unreviewed jobs */}
                {job.status !== 'reviewed' && (
                  <button
                    onClick={() => setQrJob({ ...job, reviewUrl: `${window.location.origin}/review/${job.qrToken}` })}
                    className="shrink-0 flex flex-col items-center gap-0.5 text-primary-400 hover:text-primary-300 transition"
                  >
                    <QrCode size={22} />
                    <span className="text-[10px]">QR</span>
                  </button>
                )}

                {job.status === 'reviewed' && job.reviewId && (
                  <span className="badge bg-emerald-500/15 text-emerald-400 text-xs shrink-0">✓ Done</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Job Modal */}
      {showAddJob && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-surface-2 rounded-3xl border border-white/10 p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">Add Completed Job</h3>
              <button onClick={() => setShowAddJob(false)} className="p-2 rounded-xl bg-white/10">
                <Plus size={18} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleAddJob} className="space-y-4">
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Job Title *</label>
                <input name="title" value={form.title} onChange={handleChange} required
                  placeholder="Fixed electrical wiring at shop" className="input-field" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Skill / Category *</label>
                <select name="skill" value={form.skill} onChange={handleChange} required className="input-field">
                  <option value="">Select skill</option>
                  {SKILLS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Location</label>
                  <input name="location" value={form.location} onChange={handleChange}
                    placeholder="Mumbai" className="input-field" />
                </div>
                <div>
                  <label className="text-white/70 text-sm font-medium block mb-1.5">Amount (₹)</label>
                  <input name="amount" type="number" value={form.amount} onChange={handleChange}
                    placeholder="2000" className="input-field" />
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Client Name</label>
                <input name="clientName" value={form.clientName} onChange={handleChange}
                  placeholder="Rajesh Kumar" className="input-field" />
              </div>
              <div>
                <label className="text-white/70 text-sm font-medium block mb-1.5">Client Email (optional)</label>
                <input name="clientEmail" type="email" value={form.clientEmail} onChange={handleChange}
                  placeholder="client@example.com" className="input-field" />
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <QrCode size={18} />}
                {submitting ? 'Generating QR...' : 'Create Job & Get QR'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrJob && (
        <QRModal
          isOpen={!!qrJob}
          onClose={() => setQrJob(null)}
          qrToken={qrJob.qrToken}
          reviewUrl={qrJob.reviewUrl || reviewUrl}
          jobTitle={qrJob.title}
        />
      )}
    </div>
  );
}
