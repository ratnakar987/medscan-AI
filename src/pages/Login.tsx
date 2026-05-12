import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, Mail, Lock, Phone, ShieldCheck, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

const Login: React.FC = () => {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginMethod === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [loginMethod]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmationResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationId) return;
    setLoading(true);
    setError('');
    try {
      await verificationId.confirm(otp);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch">
      {/* Sidebar - Trust & Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#007BFF] p-20 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#007BFF]">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">RxDecode</span>
          </Link>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-8">
            Manage your medical records with confidence.
          </h1>
          <p className="text-white/80 text-xl font-bold mb-12 max-w-md">
            Your personal AI-powered health portal. Private, secure, and always accessible.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-white/90 font-bold">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              Files auto-deleted after analysis
            </div>
            <div className="flex items-center gap-4 text-white/90 font-bold">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              Bank-grade security encryption
            </div>
            <div className="flex items-center gap-4 text-white/90 font-bold">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <CheckCircle2 size={14} />
              </div>
              Built with care in India
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-6 pt-12 border-t border-white/10">
          <div className="flex -space-x-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-[#007BFF] bg-white/20 backdrop-blur-md" />
            ))}
          </div>
          <p className="text-white/60 text-sm font-bold">Joined by 10,000+ users across India</p>
        </div>

        {/* Abstract Background Shapes */}
        <Activity className="absolute -right-20 -bottom-20 text-white/5" size={600} />
      </div>

      {/* Main Login Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-24 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Welcome Back</h2>
            <p className="text-slate-500 font-bold text-lg">Sign in to your health dashboard.</p>
          </div>

          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button 
              onClick={() => { setLoginMethod('email'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-[#007BFF]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Email
            </button>
            <button 
              onClick={() => { setLoginMethod('phone'); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-[#007BFF]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Phone
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007BFF] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</label>
                  <button type="button" className="text-xs font-black text-[#007BFF] uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007BFF] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              {error && (
                <p className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100">
                  {error}
                </p>
              )}
              <button disabled={loading} className="w-full bg-[#007BFF] text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-[#007BFF]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group">
                {loading ? 'Signing in...' : <><LogIn size={24} /> Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={verificationId ? handleVerifyOtp : handleSendOtp} className="space-y-4">
              {!verificationId ? (
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007BFF] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Verification Code</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007BFF] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}
              <div id="recaptcha-container"></div>
              {error && (
                <p className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100">
                  {error}
                </p>
              )}
              <button disabled={loading} className="w-full bg-[#007BFF] text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-[#007BFF]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                {loading ? 'Processing...' : (verificationId ? 'Verify OTP' : 'Send OTP')}
              </button>
              {verificationId && (
                <button 
                  type="button" 
                  onClick={() => setVerificationId(null)}
                  className="w-full text-sm font-black text-[#007BFF] uppercase tracking-widest text-center"
                >
                  Change Phone Number
                </button>
              )}
            </form>
          )}

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-400 font-black">Or secure login with</span></div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full bg-white border-2 border-slate-100 text-slate-900 py-5 rounded-2xl text-lg font-black hover:bg-slate-50 transition-colors flex items-center justify-center gap-4">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" loading="lazy" decoding="async" />
            Continue with Google
          </button>

          <p className="mt-12 text-center text-slate-500 font-bold">
            New to RxDecode?{' '}
            <Link to="/register" className="text-[#007BFF] font-black hover:underline uppercase tracking-widest text-xs">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default Login;
