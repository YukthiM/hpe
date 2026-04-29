import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Share2, Copy } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function QRModal({ isOpen, onClose, qrToken, reviewUrl, jobTitle }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(reviewUrl);
    setCopied(true);
    toast.success('Review link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Leave a verified review',
        text: `Please review my work on ${jobTitle}`,
        url: reviewUrl,
      });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-surface-2 rounded-3xl border border-white/10 shadow-card p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-lg">Share Review QR</h3>
            <p className="text-white/50 text-sm mt-0.5 truncate">{jobTitle}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
            <X size={18} />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex justify-center mb-5">
          <div className="bg-white p-4 rounded-2xl">
            <QRCodeSVG
              value={reviewUrl}
              size={200}
              bgColor="#ffffff"
              fgColor="#1a1a2e"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="glass p-3 mb-4 text-center">
          <p className="text-white/70 text-sm">
            📱 Ask your client to scan this QR code to leave a <span className="text-primary-400 font-medium">verified review</span>
          </p>
        </div>

        {/* URL Preview */}
        <div className="flex items-center gap-2 bg-surface-3 rounded-xl px-3 py-2 mb-4">
          <span className="text-white/40 text-xs truncate flex-1">{reviewUrl}</span>
          <button onClick={handleCopy} className="shrink-0 text-primary-400 hover:text-primary-300 transition">
            <Copy size={16} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={handleShare} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Share2 size={16} />
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}
