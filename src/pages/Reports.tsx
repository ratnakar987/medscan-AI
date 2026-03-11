import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { FileText, ChevronRight, Search, Filter, Calendar } from 'lucide-react';
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
            <div className="flex-1">
              <h4 className="font-bold capitalize">{report.type.replace('_', ' ')}</h4>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                <Calendar size={12} />
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

                <div className="prose prose-slate max-w-none">
                  <h4 className="text-lg font-bold mb-3">Raw OCR Text</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl text-sm font-mono whitespace-pre-wrap mb-6">
                    {selectedReport.ocr_text || 'No OCR text available.'}
                  </div>

                  <h4 className="text-lg font-bold mb-3">AI Analysis</h4>
                  <div className="bg-slate-50 p-4 rounded-2xl text-sm leading-relaxed">
                    <div className="flex flex-col gap-4">
                      {/* Summary */}
                      <div>
                        <p className="font-bold text-primary mb-1">Summary</p>
                        <p>{selectedReport.summary || JSON.parse(selectedReport.analysis || '{}').summary}</p>
                      </div>

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
