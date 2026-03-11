import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, Mail, Lock, Phone, ShieldCheck } from 'lucide-react';

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
      navigate('/');
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
      navigate('/');
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
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-8 pt-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary">Welcome Back</h2>
        <p className="text-slate-500 mt-2">Sign in to access your medical records</p>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => { setLoginMethod('email'); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
        >
          Email
        </button>
        <button 
          onClick={() => { setLoginMethod('phone'); setError(''); }}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-primary' : 'text-slate-500'}`}
        >
          Phone
        </button>
      </div>

      {loginMethod === 'email' ? (
        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="input-field pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="input-field pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-4">
            {loading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>
      ) : (
        <form onSubmit={verificationId ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-4">
          {!verificationId ? (
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="tel"
                placeholder="Phone Number (+1234567890)"
                className="input-field pl-12"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="relative">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                className="input-field pl-12"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          )}
          <div id="recaptcha-container"></div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button disabled={loading} className="btn-primary flex items-center justify-center gap-2 py-4">
            {loading ? 'Processing...' : (verificationId ? 'Verify OTP' : 'Send OTP')}
          </button>
          {verificationId && (
            <button 
              type="button" 
              onClick={() => setVerificationId(null)}
              className="text-sm text-primary font-medium text-center"
            >
              Change Phone Number
            </button>
          )}
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
        <div className="relative flex justify-center text-sm uppercase"><span className="bg-white px-2 text-slate-500">Or continue with</span></div>
      </div>

      <button onClick={handleGoogleLogin} className="btn-secondary flex items-center justify-center gap-2 py-4">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
        Google
      </button>

      <p className="text-center text-slate-600">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-semibold hover:underline">Register</Link>
      </p>
    </div>
  );
};

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

export default Login;
