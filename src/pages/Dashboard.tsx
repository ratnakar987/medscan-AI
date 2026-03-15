import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Pill, FileText, Plus, ChevronRight, Activity, Camera, Heart, Scan as ScanIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const reportsQuery = query(
      collection(db, 'reports'),
      where('user_id', '==', user.uid),
      limit(10) // Get a few more to sort in memory
    );

    const medsQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', user.uid),
      limit(10) // Get a few more to sort in memory
    );

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid needing a composite index
      docs.sort((a: any, b: any) => {
        const timeA = a.created_at?.toMillis?.() || a.created_at?.seconds || 0;
        const timeB = b.created_at?.toMillis?.() || b.created_at?.seconds || 0;
        return timeB - timeA;
      });
      setRecentReports(docs.slice(0, 3));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reports');
    });

    const unsubMeds = onSnapshot(medsQuery, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory to avoid needing a composite index
      docs.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setMedicines(docs.slice(0, 5));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'medicines');
    });

    return () => {
      unsubReports();
      unsubMeds();
    };
  }, [user]);

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'prescription': return <Pill size={20} />;
      case 'lab_report': return <Activity size={20} />;
      case 'imaging_report': return <ScanIcon size={20} />;
      case 'ecg': return <Heart size={20} />;
      case 'raw_medical_image': return <ScanIcon size={20} />;
      default: return <FileText size={20} />;
    }
  };

  const getReportColor = (type: string) => {
    switch (type) {
      case 'prescription': return 'bg-emerald-50 text-emerald-600';
      case 'lab_report': return 'bg-blue-50 text-blue-600';
      case 'imaging_report': return 'bg-purple-50 text-purple-600';
      case 'ecg': return 'bg-rose-50 text-rose-600';
      case 'raw_medical_image': return 'bg-indigo-50 text-indigo-600';
      default: return 'bg-secondary text-primary';
    }
  };

  const latestReport = recentReports[0];

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Top Section */}
      <section className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {user?.displayName?.split(' ')[0] || 'User'}</h2>
          <p className="text-slate-500 text-sm">Your health at a glance</p>
        </div>
        <Link to="/profile" className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-primary border-2 border-white shadow-sm overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <Activity size={24} />
          )}
        </Link>
      </section>

      {/* Main Action Buttons */}
      <section className="grid grid-cols-2 gap-4">
        <Link to="/scan?type=prescription" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group border-emerald-100 bg-emerald-50/30">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform shadow-sm">
            <Pill size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Scan Prescription</span>
        </Link>
        <Link to="/scan?type=lab_report" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group border-blue-100 bg-blue-50/30">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shadow-sm">
            <Activity size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Scan Lab Report</span>
        </Link>
        <Link to="/reports" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Medical History</span>
        </Link>
        <Link to="/medicines" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
            <Pill size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Medicine Guide</span>
        </Link>
      </section>

      {/* Latest Report Analysis */}
      {latestReport && (
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Medical Insights</h3>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">AI Powered</span>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none p-6 relative overflow-hidden shadow-xl"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${getReportColor(latestReport.report_type || latestReport.type)} bg-opacity-20`}>
                  {getReportIcon(latestReport.report_type || latestReport.type)}
                </div>
                <h4 className="text-lg font-bold capitalize">{latestReport.report_type?.replace('_', ' ') || latestReport.type?.replace('_', ' ')}</h4>
              </div>
              <p className="text-sm leading-relaxed opacity-90 font-medium">
                {latestReport.summary || "No summary available for this report."}
              </p>
              
              {latestReport.main_findings && latestReport.main_findings.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {latestReport.main_findings.slice(0, 2).map((finding: string, i: number) => (
                    <span key={i} className="text-[10px] bg-white/10 border border-white/20 px-2 py-1 rounded-md">
                      {finding}
                    </span>
                  ))}
                </div>
              )}

              <Link to={`/reports`} className="inline-flex items-center gap-2 text-xs font-bold mt-6 text-primary-foreground/80 hover:text-white transition-colors">
                View Full Analysis <ChevronRight size={14} />
              </Link>
            </div>
            <Activity className="absolute -right-8 -bottom-8 text-white/5" size={160} />
          </motion.div>
        </section>
      )}

      {/* Medicine Extraction Dashboard */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Medicine Guide</h3>
          <Link to="/medicines" className="text-primary text-sm font-bold">Manage All</Link>
        </div>
        {medicines.length === 0 ? (
          <div className="card text-center py-10 border-dashed bg-slate-50/50">
            <Pill className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-500 text-sm font-medium">No medicines extracted yet</p>
            <p className="text-slate-400 text-xs mt-1">Scan a prescription to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {medicines.map((med) => (
              <motion.div 
                key={med.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="card flex items-center gap-4 hover:shadow-md transition-all border-l-4 border-l-blue-500 py-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner">
                  <Pill size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-800 leading-tight">{med.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{med.timing || med.frequency}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{med.dosage}</p>
                  {med.purpose && (
                    <p className="text-[10px] text-blue-500 mt-1 font-bold bg-blue-50 inline-block px-2 py-0.5 rounded">
                      {med.purpose}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Scans */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Recent Scans</h3>
          <Link to="/reports" className="text-primary text-sm font-bold">See All</Link>
        </div>
        
        {recentReports.length === 0 ? (
          <div className="card text-center py-8 border-dashed">
            <FileText className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-500 text-sm">No reports scanned yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentReports.map((report) => (
              <motion.div 
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getReportColor(report.report_type || report.type)}`}>
                  {getReportIcon(report.report_type || report.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 capitalize text-sm">{report.report_type?.replace('_', ' ') || report.type?.replace('_', ' ')}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {report.created_at?.toDate().toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className="text-slate-300" size={20} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
