import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Activity, 
  Pill, 
  FileText,
  Upload,
  Smartphone,
  Globe,
  Lock,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-xl z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Activity size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">RXDecode</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">How it Works</a>
            <a href="#features" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Features</a>
            <a href="#faq" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs font-black mb-8 uppercase tracking-widest border border-primary/20">
              <Shield size={14} className="fill-primary/20" />
              <span>🔒 100% Secure & Medical Grade AI</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight mb-8">
              Decode Your <br />
              <span className="text-primary">Medical Reports.</span> <br />
              <span className="relative">
                Instantly.
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -bottom-2 left-0 h-3 bg-primary/10 -z-10 rounded-full"
                ></motion.div>
              </span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed font-bold">
              Upload your lab report or prescription and get simple, actionable insights powered by our proprietary medical-grade AI.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto btn-primary px-10 py-5 rounded-3xl text-xl font-black flex items-center justify-center gap-3 group">
                Upload Report <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto btn-secondary px-10 py-5 rounded-3xl text-xl font-black">
                See Demo
              </button>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-slate-600">Instant AI Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-primary" />
                <span className="text-sm font-bold text-slate-600">For educational use only</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 bg-white rounded-[3rem] p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm mb-4 flex items-center justify-center">
                      <FileText size={20} className="text-slate-400" />
                    </div>
                    <div className="h-2 w-20 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                    <div className="w-10 h-10 bg-primary rounded-xl shadow-sm mb-4 flex items-center justify-center text-white">
                      <Activity size={20} />
                    </div>
                    <div className="h-2 w-24 bg-primary/20 rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-primary/20 rounded-full"></div>
                  </div>
                </div>
                <div className="pt-8 space-y-4">
                  <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm mb-4 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 size={20} />
                    </div>
                    <div className="h-2 w-20 bg-emerald-200 rounded-full mb-2"></div>
                    <div className="h-2 w-12 bg-emerald-200 rounded-full"></div>
                  </div>
                  <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm mb-4 flex items-center justify-center">
                      <Pill size={20} className="text-slate-400" />
                    </div>
                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-2"></div>
                    <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                  </div>
                </div>
              </div>
              
              {/* AI Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-white flex items-center gap-4 animate-bounce-slow">
                  <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white">
                    <Search size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">AI Analysis</p>
                    <p className="text-sm font-bold text-slate-800">Interpreting Lab Results...</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
          </motion.div>
        </div>
      </section>

      {/* Differentiation Section */}
      <section className="py-12 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
            Stop Googling your reports. <span className="text-primary">Understand them instantly with AI.</span>
          </h2>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">The Process</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">How it Works</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                icon: <Upload size={32} />,
                title: "Upload Report",
                desc: "Simply snap a photo or upload a PDF of your medical report."
              },
              {
                step: "02",
                icon: <Search size={32} />,
                title: "AI Analysis",
                desc: "Our medical-grade AI analyzes every value in seconds."
              },
              {
                step: "03",
                icon: <CheckCircle2 size={32} />,
                title: "Get Insights",
                desc: "Receive clear summaries and personalized diet suggestions."
              }
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="mb-8 w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm">
                  {item.icon}
                </div>
                <span className="absolute top-0 right-0 text-6xl font-black text-slate-100 -z-10">{item.step}</span>
                <h4 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Testimonials</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-8">Trusted by thousands of patients.</h3>
              <p className="text-lg text-slate-500 font-medium mb-12">Join the growing community of people taking control of their health data.</p>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/face${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-600">4.9/5 Average Rating</span>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                <p className="text-lg font-bold text-slate-800 mb-6">"This helped me understand my blood test easily. No more waiting days for a doctor's call just to explain basic values."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Sarah Johnson</p>
                    <p className="text-xs font-bold text-slate-400">Verified User</p>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 translate-x-6">
                <p className="text-lg font-bold text-slate-800 mb-6">"The diet recommendations were spot on. It's like having a nutritionist and a doctor in my pocket."</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                  <div>
                    <p className="text-sm font-black text-slate-900">Michael Chen</p>
                    <p className="text-xs font-bold text-slate-400">Verified User</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">FAQ</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Common Questions</h3>
          </div>

          <div className="space-y-6">
            {[
              { q: "Is this safe?", a: "Yes, we use bank-grade encryption to protect your data. Your reports are processed securely and never shared with third parties." },
              { q: "Is my data secure?", a: "Absolutely. All data is encrypted at rest and in transit. You have full control over your history and can delete it anytime." },
              { q: "Can I trust AI results?", a: "Our AI is trained on vast medical datasets, but it is for educational purposes only. Always consult a professional doctor for medical decisions." }
            ].map((faq, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100">
                <h4 className="text-xl font-black text-slate-900 mb-4">{faq.q}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                  <Activity size={18} />
                </div>
                <span className="text-lg font-black tracking-tight text-slate-900">RXDecode</span>
              </div>
              <p className="text-slate-500 max-w-xs font-medium leading-relaxed">
                Empowering patients with instant medical report clarity through advanced AI technology.
              </p>
            </div>
            <div>
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Product</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Legal</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-400">© 2026 RXDecode AI. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
                <Globe size={20} />
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors cursor-pointer">
                <Smartphone size={20} />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
