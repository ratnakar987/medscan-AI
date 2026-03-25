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
  Camera,
  ShieldCheck,
  AlertCircle,
  Info,
  Heart,
  Download,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col w-full overflow-x-hidden bg-white">
      {/* Trust Banner Top */}
      <div className="bg-primary/5 py-3 px-6 text-center border-b border-primary/10">
        <p className="text-[10px] md:text-xs font-black text-primary uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldCheck size={14} /> 100% Private & Secure • No data stored • AI-Powered Medical Insights
        </p>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 left-0 right-0 bg-white/80 backdrop-blur-xl z-[100] border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Activity size={24} />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">RXDecode</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-black text-slate-600 hover:text-primary transition-colors">How it Works</a>
            <a href="#features" className="text-sm font-black text-slate-600 hover:text-primary transition-colors">Features</a>
            <a href="#faq" className="text-sm font-black text-slate-600 hover:text-primary transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-black text-slate-600 hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,_transparent_70%)] opacity-[0.03] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black mb-8 uppercase tracking-widest border border-emerald-100">
              <ShieldCheck size={14} />
              <span>Trusted by 10,000+ Users</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              Stop Googling <br />
              <span className="text-primary">Your Report.</span>
            </h1>
            <h2 className="text-3xl lg:text-4xl font-black text-slate-700 mb-8">
              Understand Your Lab Results Instantly with AI.
            </h2>
            <p className="text-xl text-slate-700 mb-10 max-w-lg leading-relaxed font-bold">
              Upload your lab report or prescription and get clear explanations, health insights, and diet recommendations in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to={user ? "/scan" : "/register"} className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 group shadow-2xl shadow-primary/30 hover:scale-105 transition-transform">
                Upload Report <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-slate-50 transition-colors">
                See Demo
              </button>
            </div>

            <div className="mt-12 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 items-start">
              <AlertCircle size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                ⚠️ This tool provides AI-generated insights and is not a substitute for professional medical advice. Always consult a doctor before making health decisions.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Visual Comparison UI */}
            <div className="relative z-10 grid grid-cols-1 gap-6">
              {/* Left: Sample Report */}
              <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 rotate-[-2deg] relative z-20">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <FileText size={18} />
                    </div>
                    <span className="text-xs font-black text-slate-900">Blood_Report_01.pdf</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-600">1.2 MB</span>
                </div>
                <div className="space-y-3">
                  <div className="h-3 w-full bg-slate-50 rounded-full"></div>
                  <div className="h-3 w-3/4 bg-slate-50 rounded-full"></div>
                  <div className="h-3 w-1/2 bg-slate-50 rounded-full"></div>
                  <div className="pt-4 border-t border-slate-50 flex justify-between">
                    <div className="h-3 w-20 bg-slate-100 rounded-full"></div>
                    <div className="h-3 w-12 bg-rose-100 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Right: AI Output Preview */}
              <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/30 rotate-[2deg] -mt-12 ml-8 relative z-30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Zap size={20} className="fill-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90">AI Analysis</p>
                    <h3 className="text-lg font-black">Key Findings</h3>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={12} />
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-white">Hemoglobin levels are slightly below normal range (11.2 g/dL).</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Pill size={12} />
                    </div>
                    <p className="text-xs font-bold leading-relaxed text-white">Iron deficiency detected. Consider iron-rich supplements.</p>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Diet Suggestion</p>
                  <p className="text-xs font-bold italic text-white">"Increase spinach and red meat intake..."</p>
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
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Stop Googling your reports. <br />
            <span className="text-primary">Understand them instantly with medical-grade AI.</span>
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale invert">
            <div className="flex items-center gap-2 text-white font-black text-xl">
              <Shield size={24} /> SECURE
            </div>
            <div className="flex items-center gap-2 text-white font-black text-xl">
              <Lock size={24} /> PRIVATE
            </div>
            <div className="flex items-center gap-2 text-white font-black text-xl">
              <CheckCircle2 size={24} /> ACCURATE
            </div>
          </div>
        </div>
      </section>

      {/* See How It Works - Comparison */}
      <section id="how-it-works" className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">How It Works</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">From Complexity to Clarity</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-stretch">
            {/* Complexity Side */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500">
                  <FileText size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">Raw Medical Data</h4>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Confusing & Technical</p>
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-mono text-slate-700">WBC Count: 11.5 x 10^3/uL [Ref: 4.5-11.0]</p>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2">
                    <div className="h-full w-[85%] bg-rose-400 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-mono text-slate-700">Neutrophils: 78% [Ref: 40-70]</p>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2">
                    <div className="h-full w-[90%] bg-rose-400 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs font-mono text-slate-700">CRP: 12.4 mg/L [Ref: &lt;3.0]</p>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full mt-2">
                    <div className="h-full w-[95%] bg-rose-400 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-rose-50 rounded-2xl text-center">
                <p className="text-xs font-black text-rose-600">"What does this mean? Am I okay?"</p>
              </div>
            </div>

            {/* Clarity Side */}
            <div className="bg-primary rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/20 flex flex-col relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Zap size={28} className="fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black">RXDecode Analysis</h4>
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest">Clear & Actionable</p>
                  </div>
                </div>
                <div className="flex-1 space-y-6">
                  <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <h5 className="text-sm font-black mb-2 flex items-center gap-2">
                      <AlertCircle size={16} /> Key Findings
                    </h5>
                    <p className="text-xs font-bold text-white">Signs of acute bacterial infection detected based on elevated WBC and CRP levels.</p>
                  </div>
                  <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <h5 className="text-sm font-black mb-2 flex items-center gap-2">
                      <Info size={16} /> Simple Explanation
                    </h5>
                    <p className="text-xs font-bold text-white">Your body is currently fighting an infection. This is why your white blood cell count is high.</p>
                  </div>
                  <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <h5 className="text-sm font-black mb-2 flex items-center gap-2">
                      <Pill size={16} /> Diet Suggestions
                    </h5>
                    <p className="text-xs font-bold text-white">Increase Vitamin C intake and stay hydrated to support your immune system.</p>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-white/20 rounded-2xl text-center backdrop-blur-md">
                  <p className="text-xs font-black">"I understand now. I'll talk to my doctor about the infection."</p>
                </div>
              </div>
              <Activity className="absolute -right-20 -bottom-20 text-white/5" size={400} />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Premium Features</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Built for Your Health</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Camera size={32} />, title: "Instant Scan", desc: "Snap a photo of any medical document for immediate analysis." },
              { icon: <ShieldCheck size={32} />, title: "Private & Secure", desc: "Your data is encrypted and never shared with anyone." },
              { icon: <Heart size={32} />, title: "Diet Plans", desc: "Get personalized food recommendations based on your results." },
              { icon: <Download size={32} />, title: "PDF Reports", desc: "Download professional summaries to share with your doctor." }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 hover:border-primary/20 hover:shadow-xl transition-all group">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-4">{feature.title}</h4>
                <p className="text-slate-700 font-bold text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Social Proof</h2>
              <h3 className="text-4xl lg:text-6xl font-black tracking-tight mb-8">Trusted by thousands of patients.</h3>
              <p className="text-xl text-slate-300 font-bold mb-12">Join the growing community of people taking control of their health data.</p>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-14 h-14 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden">
                      <img src={`https://picsum.photos/seed/face${i}/100/100`} alt="User" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-lg font-black">4.9/5 Rating</p>
                  <p className="text-sm font-bold text-slate-400">Based on 2,000+ reviews</p>
                </div>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm">
                <p className="text-xl font-bold leading-relaxed mb-8">"This helped me understand my blood test in seconds. No more waiting days for a doctor's call just to explain basic values."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">R</div>
                  <div>
                    <p className="text-lg font-black">Rahul Sharma</p>
                    <p className="text-sm font-bold text-slate-400">New Delhi, India</p>
                  </div>
                </div>
              </div>
              <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 backdrop-blur-sm translate-x-6">
                <p className="text-xl font-bold leading-relaxed mb-8">"Very simple and useful tool for my parents. They can now understand their prescriptions without getting confused."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-black">P</div>
                  <div>
                    <p className="text-lg font-black">Priya Kapoor</p>
                    <p className="text-sm font-bold text-slate-400">Mumbai, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">FAQ</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">Common Questions</h3>
          </div>

          <div className="space-y-4">
            {[
              { q: "Is my data safe?", a: "Absolutely. We use bank-grade encryption and your data is never stored or shared with third parties. Your privacy is our top priority." },
              { q: "Can I trust AI results?", a: "Our AI is trained on vast medical datasets and provides highly accurate interpretations. However, it is for educational purposes only. Always consult a professional doctor." },
              { q: "Is this free?", a: "We offer a generous free plan with 10 reports per month. For unlimited access and premium features, you can upgrade to RXDecode Pro." },
              { q: "How do I download my reports?", a: "Once analyzed, you can download a professional PDF summary of your report directly from your dashboard." }
            ].map((faq, i) => (
              <details key={i} className="group bg-slate-50 rounded-[2rem] border border-slate-100 open:bg-white open:shadow-xl transition-all">
                <summary className="p-8 cursor-pointer flex justify-between items-center list-none">
                  <h3 className="text-lg font-black text-slate-900">{faq.q}</h3>
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-400 group-open:rotate-180 transition-transform shadow-sm">
                    <ChevronRight size={20} className="rotate-90" />
                  </div>
                </summary>
                <div className="px-8 pb-8">
                  <p className="text-slate-700 font-bold leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-32 pb-12 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                  <Activity size={24} />
                </div>
                <span className="text-2xl font-black tracking-tight text-slate-900">RXDecode</span>
              </div>
              <p className="text-slate-700 max-w-sm font-bold leading-relaxed mb-8">
                Empowering patients with instant medical report clarity through advanced AI technology. Trusted, private, and secure.
              </p>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer shadow-sm">
                  <Globe size={20} />
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-600 hover:text-primary transition-colors cursor-pointer shadow-sm">
                  <Smartphone size={20} />
                </div>
              </div>
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Product</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-700">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8">Legal</h5>
              <ul className="space-y-4 text-sm font-bold text-slate-700">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Disclaimer</a></li>
              </ul>
            </div>
          </div>
          
          <div className="p-8 bg-white rounded-[2rem] border border-slate-200 mb-12">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">100% Private & Secure</p>
                  <p className="text-xs font-bold text-slate-600">Your data is encrypted and never stored.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                  <AlertCircle size={24} />
                </div>
                <p className="text-[10px] font-bold text-amber-700 max-w-xs leading-tight">
                  This tool provides AI-generated insights and is not a substitute for professional medical advice.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-bold text-slate-600">© 2026 RXDecode AI. All rights reserved.</p>
            <p className="text-sm font-bold text-slate-600">Always consult a doctor before making health decisions.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
