import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import {
  Mic, MicOff, CheckCircle, RefreshCw, ChevronRight,
  Zap, MapPin, Clock, Star, Wrench, User, Briefcase,
  Volume2, Loader2, Sparkles, ArrowLeft
} from 'lucide-react';

// ── Supported example phrases ─────────────────────────────────────────────────
const EXAMPLE_PHRASES = [
  "I'm Ravi, an electrician with 5 years experience in Mumbai, I charge 400 rupees per hour",
  "My name is Suresh. I'm a plumber from Pune with 8 years experience, rate is 350 per hour",
  "I am a carpenter based in Delhi. 12 years of experience in furniture making and woodwork",
  "I'm a painter with 3 years experience from Bangalore, 300 rupees per hour",
  "My name is Ahmed, welder from Hyderabad, 6 years experience in arc welding",
];

// ── Animated waveform bars ────────────────────────────────────────────────────
function WaveformBars({ active, level = 0 }) {
  const bars = 20;
  return (
    <div className="flex items-center justify-center gap-[3px] h-16">
      {Array.from({ length: bars }).map((_, i) => {
        const mid = bars / 2;
        const distance = Math.abs(i - mid) / mid;
        const baseHeight = 8;
        const maxExtra = active ? (40 + level * 30) * (1 - distance * 0.6) : 4;
        const height = baseHeight + (active ? Math.random() * maxExtra : 0);
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: 3,
              height: `${Math.max(4, height)}px`,
              background: active
                ? `linear-gradient(to top, #6366f1, #a855f7, #ec4899)`
                : 'rgba(255,255,255,0.15)',
              transition: active ? 'height 0.08s ease' : 'height 0.4s ease',
              animationDelay: `${i * 40}ms`,
            }}
          />
        );
      })}
    </div>
  );
}

