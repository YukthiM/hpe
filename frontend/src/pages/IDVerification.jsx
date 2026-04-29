import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI } from '../api';
import { Upload, Shield, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig = {
  not_submitted: { color: 'text-white/50', bg: 'bg-white/10', icon: <Shield size={40} className="opacity-30" />, label: 'Not Submitted' },
  pending: { color: 'text-yellow-400', bg: 'bg-yellow-500/15', icon: <Clock size={40} className="text-yellow-400" />, label: 'Under Review' },
  verified: { color: 'text-emerald-400', bg: 'bg-emerald-500/15', icon: <CheckCircle size={40} className="text-emerald-400" />, label: 'ID Verified!' },
  rejected: { color: 'text-danger', bg: 'bg-danger/15', icon: <AlertCircle size={40} className="text-danger" />, label: 'Rejected' },
};

export default function IDVerification() {
  const { user, refreshUser } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  const status = user?.idVerificationStatus || 'not_submitted';
  const config = statusConfig[status];

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async () => {
    if (!file) return toast.error('Please select an ID document');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      await portfolioAPI.submitID(formData);
      await refreshUser();
      toast.success('ID submitted! Verification in progress...');
      setFile(null);
      setPreview(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    await refreshUser();
    setChecking(false);
    toast.success('Status refreshed');
  };

  return (
    <div className="page-container animate-fade-in">
      <h1 className="font-display text-xl font-bold mb-2">ID Verification</h1>
      <p className="text-white/50 text-sm mb-6">Verify your government ID to get the verified badge and boost your reputation score by 10 points.</p>

      {/* Current status */}
      <div className={`card mb-5 flex items-center gap-4 ${config.bg} border-0`}>
        {config.icon}
        <div>
          <p className={`font-bold text-lg ${config.color}`}>{config.label}</p>
          {status === 'pending' && (
            <p className="text-white/50 text-sm">Typically takes 2-4 hours (simulated: ~3 seconds)</p>
          )}
          {status === 'verified' && (
            <p className="text-white/60 text-sm">Your ID has been successfully verified ✓</p>
          )}
          {status === 'not_submitted' && (
            <p className="text-white/50 text-sm">Upload an Aadhaar, PAN, or Driving License</p>
          )}
        </div>
        {status === 'pending' && (
          <button onClick={handleRefresh} disabled={checking} className="ml-auto p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      {/* What you get */}
      <div className="card mb-5">
        <h3 className="font-semibold text-sm mb-3">Benefits of ID Verification</h3>
        <div className="space-y-2">
          {[
            { emoji: '🏅', text: '+10 reputation score points' },
            { emoji: '✅', text: 'Verified badge on your profile' },
            { emoji: '🔍', text: 'Higher ranking in search results' },
            { emoji: '💼', text: 'More client trust & more jobs' },
          ].map((b, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="text-lg">{b.emoji}</span>
              <span className="text-white/70">{b.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload area (only if not verified) */}
      {status !== 'verified' && (
        <div>
          <h3 className="font-semibold text-sm text-white/70 mb-3">Upload Your ID Document</h3>

          <label className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            preview ? 'border-primary-500/50 bg-primary-500/5' : 'border-white/20 hover:border-primary-500/30 hover:bg-primary-500/5'
          }`}>
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-xl object-contain" />
            ) : (
              <>
                <Upload size={32} className="mx-auto mb-3 text-white/30" />
                <p className="text-white/60 text-sm font-medium">Tap to upload ID</p>
                <p className="text-white/30 text-xs mt-1">Aadhaar • PAN Card • Driving License</p>
                <p className="text-white/20 text-xs mt-0.5">JPG, PNG or PDF • Max 5MB</p>
              </>
            )}
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
          </label>

          {file && (
            <div className="mt-3 card flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <Shield size={16} className="text-primary-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{file.name}</p>
                <p className="text-white/40 text-xs">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
          )}

          <div className="glass p-3 mt-3 mb-5">
            <p className="text-white/40 text-xs">
              🔒 This is a simulation of DigiLocker / eKYC verification. In production, this would integrate with official government APIs. Your document is processed securely.
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Shield size={18} />}
            {loading ? 'Uploading...' : 'Submit for Verification'}
          </button>
        </div>
      )}
    </div>
  );
}
