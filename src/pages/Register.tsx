import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserPlus, Mail, Lock, User, Activity, CheckCircle2, ArrowRight } from 'lucide-react';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: name });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phone: phone,
        age: parseInt(age),
        gender: gender,
        createdAt: serverTimestamp(),
      });

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
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // For Google login, we might want to check if user doc exists, 
      // but typical register flow usually means first time.
      // We set basic profile if it's a new user.
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
      }, { merge: true });

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-stretch">
      {/* Sidebar - Trust & Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#28A745] p-20 flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 mb-20">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#28A745]">
              <Activity size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">RxDecode</span>
          </Link>
          
          <h1 className="text-5xl font-black text-white leading-tight mb-8">
            Decode medical jargon in 10 seconds.
          </h1>
          <p className="text-white/80 text-xl font-bold mb-12 max-w-md">
            Join thousands of patients who are taking control of their health journey.
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
              <div key={i} className="w-12 h-12 rounded-full border-4 border-[#28A745] bg-white/20 backdrop-blur-md" />
            ))}
          </div>
          <p className="text-white/60 text-sm font-bold">Start your 100% private journey today</p>
        </div>

        {/* Abstract Background Shapes */}
        <Activity className="absolute -right-20 -bottom-20 text-white/5" size={600} />
      </div>

      {/* Main Register Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 lg:px-24 bg-white overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full mx-auto py-8"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Create Account</h2>
            <p className="text-slate-500 font-bold text-lg">Start managing your health today.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#28A745] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#28A745] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#28A745] focus:bg-white rounded-2xl py-4 pl-12 pr-4 outline-none transition-all font-bold text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Age</label>
                <input
                  type="number"
                  placeholder="25"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#28A745] focus:bg-white rounded-2xl py-4 px-4 outline-none transition-all font-bold text-slate-700"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Gender</label>
                <select
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-[#28A745] focus:bg-white rounded-2xl py-4 px-4 outline-none transition-all font-bold text-slate-700 appearance-none"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 text-center py-2">
              <p className="text-[10px] text-slate-400 font-bold italic uppercase tracking-wider">
                Files deleted within 24 hours automatically
              </p>
            </div>

            {error && (
              <p className="p-4 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl border border-rose-100">
                {error}
              </p>
            )}

            <button disabled={loading} className="w-full bg-[#28A745] text-white py-5 rounded-2xl text-xl font-black shadow-xl shadow-[#28A745]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group">
              {loading ? 'Creating account...' : <><UserPlus size={24} /> Register <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]"><span className="bg-white px-4 text-slate-400 font-black">Or sign up with</span></div>
          </div>

          <button onClick={handleGoogleLogin} className="w-full bg-white border-2 border-slate-100 text-slate-900 py-5 rounded-2xl text-lg font-black hover:bg-slate-50 transition-colors flex items-center justify-center gap-4">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" loading="lazy" decoding="async" />
            Continue with Google
          </button>

          <p className="mt-10 text-center text-slate-500 font-bold">
            Already have an account?{' '}
            <Link to="/login" className="text-[#28A745] font-black hover:underline uppercase tracking-widest text-xs">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
