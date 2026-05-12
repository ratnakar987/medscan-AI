import { motion } from 'motion/react';
import { FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#007BFF] rounded-lg flex items-center justify-center text-white font-black">
               Rx
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">RxDecode</span>
          </Link>
          <Link to="/" className="text-sm font-black text-slate-600 hover:text-[#007BFF] transition-colors">Back to Home</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-slate-700">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-12">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900">
                <FileText size={28} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Terms of Service</h1>
            </div>

            <div className="space-y-12 mb-20 leading-relaxed font-medium text-slate-600">
              <section className="p-8 bg-rose-50 border-l-4 border-rose-500 rounded-2xl">
                <h2 className="text-xl font-black text-rose-900 mb-4">CRITICAL NOTICE</h2>
                <p className="text-rose-800">
                  By using RxDecode, you explicitly acknowledge that you are using an AI-based informational tool. RxDecode is NOT a doctor, NOT a hospital, and CANNOT provide a clinical diagnosis or treatment advice.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <div className="w-2 h-8 bg-[#007BFF] rounded-full" />
                   1. Acceptance of Terms
                </h3>
                <p>
                  By accessing or using RxDecode ("the Platform"), you agree to be bound by these Terms. If you do not agree, you must immediately cease all use of the platform.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <div className="w-2 h-8 bg-[#007BFF] rounded-full" />
                   2. Scope of Service
                </h3>
                <p className="mb-4">
                  RxDecode provides an AI-driven interpretation of medical reports. This service is for:
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-[#28A745] mt-1 shrink-0" /> Educational understanding of medical jargon.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-[#28A745] mt-1 shrink-0" /> Visualizing trends in health data.</li>
                  <li className="flex items-start gap-2"><CheckCircle2 size={18} className="text-[#28A745] mt-1 shrink-0" /> Preparing questions for your medical doctor.</li>
                </ul>
                <p className="font-black text-slate-900 italic">
                  It is NEVER to be used for emergency medical situations. Call your local emergency number (102/108 in India) for emergencies.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <div className="w-2 h-8 bg-[#007BFF] rounded-full" />
                   3. User Identity
                </h3>
                <p>
                  You agree to provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <div className="w-2 h-8 bg-[#007BFF] rounded-full" />
                   4. Limitation of Liability
                </h3>
                <p>
                  RxDecode, its founder Ratnakar Shukla, and associated partners shall not be held liable for any decisions made based on the AI output. You take full responsibility for consulting a licensed medical professional before acting on any insights provided here.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                   <div className="w-2 h-8 bg-[#007BFF] rounded-full" />
                   5. Modifications
                </h3>
                <p>
                  We reserve the right to modify or discontinue the service at any time without prior notice.
                </p>
              </section>
            </div>

            <div className="text-center pt-12 border-t border-slate-100">
               <p className="text-sm font-bold text-slate-500">Copyright © 2026 RxDecode. All rights reserved.</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
