import { motion } from 'motion/react';
import { User, MapPin, Mail, Phone, ShieldCheck, Heart, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#007BFF] rounded-lg flex items-center justify-center text-white">
               <span className="font-black">Rx</span>
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">RxDecode</span>
          </Link>
          <Link to="/" className="text-sm font-black text-slate-600 hover:text-[#007BFF] transition-colors">Back to Home</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-8">About RxDecode</h1>
            
            <div className="prose prose-slate max-w-none">
              <p className="text-xl text-slate-700 font-medium leading-relaxed mb-12">
                RxDecode was born out of a simple observation: medical reports are written for doctors, not patients. Our mission is to bridge that gap using Artificial Intelligence.
              </p>

              <div className="grid md:grid-cols-2 gap-12 mb-20">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                  <div className="w-12 h-12 bg-[#007BFF]/10 rounded-2xl flex items-center justify-center text-[#007BFF] mb-6">
                    <User size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4">The Founder</h2>
                  <p className="text-slate-600 font-bold leading-relaxed">
                    Built by <strong>Ratnakar Shukla</strong>, a startup founder from Prayagraj, Uttar Pradesh. With a background in AI and a passion for healthcare tech, Ratnakar is dedicated to making health information accessible to every Indian household.
                  </p>
                </div>

                <div className="bg-[#28A745]/5 p-8 rounded-[2.5rem] border border-[#28A745]/10">
                  <div className="w-12 h-12 bg-[#28A745]/10 rounded-2xl flex items-center justify-center text-[#28A745] mb-6">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-4">The Mission</h2>
                  <p className="text-slate-600 font-bold leading-relaxed">
                    To decode complex prescriptions and lab results into simple English and Hindi. We believe transparency in healthcare leads to better outcomes and less anxiety for families.
                  </p>
                </div>
              </div>

              <section className="mb-20">
                <h3 className="text-3xl font-black text-slate-900 mb-8">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-6 text-slate-700">
                  <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <Mail className="text-[#007BFF]" />
                    <a href="mailto:hello@rxdecode.com" className="font-bold hover:text-[#007BFF] transition-colors">hello@rxdecode.com</a>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <Phone className="text-[#28A745]" />
                    <span className="font-bold">+91-8887374175</span>
                  </div>
                  <div className="flex items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2">
                    <MapPin className="text-rose-500" />
                    <span className="font-bold">Prayagraj, Uttar Pradesh, India</span>
                  </div>
                </div>
              </section>

              <section className="p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black mb-4">Values & Trust</h3>
                  <p className="text-slate-300 font-medium mb-6">
                    Domain registered March 2026. We are an early-stage startup, but our commitment to your privacy is absolute. We use secure AWS hosting and state-of-the-art encryption to ensure your reports stay between you and the AI.
                  </p>
                  <div className="flex items-center gap-2 text-[#28A745] font-black text-sm uppercase tracking-widest">
                    <Heart size={16} fill="currentColor" />
                    <span>Built with care in India</span>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#007BFF]/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
              </section>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="bg-slate-900 text-white py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center text-slate-300 text-sm font-bold">
           &copy; 2026 RxDecode. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
