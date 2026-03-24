import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, deleteObject } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { FileText, ChevronRight, Search, Filter, Calendar, Trash2, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InterpretationView from '../components/InterpretationView';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reports'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid needing a composite index
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setReports(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
    });

    return unsub;
  }, [user]);

  const filteredReports = reports.filter(r => {
    const diagnosis = r.analysis?.potential_diagnosis_guess || 'Medical Report';
    const summary = r.analysis?.holistic_summary || r.summary || '';
    return diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
           summary.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (report: any) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'reports', report.id));
      
      // 2. Delete from Storage if URL exists
      if (report.fileUrl) {
        const storageRef = ref(storage, report.fileUrl);
        await deleteObject(storageRef).catch(err => console.error('Storage delete error:', err));
      }
      
      setSelectedReport(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `reports/${report.id}`);
    }
  };

  const handleDownload = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Medical History</h2>
          <p className="text-slate-500 font-bold text-sm">All your scans in one place.</p>
        </div>
        <div className="bg-white p-3 rounded-2xl text-primary shadow-sm border border-slate-100">
          <Filter size={20} />
        </div>
      </div>

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by diagnosis or summary..."
          className="w-full bg-white border-none rounded-[2rem] py-5 pl-14 pr-6 text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-4">
        {filteredReports.map((report) => (
          <motion.div
            key={report.id}
            layoutId={report.id}
            onClick={() => setSelectedReport(report)}
            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all group"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
              <FileText size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                  {report.type?.replace('_', ' ') || 'Report'}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {report.createdAt?.toDate().toLocaleDateString()}
                </span>
              </div>
              <h4 className="text-lg font-black text-slate-800 truncate">
                {report.analysis?.potential_diagnosis_guess || report.fileName || 'Medical Report'}
              </h4>
              <p className="text-xs text-slate-500 font-bold line-clamp-1 mt-1 opacity-80">
                {report.analysis?.holistic_summary || report.summary || 'No summary available'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <ChevronRight size={24} />
            </div>
          </motion.div>
        ))}

        {filteredReports.length === 0 && (
          <div className="text-center py-20">
            <FileText className="mx-auto text-slate-200 mb-4" size={64} />
            <p className="text-slate-500">No reports found matching your search.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-slate-50 w-full max-w-2xl rounded-t-[3rem] sm:rounded-[3rem] max-h-[95vh] overflow-y-auto shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                      {selectedReport.type?.replace('_', ' ') || 'Report'}
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {selectedReport.createdAt?.toDate().toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">
                    {selectedReport.analysis?.potential_diagnosis_guess || selectedReport.fileName || 'Medical Report'}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-100 p-3 rounded-2xl text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <ChevronRight size={24} className="rotate-90" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-8">
                {selectedReport.fileUrl && (
                  <div className="relative group">
                    <img 
                      src={selectedReport.fileUrl} 
                      alt="Report Scan" 
                      className="w-full rounded-[2rem] border-4 border-white shadow-xl"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center">
                      <button 
                        onClick={() => handleDownload(selectedReport.fileUrl)}
                        className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm shadow-xl flex items-center gap-2"
                      >
                        <ExternalLink size={18} /> View Original
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    onClick={() => handleDelete(selectedReport)}
                    className="flex-1 bg-rose-50 text-rose-600 rounded-2xl font-black flex items-center justify-center gap-2 py-4 hover:bg-rose-100 transition-colors text-sm"
                  >
                    <Trash2 size={18} /> Delete Report
                  </button>
                </div>

                <div className="bg-white rounded-[2.5rem] p-2 shadow-sm border border-slate-100">
                  <InterpretationView report={selectedReport} />
                </div>
                
                <div className="bg-slate-200/50 p-6 rounded-[2rem] text-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                    Disclaimer: This analysis is AI-generated and should not replace professional medical advice. Always consult with a doctor.
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

export default Reports;
