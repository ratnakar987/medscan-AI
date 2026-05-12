import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Pill, Search, ChevronRight, Info, AlertTriangle, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Medicines: React.FC = () => {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState<any[]>([]);
  const [selectedMed, setSelectedMed] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'medicines'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      
      // Sort in memory to avoid needing a composite index
      meds.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      // Deduplicate by name
      const uniqueMeds = meds.reduce((acc: any[], current: any) => {
        const x = acc.find(item => item.medicine_name.toLowerCase() === current.medicine_name.toLowerCase());
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
      setMedicines(uniqueMeds);
    });

    return unsub;
  }, [user]);

  const filteredMeds = medicines.filter(m => 
    m.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.use.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 py-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Medicine Vault</h1>
          <p className="text-slate-500 font-bold">Track and understand your prescriptions.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-[#007BFF]/10 p-4 rounded-2xl text-[#007BFF]">
            <Pill size={32} />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#007BFF] transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search your medicines..."
          className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007BFF] focus:bg-white rounded-[2rem] py-5 pl-14 pr-6 outline-none transition-all font-bold text-slate-700 shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMeds.map((med) => (
          <motion.div
            key={med.id}
            layoutId={med.id}
            onClick={() => setSelectedMed(med)}
            className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-[#007BFF]/30 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex items-center gap-5"
          >
            <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-[#007BFF]/5 group-hover:text-[#007BFF] transition-colors">
              <Pill size={28} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-xl text-slate-900 mb-1">{med.medicine_name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest line-clamp-1">{med.use}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:bg-[#007BFF] group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </motion.div>
        ))}

        {filteredMeds.length === 0 && (
          <div className="col-span-full text-center py-32 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6 shadow-sm">
              <Pill size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No medicines found</h3>
            <p className="text-slate-500 font-bold">Medicines from your reports will appear here automatically.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedMed(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-8 pb-0 flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-[#007BFF]/10 p-4 rounded-2xl text-[#007BFF]">
                    <Pill size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{selectedMed.medicine_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#28A745]"></span>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Insight</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMed(null)}
                  className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight size={24} className="rotate-90 pointer-events-none" />
                </button>
              </div>

              <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                {/* Purpose */}
                <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Info size={14} className="text-[#007BFF]" /> Primary Purpose
                  </h4>
                  <p className="text-lg font-bold text-slate-700 leading-relaxed">
                    {selectedMed.use}
                  </p>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-2">Dosage</p>
                    <p className="text-xl font-black text-blue-900">{selectedMed.dosage}</p>
                  </div>
                  <div className="p-6 bg-[#28A745]/5 rounded-[2rem] border border-[#28A745]/10">
                    <p className="text-[10px] font-black uppercase text-[#28A745] tracking-widest mb-2">Timing</p>
                    <p className="text-xl font-black text-slate-900">{selectedMed.timing || 'As prescribed'}</p>
                  </div>
                </div>

                {/* Side Effects */}
                <div className="bg-amber-50/50 p-6 rounded-[2rem] border border-amber-100">
                  <h4 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} /> Safety Observations
                  </h4>
                  <p className="text-sm font-bold text-amber-900/80 leading-relaxed">
                    {selectedMed.side_effects || selectedMed.simple_explanation || 'No unusual side effects detected for this profile.'}
                  </p>
                </div>

                {/* General Advice */}
                <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Activity size={14} /> Usage Protocol
                  </h4>
                  <ul className="text-sm font-bold text-emerald-900/70 space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                      Always take with lukewarm water unless specified otherwise.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                      Do not stop treatment abruptly without consulting a physician.
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></div>
                      Store in a cool, dry place away from direct sunlight.
                    </li>
                  </ul>
                </div>

                <div className="pt-4 text-center">
                  <p className="text-[10px] text-slate-400 font-black italic uppercase tracking-widest leading-loose">
                    This is an AI summary. <br /> Always cross-verify with your physical prescription.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Medicines;