// ── Parsed profile card ───────────────────────────────────────────────────────
function ParsedProfileCard({ parsed, onApply, applying }) {
  if (!parsed) return null;

  const confidenceColor =
    parsed.confidence >= 70 ? 'text-emerald-400' :
    parsed.confidence >= 40 ? 'text-yellow-400' :
    'text-red-400';

  const confidenceBg =
    parsed.confidence >= 70 ? 'from-emerald-500/20 to-emerald-500/5' :
    parsed.confidence >= 40 ? 'from-yellow-500/20 to-yellow-500/5' :
    'from-red-500/20 to-red-500/5';

  return (
    <div className="animate-slide-up">
      {/* Confidence indicator */}
      <div className={`flex items-center justify-between mb-3 px-4 py-2.5 rounded-xl bg-gradient-to-r ${confidenceBg} border border-white/10`}>
        <div className="flex items-center gap-2">
          <Sparkles size={16} className={confidenceColor} />
          <span className="text-sm font-medium text-white/80">AI Confidence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${parsed.confidence}%`,
                background: parsed.confidence >= 70
                  ? 'linear-gradient(to right, #10b981, #34d399)'
                  : parsed.confidence >= 40
                  ? 'linear-gradient(to right, #f59e0b, #fcd34d)'
                  : 'linear-gradient(to right, #ef4444, #f87171)',
              }}
            />
          </div>
          <span className={`text-sm font-bold ${confidenceColor}`}>{parsed.confidence}%</span>
        </div>
      </div>

      {/* Parsed data card */}
      <div className="card bg-gradient-to-br from-surface-2 to-surface border border-indigo-500/20 mb-4 space-y-3">
        <h3 className="font-display font-bold text-base text-white/90 flex items-center gap-2 mb-1">
          <Zap size={16} className="text-indigo-400" />
          Extracted Profile
        </h3>

        {parsed.name && (
          <div className="flex items-center gap-3 py-2 border-b border-white/5">
            <User size={15} className="text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Name</p>
              <p className="font-semibold text-sm">{parsed.name}</p>
            </div>
          </div>
        )}

        {parsed.skills.length > 0 && (
          <div className="flex items-start gap-3 py-2 border-b border-white/5">
            <Briefcase size={15} className="text-purple-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-white/40 mb-1.5">Skills Detected</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.skills.map((skill) => (
                  <span key={skill} className="badge bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 text-xs px-2 py-0.5">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {parsed.experience !== null && (
          <div className="flex items-center gap-3 py-2 border-b border-white/5">
            <Clock size={15} className="text-emerald-400 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Experience</p>
              <p className="font-semibold text-sm">{parsed.experience} years</p>
            </div>
          </div>
        )}

        {parsed.location && (
          <div className="flex items-center gap-3 py-2 border-b border-white/5">
            <MapPin size={15} className="text-pink-400 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Location</p>
              <p className="font-semibold text-sm">{parsed.location}</p>
            </div>
          </div>
        )}

        {parsed.hourlyRate && (
          <div className="flex items-center gap-3 py-2 border-b border-white/5">
            <Star size={15} className="text-yellow-400 shrink-0" />
            <div>
              <p className="text-xs text-white/40">Hourly Rate</p>
              <p className="font-semibold text-sm">₹{parsed.hourlyRate}/hour</p>
            </div>
          </div>
        )}

        {parsed.tools.length > 0 && (
          <div className="flex items-start gap-3 py-2">
            <Wrench size={15} className="text-orange-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-white/40 mb-1.5">Tools</p>
              <div className="flex flex-wrap gap-1.5">
                {parsed.tools.map((tool) => (
                  <span key={tool} className="badge bg-orange-500/15 text-orange-300 border border-orange-500/20 text-xs px-2 py-0.5">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {parsed.skills.length === 0 && !parsed.experience && !parsed.location && (
          <div className="py-4 text-center">
            <p className="text-white/40 text-sm">No structured data detected yet.</p>
            <p className="text-white/30 text-xs mt-1">Try mentioning your profession, years of experience, and city.</p>
          </div>
        )}
      </div>

      {/* Apply button */}
      {(parsed.skills.length > 0 || parsed.experience || parsed.location) && (
        <button
          onClick={onApply}
          disabled={applying}
          className="btn-primary w-full flex items-center justify-center gap-2 text-base"
        >
          {applying ? (
            <><Loader2 size={18} className="animate-spin" /> Applying to Profile…</>
          ) : (
            <><CheckCircle size={18} /> Apply to My Profile</>
          )}
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function VoiceAssistant() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('idle'); // idle | recording | processing | done
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentExample, setCurrentExample] = useState(0);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLang, setSelectedLang] = useState('en-US');

  const recognitionRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  // Refs to avoid stale closures in stopRecording
  const transcriptRef = useRef('');
  const interimRef = useRef('');
  // Flag to distinguish intentional stop from unexpected recognition end
  const isStoppingRef = useRef(false);
  const selectedLangRef = useRef('en-US');

  // Rotate example phrases
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample(prev => (prev + 1) % EXAMPLE_PHRASES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) setBrowserSupported(false);
    return () => stopAll();
  }, []);

  // Timer while recording
  useEffect(() => {
    if (phase === 'recording') {
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const stopAll = () => {
    recognitionRef.current?.stop();
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const analyzeAudio = (analyser) => {
    const buf = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(buf);
      const avg = buf.reduce((a, b) => a + b, 0) / buf.length;
      setAudioLevel(avg / 128);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const startRecognitionInstance = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition || isStoppingRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLangRef.current;
    recognition.interimResults = true;
    recognition.continuous = false; // Non-continuous + auto-restart is FAR more reliable
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let finalText = '';
      let interimStr = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += text + ' ';
        else interimStr += text;
      }
      if (finalText) {
        transcriptRef.current += finalText;
        setTranscript(transcriptRef.current);
      }
      interimRef.current = interimStr;
      setInterimText(interimStr);
    };

    recognition.onerror = (e) => {
      console.warn('SpeechRecognition error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        toast.error('Microphone access denied. Please allow microphone in browser settings.');
        isStoppingRef.current = true;
        setPhase('idle');
      } else if (e.error === 'network') {
        toast.error('Speech recognition needs internet. Try typing instead.');
        isStoppingRef.current = true;
        setPhase('idle');
      } else if (e.error === 'no-speech' || e.error === 'aborted') {
        // Will auto-restart via onend
      } else {
        console.warn('Unhandled speech error:', e.error);
      }
    };

    recognition.onend = () => {
      setInterimText('');
      interimRef.current = '';
      // Auto-restart unless user intentionally stopped
      if (!isStoppingRef.current) {
        setTimeout(() => startRecognitionInstance(), 100);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn('Recognition start error:', err);
      if (!isStoppingRef.current) {
        setTimeout(() => startRecognitionInstance(), 200);
      }
    }
  }, []);

  const startRecording = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported in this browser. Use Chrome.');
      return;
    }

    setTranscript('');
    setInterimText('');
    setParsed(null);
    setApplied(false);
    transcriptRef.current = '';
    interimRef.current = '';
    isStoppingRef.current = false;
    setPhase('recording');

    // Setup audio analyser for waveform
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      src.connect(analyser);
      analyserRef.current = analyser;
      analyzeAudio(analyser);
    } catch {
      // Waveform visualizer optional — continue without it
    }

    startRecognitionInstance();
  }, [startRecognitionInstance]);

  const stopRecording = useCallback(async () => {
    isStoppingRef.current = true; // Prevent auto-restart
    stopAll();
    setPhase('processing');

    // Capture any pending interim text as final
    const finalTranscript = (transcriptRef.current + ' ' + interimRef.current).trim();
    setInterimText('');
    interimRef.current = '';

    if (!finalTranscript) {
      toast.error('No speech captured. Speak clearly after tapping, then tap again to stop.');
      setPhase('idle');
      return;
    }

    setTranscript(finalTranscript);
    transcriptRef.current = finalTranscript;

    try {
      const { data } = await api.post('/voice/parse', { transcript: finalTranscript });
      if (data.success) {
        setParsed(data.parsed);
        setPhase('done');
      } else {
        toast.error(data.message || 'Could not parse transcript.');
        setPhase('idle');
      }
    } catch (err) {
      toast.error('Failed to process speech. Please try again.');
      setPhase('idle');
    }
  }, []);

  const applyProfile = async () => {
    if (!transcript) return;
    setApplying(true);
    try {
      const { data } = await api.post('/voice/apply', { transcript });
      if (data.success) {
        toast.success('🎉 Profile updated from your voice!');
        await refreshUser();
        setApplied(true);
      } else {
        toast.error(data.message || 'Failed to apply profile.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to apply profile.');
    } finally {
      setApplying(false);
    }
  };

  const reset = () => {
    stopAll();
    setPhase('idle');
    setTranscript('');
    setInterimText('');
    setParsed(null);
    setApplied(false);
    setAudioLevel(0);
    setRecordingTime(0);
  };

  // Manual text input (fallback / demo)
  const [showManual, setShowManual] = useState(false);
  const [manualText, setManualText] = useState('');

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setTranscript(manualText.trim());
    setPhase('processing');
    try {
      const { data } = await api.post('/voice/parse', { transcript: manualText.trim() });
      if (data.success) {
        setParsed(data.parsed);
        setPhase('done');
      }
    } catch {
      toast.error('Parse failed.');
      setPhase('idle');
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="page-container animate-fade-in">
      {/* ── Header ── */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition shrink-0"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-display font-bold text-xl">Voice Assistant</h1>
          <p className="text-white/40 text-xs">Speak to build your profile instantly</p>
        </div>
        <div className="ml-auto">
          <span className="badge bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs">
            🇮🇳 Hindi + English
          </span>
        </div>
      </div>

      {/* ── Hero mic section ── */}
      <div className="card bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-pink-900/20 border-indigo-500/20 mb-5 text-center relative overflow-hidden">
        {/* Glow rings */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: phase === 'recording'
              ? 'radial-gradient(circle at 50% 50%, rgba(99,102,241,0.15) 0%, transparent 70%)'
              : 'none',
          }}
        />

        {/* Waveform */}
        <div className="mb-4 relative">
          <WaveformBars active={phase === 'recording'} level={audioLevel} />
        </div>

        {/* Mic button */}
        <div className="relative inline-block mb-4">
          {phase === 'recording' && (
            <>
              <div className="absolute inset-0 rounded-full animate-ping bg-red-500/30" />
              <div className="absolute inset-[-8px] rounded-full animate-pulse bg-red-500/10" />
            </>
          )}
          <button
            onClick={phase === 'idle' ? startRecording : phase === 'recording' ? stopRecording : reset}
            disabled={phase === 'processing'}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white transition-all duration-300 active:scale-95 shadow-2xl ${
              phase === 'recording'
                ? 'bg-gradient-to-br from-red-500 to-pink-600 shadow-red-500/30'
                : phase === 'processing'
                ? 'bg-gradient-to-br from-indigo-600 to-purple-700 cursor-wait'
                : phase === 'done'
                ? 'bg-gradient-to-br from-slate-600 to-slate-700'
                : 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 shadow-indigo-500/40'
            }`}
          >
            {phase === 'processing' ? (
              <Loader2 size={36} className="animate-spin" />
            ) : phase === 'recording' ? (
              <MicOff size={36} />
            ) : phase === 'done' ? (
              <RefreshCw size={32} />
            ) : (
              <Mic size={36} />
            )}
          </button>
        </div>

        {/* State labels */}
        <div className="min-h-[48px]">
          {phase === 'idle' && (
            <div>
              <p className="font-semibold text-white text-base">Tap to Start Speaking</p>
              <p className="text-white/40 text-xs mt-1">Tell us about your profession</p>
            </div>
          )}
          {phase === 'recording' && (
            <div>
              <p className="text-red-400 font-semibold text-base flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                Recording… {formatTime(recordingTime)}
              </p>
              <p className="text-white/40 text-xs mt-1">Tap the button to stop</p>
            </div>
          )}
          {phase === 'processing' && (
            <div>
              <p className="text-indigo-300 font-semibold text-base">🧠 AI is parsing your speech…</p>
              <p className="text-white/40 text-xs mt-1">Extracting skills, experience &amp; location</p>
            </div>
          )}
          {phase === 'done' && (
            <div>
              <p className="text-emerald-400 font-semibold text-base">✅ Profile Extracted!</p>
              <p className="text-white/40 text-xs mt-1">Tap the button to record again</p>
            </div>
          )}
        </div>

        {/* Timer bar while recording */}
        {phase === 'recording' && (
          <div className="mt-3 mx-4 bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-pink-500 transition-all"
              style={{ width: `${Math.min((recordingTime / 60) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* ── Live transcript ── */}
      {(transcript || interimText) && (
        <div className="card mb-4 border-indigo-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 size={14} className="text-indigo-400" />
            <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">Transcript</p>
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {transcript}
            {interimText && <span className="text-white/30 italic"> {interimText}</span>}
          </p>
        </div>
      )}

      {/* ── Parsed profile ── */}
      {phase === 'done' && parsed && (
        <ParsedProfileCard parsed={parsed} onApply={applyProfile} applying={applying} />
      )}

      {/* ── Applied success ── */}
      {applied && (
        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between animate-slide-up">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-400 shrink-0" />
            <div>
              <p className="font-semibold text-sm text-emerald-300">Profile Updated!</p>
              <p className="text-xs text-white/40">Your profile now reflects your voice input</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/edit-profile')}
            className="flex items-center gap-1 text-emerald-400 text-xs font-medium"
          >
            View <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── Manual text fallback ── */}
      {!browserSupported && (
        <div className="card mb-4 border-yellow-500/20 bg-yellow-500/5">
          <p className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Voice not supported</p>
          <p className="text-white/50 text-xs">Your browser doesn't support speech recognition. Use the text input below instead.</p>
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-white/40 text-xs flex items-center gap-1 hover:text-white/60 transition"
        >
          {showManual ? '▲' : '▼'} {showManual ? 'Hide' : 'Or type your profile description instead'}
        </button>

        {showManual && (
          <div className="mt-3 animate-slide-up space-y-2">
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder={EXAMPLE_PHRASES[0]}
              rows={3}
              className="input-field text-sm resize-none"
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualText.trim() || phase === 'processing'}
              className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2"
            >
              {phase === 'processing' ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Parse with AI
            </button>
          </div>
        )}
      </div>

      {/* ── Tips / examples ── */}
      {phase === 'idle' && (
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Try saying…</h3>
          <div
            className="card py-3 px-4 bg-surface border-white/5 transition-all duration-500"
            key={currentExample}
          >
            <p className="text-white/60 text-sm italic">"{EXAMPLE_PHRASES[currentExample]}"</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { icon: '⚡', label: 'Electrician', phrase: "I'm an electrician with 5 years experience in Mumbai" },
              { icon: '🔧', label: 'Plumber', phrase: "I'm a plumber from Pune, 8 years of experience" },
              { icon: '🪚', label: 'Carpenter', phrase: "I'm a carpenter based in Delhi, 10 years experience" },
              { icon: '🎨', label: 'Painter', phrase: "I'm a painter from Bangalore with 3 years experience" },
            ].map((tip) => (
              <button
                key={tip.label}
                onClick={() => {
                  setManualText(tip.phrase);
                  setShowManual(true);
                }}
                className="card py-3 px-3 text-left hover:border-indigo-500/30 active:scale-95 transition-all"
              >
                <span className="text-xl">{tip.icon}</span>
                <p className="text-xs font-medium mt-1">{tip.label}</p>
                <p className="text-white/30 text-[10px] truncate mt-0.5">{tip.phrase}</p>
              </button>
            ))}
          </div>

          <div className="card bg-indigo-500/5 border-indigo-500/15 py-3">
            <p className="text-xs text-white/40 leading-relaxed">
              💡 <strong className="text-white/60">Tip:</strong> Mention your <span className="text-indigo-300">trade</span>,{' '}
              <span className="text-purple-300">years of experience</span>, <span className="text-pink-300">city</span>,
              and <span className="text-emerald-300">hourly rate</span> for best results.
              Works in English &amp; Hinglish.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
