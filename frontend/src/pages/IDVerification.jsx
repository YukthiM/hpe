import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { portfolioAPI } from '../api';
import { Upload, Shield, CheckCircle, Clock, AlertCircle, RefreshCw, Link2, Smartphone, FileText, Lock } from 'lucide-react';
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

  const [method, setMethod] = useState('digilocker');

  // Mock DigiLocker state
  const [dlStep, setDlStep] = useState(0); // 0 connect, 1 otp, 2 select doc, 3 consent+submit
  const [dlPhone, setDlPhone] = useState(user?.phone || '');
  const [dlOtp, setDlOtp] = useState('');
  const [dlOtpCode, setDlOtpCode] = useState('');
  const [dlDocType, setDlDocType] = useState('aadhar');
  const [dlConsent, setDlConsent] = useState(false);
  const [dlBusy, setDlBusy] = useState(false);

  const status = user?.idVerificationStatus || 'not_submitted';
  const config = statusConfig[status];

  const canStartVerification = status === 'not_submitted' || status === 'rejected';

  const dlSteps = useMemo(() => (
    [
      { label: 'Connect' },
      { label: 'Verify OTP' },
      { label: 'Select Document' },
      { label: 'Consent & Submit' },
    ]
  ), []);

  const sanitizePhone = (v) => v.replace(/[^0-9+]/g, '').slice(0, 13);

  const createMockDocFile = async (docType) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 540;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // header bar
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, 86);
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 28px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('DigiLocker (Mock)', 36, 54);

    // doc body
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 36px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    const docLabel = docType === 'pan' ? 'PAN Card' : docType === 'dl' ? 'Driving License' : 'Aadhaar';
    ctx.fillText(docLabel, 36, 160);

    ctx.fillStyle = '#374151';
    ctx.font = '18px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('Issued via Mock DigiLocker flow (demo only)', 36, 210);
    ctx.fillText(`Linked phone: ${dlPhone || 'N/A'}`, 36, 246);
    ctx.fillText(`Generated at: ${new Date().toLocaleString('en-IN')}`, 36, 282);

    // footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText('This file is generated locally for hackathon demo purposes.', 36, 510);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Failed to generate document');
    const name = `digilocker-${docType}-${Date.now()}.png`;
    return new File([blob], name, { type: 'image/png' });
  };

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

  const handleDigiLockerSendOtp = async () => {
    if (!canStartVerification) return;
    const phone = dlPhone.trim();
    if (!phone || phone.replace(/[^0-9]/g, '').length < 10) {
      toast.error('Enter a valid phone number');
      return;
    }
    setDlBusy(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setDlOtpCode(code);
      setDlStep(1);
      toast.success('OTP sent (mock)');
    } finally {
      setDlBusy(false);
    }
  };

  const handleDigiLockerVerifyOtp = async () => {
    if (!canStartVerification) return;
    if (!dlOtpCode) return toast.error('Please send OTP first');
    if (dlOtp.trim() !== dlOtpCode) return toast.error('Invalid OTP');
    setDlStep(2);
    toast.success('OTP verified');
  };

  const handleDigiLockerSubmit = async () => {
    if (!canStartVerification) return;
    if (!dlConsent) return toast.error('Please give consent to fetch and submit the document');
    setDlBusy(true);
    try {
      const mockFile = await createMockDocFile(dlDocType);
      const formData = new FormData();
      formData.append('document', mockFile);
      await portfolioAPI.submitID(formData);
      await refreshUser();
      toast.success('DigiLocker document submitted! Verification in progress...');
      setDlStep(0);
      setDlOtp('');
      setDlOtpCode('');
      setDlConsent(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'DigiLocker submit failed');
    } finally {
      setDlBusy(false);
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

      {/* Choose method */}
      {status !== 'verified' && (
        <div className="card mb-5">
          <h3 className="font-semibold text-sm mb-3">Choose Verification Method</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMethod('digilocker')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                method === 'digilocker'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              <Link2 size={16} /> Mock DigiLocker
            </button>
            <button
              type="button"
              onClick={() => setMethod('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all ${
                method === 'upload'
                  ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                  : 'border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              <Upload size={16} /> Manual Upload
            </button>
          </div>

          {!canStartVerification && (
            <div className="mt-3 glass p-3">
              <p className="text-white/40 text-xs">
                <Lock size={12} className="inline mr-1" /> ID verification is already submitted. Please wait for review.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mock DigiLocker */}
      {status !== 'verified' && method === 'digilocker' && (
        <div className="card mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/15 flex items-center justify-center">
              <Link2 size={18} className="text-primary-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">Mock DigiLocker Connect</h3>
              <p className="text-white/50 text-xs mt-0.5">Simulates OTP login + document fetch and submits it for verification.</p>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-4 flex items-center gap-0 overflow-x-auto pb-1 scrollbar-hide">
            {dlSteps.map((s, i) => {
              const done = i < dlStep;
              const active = i === dlStep;
              return (
                <div key={s.label} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      done ? 'bg-primary-500 border-primary-500' : 'bg-transparent border-white/15'
                    } ${active ? 'ring-2 ring-primary-400/40 ring-offset-1' : ''}`}>
                      {done ? <CheckCircle size={14} className="text-white" /> : <span className="w-2 h-2 rounded-full bg-white/20" />}
                    </div>
                    <span className={`text-[9px] font-medium w-16 text-center leading-tight ${
                      done ? 'text-primary-300' : 'text-white/40'
                    }`}>{s.label}</span>
                  </div>
                  {i < dlSteps.length - 1 && (
                    <div className={`h-0.5 w-6 mb-4 ${i < dlStep ? 'bg-primary-500' : 'bg-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Step content */}
          <div className="mt-4 space-y-3">
            {dlStep === 0 && (
              <>
                <label className="text-white/70 text-sm font-medium block">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      value={dlPhone}
                      onChange={(e) => setDlPhone(sanitizePhone(e.target.value))}
                      placeholder="+91 98765 43210"
                      className="input-field pl-10"
                      disabled={!canStartVerification || dlBusy}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleDigiLockerSendOtp}
                    disabled={!canStartVerification || dlBusy}
                    className="btn-primary px-4"
                  >
                    {dlBusy ? '...' : 'Send OTP'}
                  </button>
                </div>
                <div className="glass p-3">
                  <p className="text-white/40 text-xs">🔐 Demo only — no real SMS is sent.</p>
                </div>
              </>
            )}

            {dlStep === 1 && (
              <>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white/70 text-sm font-medium">Enter OTP</p>
                    <p className="text-white/40 text-xs mt-0.5">Mock OTP is shown below for the demo.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setDlStep(0); setDlOtp(''); setDlOtpCode(''); }}
                    className="text-white/40 text-xs hover:text-white/70"
                    disabled={dlBusy}
                  >
                    Change phone
                  </button>
                </div>
                <input
                  value={dlOtp}
                  onChange={(e) => setDlOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="input-field"
                  disabled={!canStartVerification || dlBusy}
                />
                <div className="glass p-3">
                  <p className="text-white/40 text-xs">Mock OTP: <span className="text-white/70 font-semibold">{dlOtpCode || '—'}</span></p>
                </div>
                <button
                  type="button"
                  onClick={handleDigiLockerVerifyOtp}
                  disabled={!canStartVerification || dlBusy}
                  className="btn-primary w-full py-4"
                >
                  Verify OTP
                </button>
              </>
            )}

            {dlStep === 2 && (
              <>
                <p className="text-white/70 text-sm font-medium">Select document to fetch</p>
                <div className="grid grid-cols-3 gap-2">
                  {[{ k: 'aadhar', label: 'Aadhaar' }, { k: 'pan', label: 'PAN' }, { k: 'dl', label: 'DL' }].map((d) => (
                    <button
                      key={d.k}
                      type="button"
                      onClick={() => setDlDocType(d.k)}
                      className={`py-3 rounded-xl border-2 text-xs font-semibold transition-all ${
                        dlDocType === d.k ? 'border-primary-500 bg-primary-500/10 text-primary-300' : 'border-white/10 text-white/50 hover:border-white/20'
                      }`}
                      disabled={!canStartVerification || dlBusy}
                    >
                      <FileText size={14} className="inline mr-1" /> {d.label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setDlStep(3)}
                  disabled={!canStartVerification || dlBusy}
                  className="btn-primary w-full py-4"
                >
                  Continue
                </button>
              </>
            )}

            {dlStep === 3 && (
              <>
                <div className="glass p-3">
                  <p className="text-white/40 text-xs">
                    ✅ This will generate a mock document locally and submit it to the server for verification.
                  </p>
                </div>
                <label className="flex items-start gap-3 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={dlConsent}
                    onChange={(e) => setDlConsent(e.target.checked)}
                    className="mt-1"
                    disabled={!canStartVerification || dlBusy}
                  />
                  <span>
                    I consent to share my selected document from DigiLocker (mock) for verification.
                  </span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDlStep(2)}
                    className="flex-1 py-4 rounded-2xl border border-white/10 text-white/60 font-semibold"
                    disabled={dlBusy}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleDigiLockerSubmit}
                    className="flex-1 btn-primary py-4"
                    disabled={!canStartVerification || dlBusy}
                  >
                    {dlBusy ? 'Submitting...' : 'Fetch & Submit'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Upload area (only if not verified) */}
      {status !== 'verified' && method === 'upload' && (
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
