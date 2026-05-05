import { motion } from 'motion/react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-white pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-black text-slate-400 hover:text-primary transition-colors mb-12 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
              <ShieldAlert size={28} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Medical Disclaimer</h1>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-2xl mb-12 shadow-sm">
            <p className="text-amber-900 font-black leading-relaxed">
              Last Updated: May 5, 2026
            </p>
          </div>

          <div className="space-y-8 text-slate-700 leading-relaxed">
            <p className="text-lg font-bold">
              RxDecode provides AI-generated summaries and explanations of medical reports for informational and educational purposes only. It is <span className="text-rose-600">not a substitute for professional medical advice, diagnosis, or treatment</span>.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 mt-1">1</div>
                <p className="font-medium">We are not doctors, healthcare providers, or licensed medical professionals.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 mt-1">2</div>
                <p className="font-medium">Do not use RxDecode to make health decisions—always consult a qualified physician.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 mt-1">3</div>
                <p className="font-medium">AI analysis may contain errors; verify with your doctor.</p>
              </div>
              <div className="flex gap-4">
                <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0 mt-1">4</div>
                <p className="font-medium">RxDecode assumes no liability for any use or misuse of its outputs.</p>
              </div>
            </div>

            <p className="pt-8 border-t border-slate-100 italic font-medium text-slate-500">
              By using this site, you agree to these terms and take full responsibility for your health choices.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
