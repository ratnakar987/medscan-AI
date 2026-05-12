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
  Stethoscope,
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
            <a href="#about" className="text-sm font-black text-slate-600 hover:text-primary transition-colors">About Us</a>
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
              <span>100% Private & Secure | Reports deleted after analysis</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
              RxDecode: <br />
              <span className="text-primary">Understand your doctor’s prescription in 10 seconds.</span>
            </h1>
            <p className="text-xl text-slate-700 mb-10 max-w-lg leading-relaxed font-bold">
              Upload your prescription or lab report. Get plain-language explanations, key insights, and next steps.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to={user ? "/scan" : "/register"} className="w-full sm:w-auto bg-[#007BFF] text-white px-10 py-5 rounded-[2rem] text-xl font-black flex items-center justify-center gap-3 group shadow-2xl shadow-[#007BFF]/30 hover:scale-105 transition-all">
                Upload Report <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="w-full sm:w-auto bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[2rem] text-xl font-black hover:bg-slate-50 transition-colors">
                Try Demo (Free Sample)
              </button>
            </div>

            <div className="mt-12 p-8 bg-amber-50 rounded-[2.5rem] border-l-[12px] border-amber-400 shadow-xl shadow-amber-900/5 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex gap-5 items-start">
                  <AlertCircle size={32} className="text-amber-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-lg font-black text-amber-900 mb-2 uppercase tracking-wide">Not Medical Advice — Informational Only</h4>
                    <p className="text-sm font-bold text-amber-800 leading-relaxed mb-4">
                      RxDecode is an AI-powered informational tool. It generates summaries to help you understand terminology. 
                      <span className="text-rose-600"> It does not diagnose, treat, or prescribe. Always consult a qualified physician.</span>
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-amber-200">
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-900/50 uppercase tracking-widest">
                        <Lock size={12} /> Files Deleted after 24h
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-900/50 uppercase tracking-widest">
                        <ShieldCheck size={12} /> India DPDP Compliant
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
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
          <div className="mt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-80 grayscale invert">
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
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">See It in Action</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">From Confusion to Clarity</h3>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Before Side */}
            <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                  <FileText size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">Before: Confusing Report</h4>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Medical Jargon & Numbers</p>
                </div>
              </div>
              <div className="flex-1 flex flex-center items-center justify-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-lg font-mono text-slate-600 text-center italic">
                  "HbA1c: 7.2%, LDL: 140 mg/dL, SGPT elevated..."
                </p>
              </div>
              <div className="mt-8 text-center">
                <p className="text-xs font-bold text-slate-400 italic">Example of a typical technical report.</p>
              </div>
            </div>

            {/* After Side */}
            <div className="bg-emerald-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-200 flex flex-col relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Zap size={28} className="fill-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black">After: Clear Decode</h4>
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest">Simple & Actionable Insights</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                    <ul className="space-y-4">
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Activity size={12} />
                        </div>
                        <p className="text-sm font-bold leading-tight">
                          <span className="block text-xs uppercase opacity-70 mb-0.5">Sugar Control:</span>
                          HbA1c 7.2% means moderate diabetes control—talk diet with doctor.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Heart size={12} />
                        </div>
                        <p className="text-sm font-bold leading-tight">
                          <span className="block text-xs uppercase opacity-70 mb-0.5">Cholesterol:</span>
                          LDL high; may need lifestyle changes or meds.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <Stethoscope size={12} />
                        </div>
                        <p className="text-sm font-bold leading-tight">
                          <span className="block text-xs uppercase opacity-70 mb-0.5">Liver:</span>
                          SGPT up—check for fatty liver causes.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-emerald-300">
                          <CheckCircle2 size={12} />
                        </div>
                        <p className="text-sm font-black leading-tight text-emerald-100">
                          <span className="block text-xs uppercase opacity-70 mb-0.5">Next Steps:</span>
                          Follow up in 3 months.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 text-center italic text-sm text-white/60">
                  Demo only. Real results vary by your upload.
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

      {/* About Section */}
      <section id="about" className="py-32 px-6 bg-slate-50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">About Us</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-8">Making Health Records Accessible to Everyone</h3>
              <p className="text-lg text-slate-700 font-bold leading-relaxed mb-6">
                RxDecode is built by <strong>Ratnakar Shukla</strong>, a startup founder from Prayagraj, Uttar Pradesh, passionate about making medical reports easy to understand for everyone.
              </p>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                Our mission is to decode complex prescriptions and lab results into simple English and Hindi explanations using state-of-the-art AI. No more confusion over medical jargon or technical numbers.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Heart size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-2">Our Mission</h4>
                  <p className="text-xs text-slate-500 font-bold">Bridging the gap between complex medical data and patient understanding.</p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
                    <ShieldCheck size={20} />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-2">The Team</h4>
                  <p className="text-xs text-slate-500 font-bold">Solo founder with AI and healthcare tech experience. Backed by secure Amazon hosting.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl"
            >
              <h4 className="text-2xl font-black text-slate-900 mb-8">Contact & Details</h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Email Information</p>
                    <a href="mailto:hello@rxdecode.com" className="text-lg font-bold text-slate-700 hover:text-primary transition-colors">hello@rxdecode.com</a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                    <Smartphone size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="text-lg font-bold text-slate-700">+91-8887374175</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 shrink-0">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-lg font-bold text-slate-700">Prayagraj, UP, India</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 pt-10 border-t border-slate-100 italic text-slate-400 text-sm">
                Domain registered March 2026. We're early-stage but committed to your trust and privacy.
              </div>
            </motion.div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Activity size={20} />
            </div>
            <span className="text-xl font-black tracking-tight">RxDecode</span>
          </div>

            <p className="text-slate-300 font-bold mb-6">
            &copy; 2026 RxDecode. All rights reserved. | 
            <Link to="/privacy" className="mx-2 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">Privacy</Link> | 
            <Link to="/terms" className="mx-2 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">Terms</Link> | 
            <Link to="/disclaimer" className="mx-2 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">Disclaimer</Link> | 
            <Link to="/about" className="mx-2 hover:text-white transition-colors underline underline-offset-4 decoration-white/20">About</Link> | 
            <a href="mailto:hello@rxdecode.com" className="mx-2 hover:text-white transition-colors">hello@rxdecode.com</a>
          </p>

          <p className="text-slate-400 font-bold text-sm tracking-widest uppercase flex flex-wrap justify-center gap-4">
            <span>AI-powered</span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span>Built in India</span>
            <span className="hidden sm:inline opacity-30">•</span>
            <span>Not medical advice</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
