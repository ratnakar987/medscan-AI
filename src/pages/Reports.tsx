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
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Reports</h2>
        <div className="bg-secondary p-2 rounded-xl text-primary">
          <Filter size={20} />
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search reports..."
          className="input-field pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {filteredReports.map((report) => (
          <motion.div
            key={report.id}
            layoutId={report.id}
            onClick={() => setSelectedReport(report)}
            className="card flex items-center gap-4 cursor-pointer active:scale-95 transition-transform"
          >
            <div className="bg-secondary p-3 rounded-xl">
              <FileText className="text-primary" size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold capitalize truncate">
                {report.analysis?.potential_diagnosis_guess || report.fileName || 'Medical Report'}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {report.analysis?.holistic_summary || report.summary || 'No summary available'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                <Calendar size={10} />
                {report.createdAt?.toDate().toLocaleDateString()}
              </div>
            </div>
            <ChevronRight className="text-slate-300" size={20} />
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
              className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold capitalize">
                    {selectedReport.analysis?.potential_diagnosis_guess || selectedReport.fileName || 'Medical Report'}
                  </h3>
                  <p className="text-slate-500 text-sm">{selectedReport.createdAt?.toDate().toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500"
                >
                  <ChevronRight size={20} className="rotate-90" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                {selectedReport.fileUrl && (
                  <img 
                    src={selectedReport.fileUrl} 
                    alt="Report Scan" 
                    className="w-full rounded-2xl border border-slate-100"
                  />
                )}

                <div className="flex gap-3">
                  {selectedReport.fileUrl && (
                    <button 
                      onClick={() => handleDownload(selectedReport.fileUrl)}
                      className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
                    >
                      <Download size={18} /> Download
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(selectedReport)}
                    className="flex-1 bg-red-50 text-red-500 rounded-xl font-medium flex items-center justify-center gap-2 py-3 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>

                <div className="mt-4">
                  <InterpretationView report={selectedReport} />
                </div>
                
                <p className="text-[10px] text-slate-400 italic text-center">
                  Disclaimer: This analysis is AI-generated and should not replace professional medical advice. Always consult with a doctor.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
