import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, deleteObject } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';
import { FileText, ChevronRight, Search, Filter, Calendar, Trash2, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'reports'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsub;
  }, [user]);

  const filteredReports = reports.filter(r => 
    r.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.analysis && r.analysis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (report: any) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      // 1. Delete from Firestore
      await deleteDoc(doc(db, 'reports', report.id));
      
      // 2. Delete from Storage if URL exists
      if (report.imageUrl) {
        const storageRef = ref(storage, report.imageUrl);
        await deleteObject(storageRef).catch(err => console.error('Storage delete error:', err));
      }
      
      setSelectedReport(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete report.');
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
              <h4 className="font-bold capitalize truncate">{report.type.replace('_', ' ')}</h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {report.summary || 'No summary available'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                <Calendar size={10} />
                {report.created_at?.toDate().toLocaleDateString()}
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
                  <h3 className="text-xl font-bold capitalize">{selectedReport.type.replace('_', ' ')}</h3>
                  <p className="text-slate-500 text-sm">{selectedReport.created_at?.toDate().toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="bg-slate-100 p-2 rounded-full text-slate-500"
                >
                  <ChevronRight size={20} className="rotate-90" />
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <img 
                  src={selectedReport.imageUrl} 
                  alt="Report Scan" 
                  className="w-full rounded-2xl border border-slate-100"
                />

                <div className="flex gap-3">
                  <button 
                    onClick={() => handleDownload(selectedReport.imageUrl)}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3"
                  >
                    <Download size={18} /> Download
                  </button>
                  <button 
                    onClick={() => handleDelete(selectedReport)}
                    className="flex-1 bg-red-50 text-red-500 rounded-xl font-medium flex items-center justify-center gap-2 py-3 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={18} /> Delete
                  </button>
                </div>

                <div className="prose prose-slate max-w-none">
                  {/* Prominent Summary Section */}
                  <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl mb-6 shadow-sm">
                    <h4 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
                      <FileText size={20} /> Prescription Summary
                    </h4>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {selectedReport.summary || JSON.parse(selectedReport.analysis || '{}').summary || 'No summary available.'}
                    </p>
                  </div>

                  <h4 className="text-lg font-bold mb-3">AI Analysis & Insights</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl text-sm leading-relaxed">
                    <div className="flex flex-col gap-4">
                      {/* Detailed AI Analysis */}
                      {selectedReport.ai_analysis && (
                        <div>
                          <p className="font-bold text-primary mb-1">Detailed Explanation</p>
                          <div className="prose prose-sm max-w-none">
                            <ReactMarkdown>{selectedReport.ai_analysis}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      
                      {/* Medicines */}
                      {((selectedReport.medicine_list && selectedReport.medicine_list.length > 0) || (JSON.parse(selectedReport.analysis || '{}').medicines)) && (
                        <div>
                          <p className="font-bold text-primary mb-2">Medicines</p>
                          <div className="flex flex-col gap-2">
                            {(selectedReport.medicine_list || JSON.parse(selectedReport.analysis || '{}').medicines || []).map((m: any, i: number) => (
                              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100">
                                <p className="font-bold">{m.name}</p>
                                <p className="text-xs text-slate-500">{m.dosage} • {m.timing || m.frequency}</p>
                                <p className="text-xs mt-1 italic">{m.purpose}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lab Results */}
                      {((selectedReport.lab_results && selectedReport.lab_results.length > 0) || (JSON.parse(selectedReport.analysis || '{}').labResults)) && (
                        <div>
                          <p className="font-bold text-primary mb-2">Lab Results</p>
                          <div className="flex flex-col gap-2">
                            {(selectedReport.lab_results || JSON.parse(selectedReport.analysis || '{}').labResults || []).map((r: any, i: number) => (
                              <div key={i} className="bg-white p-3 rounded-xl border border-slate-100">
                                <div className="flex justify-between">
                                  <p className="font-bold">{r.parameter || r.testName}</p>
                                  <p className={(r.is_abnormal || r.interpretation?.toLowerCase().includes('high') || r.interpretation?.toLowerCase().includes('low')) ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>
                                    {r.value}
                                  </p>
                                </div>
                                {r.referenceRange && <p className="text-xs text-slate-500">Ref: {r.referenceRange}</p>}
                                <p className="text-xs mt-1">{r.explanation || r.interpretation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations (Legacy) */}
                      {JSON.parse(selectedReport.analysis || '{}').recommendations && (
                        <div>
                          <p className="font-bold text-primary mb-1">Recommendations</p>
                          <ul className="list-disc pl-4">
                            {JSON.parse(selectedReport.analysis || '{}').recommendations.map((rec: string, i: number) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <h4 className="text-lg font-bold mt-8 mb-3 text-slate-400">Raw OCR Text</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl text-xs font-mono whitespace-pre-wrap mb-6 text-slate-500 border border-slate-100">
                    {selectedReport.ocr_text || 'No OCR text available.'}
                  </div>
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
