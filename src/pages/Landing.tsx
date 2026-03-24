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
  Smartphone,
  Globe,
  Lock,
  Camera
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Activity size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">RxDecode AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">How it Works</a>
            <a href="#security" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-6">
              <Zap size={14} />
              <span>Next-Gen Medical Intelligence</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
              Understand Your <span className="text-primary">Medical Reports</span> in Seconds.
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg leading-relaxed">
              RxDecode AI uses advanced medical intelligence to scan your prescriptions and lab reports, providing clear, patient-friendly insights and health summaries.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto btn-primary px-8 py-4 rounded-2xl text-lg font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 group">
                Start Free Scan <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-slate-500">Trusted by 10k+ users</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://picsum.photos/seed/medical-app/1200/800" 
                alt="App Preview" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            {/* Floating Stats */}
            <div className="absolute top-10 -left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 hidden md:block animate-bounce-slow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                  <p className="text-lg font-bold text-slate-800">99.2%</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">Powerful Features</h2>
            <h3 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">Everything you need to manage your health data.</h3>
            <p className="text-lg text-slate-600">We've built a comprehensive suite of tools to help you understand your medical records without the jargon.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Camera className="text-emerald-500" />,
                title: "Smart Scanning",
                desc: "Upload or take a photo of any prescription or lab report."
              },
              {
                icon: <Zap className="text-blue-500" />,
                title: "AI Analysis",
                desc: "Instant breakdown of medicines, dosages, and test results."
              },
              {
                icon: <FileText className="text-purple-500" />,
                title: "Medical History",
                desc: "Keep all your reports in one secure, organized digital vault."
              },
              {
                icon: <Pill className="text-rose-500" />,
                title: "Medicine Guide",
                desc: "Get clear explanations for every prescribed medicine."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-transparent transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-bold text-primary uppercase tracking-[0.2em] mb-4">The Process</h2>
              <h3 className="text-4xl lg:text-5xl font-bold mb-12">Three simple steps to clarity.</h3>
              
              <div className="space-y-12">
                {[
                  { step: "01", title: "Upload your document", desc: "Simply snap a photo or upload a PDF of your medical report." },
                  { step: "02", title: "AI Processing", desc: "Our advanced medical engine extracts every detail with high precision." },
                  { step: "03", title: "Get Insights", desc: "Receive a holistic summary, medicine guide, and dietary tips." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <span className="text-4xl font-bold text-primary/30 font-mono">{item.step}</span>
                    <div>
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-full border border-white/10 flex items-center justify-center p-12">
                <div className="aspect-square w-full rounded-full border border-white/20 flex items-center justify-center p-12">
                  <div className="aspect-square w-full rounded-full bg-primary/20 flex items-center justify-center">
                    <Activity size={120} className="text-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-50 rounded-[3rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg shadow-primary/20">
                <Lock size={32} />
              </div>
              <h3 className="text-4xl font-bold text-slate-900 mb-6">Your privacy is our top priority.</h3>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We use bank-grade encryption and secure cloud storage to ensure your medical data is only accessible by you. We never share your personal health information with third parties.
              </p>
              <ul className="space-y-4">
                {["End-to-end encryption", "HIPAA compliant architecture", "Secure Firebase storage", "Private AI processing"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-40 bg-white rounded-3xl shadow-sm border border-slate-100"></div>
                <div className="h-60 bg-primary rounded-3xl shadow-lg shadow-primary/20"></div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-60 bg-slate-200 rounded-3xl"></div>
                <div className="h-40 bg-white rounded-3xl shadow-sm border border-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">Ready to take control of your health data?</h3>
          <p className="text-xl text-slate-600 mb-12">Join thousands of users who are making better health decisions with RxDecode AI.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto btn-primary px-10 py-5 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/30">
              Get Started for Free
            </Link>
            <Link to="/login" className="w-full sm:w-auto btn-secondary px-10 py-5 rounded-2xl text-xl font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Activity size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">RxDecode AI</span>
          </div>
          <div className="flex items-center gap-8 text-sm font-medium text-slate-500">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 RxDecode AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
