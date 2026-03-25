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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medicine Guide</h1>
        <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
          <Pill size={20} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search medicines..."
          className="input-field pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredMeds.map((med) => (
          <motion.div
            key={med.id}
            layoutId={med.id}
            onClick={() => setSelectedMed(med)}
            className="card flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="bg-blue-50 p-3 rounded-xl">
              <Pill className="text-blue-500" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{med.medicine_name}</h3>
              <p className="text-xs text-slate-500 line-clamp-1">{med.use}</p>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
          </motion.div>
        ))}

        {filteredMeds.length === 0 && (
          <div className="text-center py-20">
            <Pill className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-500">No medicines found in your history.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedMed(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-3 rounded-2xl text-blue-500">
                    <Pill size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedMed.medicine_name}</h3>
                    <p className="text-slate-500 text-sm">Medicine Details</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMed(null)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500"
                >
                  <ChevronRight size={20} className="rotate-90" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                    <Info size={18} />
                    <span>Purpose / Use</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedMed.use}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="card bg-slate-50 border-none p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Dosage</p>
                    <p className="font-bold text-slate-800">{selectedMed.dosage}</p>
                  </div>
                  <div className="card bg-slate-50 border-none p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Frequency</p>
                    <p className="font-bold text-slate-800">{selectedMed.frequency || 'As prescribed'}</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600 font-bold mb-2">
                    <AlertTriangle size={18} />
                    <span>Common Side Effects</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-sm">
                    {selectedMed.side_effects}
                  </p>
                </div>

                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold mb-2">
                    <Activity size={18} />
                    <span>Safety Advice</span>
                  </div>
                  <ul className="text-sm text-slate-700 space-y-2 list-disc pl-4">
                    <li>Take exactly as prescribed by your doctor.</li>
                    <li>Do not skip doses or stop early.</li>
                    <li>Inform your doctor if side effects persist.</li>
                    <li>Keep out of reach of children.</li>
                  </ul>
                </div>

                <p className="text-[10px] text-slate-400 italic text-center">
                  Disclaimer: This information is AI-generated based on your prescription. Always follow your doctor's specific instructions.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Medicines;
