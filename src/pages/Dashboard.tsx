import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Pill, FileText, Plus, ChevronRight, Activity, Camera, Heart, Scan as ScanIcon, Zap } from 'lucide-react';
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
      where('userId', '==', user.uid),
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
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Hello, {user?.displayName?.split(' ')[0] || 'User'}</h1>
          <p className="text-slate-500 font-bold text-sm">Your health dashboard is ready.</p>
        </div>
        <Link to="/profile" className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-primary border-4 border-white shadow-xl overflow-hidden">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          ) : (
            <Activity size={28} />
          )}
        </Link>
      </section>

      {/* Pro Plan Banner */}
      <section className="bg-gradient-to-r from-primary to-emerald-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-4">
            <Zap size={12} className="fill-white" />
            <span>Limited Time Offer</span>
          </div>
          <h3 className="text-2xl font-black mb-2">Upgrade to RXDecode Pro</h3>
          <p className="text-white/80 text-sm font-bold mb-6 max-w-[200px]">Get unlimited reports, detailed diet plans, and PDF downloads.</p>
          <button className="bg-white text-primary px-6 py-3 rounded-2xl text-sm font-black shadow-xl shadow-black/10 hover:scale-105 transition-transform active:scale-95">
            Upgrade Now
          </button>
        </div>
        <Activity className="absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-700" size={200} />
      </section>

      {/* Main Action Buttons */}
      <section className="grid grid-cols-2 gap-4">
        <Link to="/scan?type=lab_report" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:border-primary/20 transition-all group">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Activity size={32} />
          </div>
          <span className="text-sm font-black text-slate-800">Scan Report</span>
        </Link>
        <Link to="/scan?type=prescription" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-4 hover:shadow-xl hover:border-emerald-500/20 transition-all group">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
            <Pill size={32} />
          </div>
          <span className="text-sm font-black text-slate-800">Scan Prescription</span>
        </Link>
      </section>

      {/* Health Status Overview */}
      {latestReport && (
        <section className="flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Health Status</h3>
            <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest">Live Analysis</span>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden ${
              latestReport.analysis?.overall_health_status === 'Critical' ? 'bg-rose-600' :
              latestReport.analysis?.overall_health_status === 'Attention Needed' ? 'bg-amber-500' :
              'bg-emerald-600'
            }`}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Heart size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Overall Status</p>
                  <h4 className="text-2xl font-black">{latestReport.analysis?.overall_health_status || 'Stable'}</h4>
                </div>
              </div>
              <p className="text-sm font-bold leading-relaxed opacity-90 mb-8 line-clamp-2">
                {latestReport.analysis?.holistic_summary || "No summary available for this report."}
              </p>
              <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-black bg-white/20 px-6 py-3 rounded-2xl hover:bg-white/30 transition-all">
                View Full Details <ChevronRight size={18} />
              </Link>
            </div>
            <Activity className="absolute -right-12 -bottom-12 text-white/5" size={240} />
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
                    <h4 className="font-bold text-slate-800 leading-tight">{med.medicine_name}</h4>
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
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getReportColor(report.type)}`}>
                  {getReportIcon(report.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 capitalize text-sm">{report.type?.replace('_', ' ')}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {report.createdAt?.toDate().toLocaleDateString()}
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
