import { motion } from 'motion/react';
import { ShieldCheck, ArrowLeft, Lock, Trash2, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
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
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <ShieldCheck size={28} />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-12 mb-12">
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-4 flex items-center gap-3">
                  <Lock className="text-[#007BFF]" size={24} />
                  Patient Privacy First
                </h2>
                <p className="text-lg font-medium text-slate-600 leading-relaxed mb-6">
                  At RxDecode, we understand that medical data is the most sensitive information you own. Our privacy framework is built on the principle of minimal data retention.
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-700 font-black text-sm uppercase tracking-widest mb-2">
                      <Trash2 size={16} />
                      24h Auto-Delete
                    </div>
                    <p className="text-xs font-bold text-emerald-800/80">Every medical report you upload is automatically permanently deleted from our servers within 24 hours of analysis.</p>
                  </div>
                  <div className="p-6 bg-[#007BFF]/5 rounded-2xl border border-[#007BFF]/10">
                    <div className="flex items-center gap-2 text-[#007BFF] font-black text-sm uppercase tracking-widest mb-2">
                      <Scale size={16} />
                      DPDP Compliant
                    </div>
                    <p className="text-xs font-bold text-[#007BFF]/80">We strictly adhere to India's Data Protection and Digital Privacy (DPDP) Act guidelines.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4">1. Data We Collect</h3>
                <ul className="list-disc pl-5 space-y-2 font-medium text-slate-600">
                  <li><strong>Medical Reports:</strong> Temporarily stored for processing and analysis.</li>
                  <li><strong>Basic Profile:</strong> Name and email used for your personal dashboard.</li>
                  <li><strong>Usage Data:</strong> Anonymous logs to improve our AI interpretation accuracy.</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4">2. How We Use Data</h3>
                <p className="font-medium text-slate-600 leading-relaxed">
                  The primary use of your data is for AI interpretation. We **never** sell your healthcare data to third parties, insurance companies, or pharmaceutical marketing agencies.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4">3. Security Measures</h3>
                <p className="font-medium text-slate-600 leading-relaxed">
                  We use bank-grade AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our infrastructure is hosted on secure AWS (Amazon Web Services) clusters in controlled environments.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-900 mb-4">4. Your Rights</h3>
                <p className="font-medium text-slate-600 leading-relaxed">
                  Under DPDP, you have the right to request deletion of your account and all associated data at any time. Since medical reports are deleted every 24h, we typically do not store your historical health data unless you explicitly save it to your local dashboard.
                </p>
              </section>
            </div>

            <p className="text-center text-slate-400 text-sm font-bold">
              Questions about privacy? Email us at <a href="mailto:hello@rxdecode.com" className="text-[#007BFF]">hello@rxdecode.com</a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
