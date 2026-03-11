import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Pill, FileText, Plus, ChevronRight, Activity, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const reportsQuery = query(
      collection(db, 'reports'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc'),
      limit(3)
    );

    const medsQuery = query(
      collection(db, 'medicines'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const unsubReports = onSnapshot(reportsQuery, (snapshot) => {
      setRecentReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMeds = onSnapshot(medsQuery, (snapshot) => {
      setMedicines(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubReports();
      unsubMeds();
    };
  }, [user]);

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
        <Link to="/scan" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Camera size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Scan Prescription</span>
        </Link>
        <Link to="/scan" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
            <Plus size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Upload Report</span>
        </Link>
        <Link to="/reports" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
            <FileText size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Medical History</span>
        </Link>
        <Link to="/reports" className="card flex flex-col items-center justify-center gap-3 py-6 hover:bg-secondary/30 transition-colors group">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
            <Pill size={24} />
          </div>
          <span className="text-sm font-bold text-slate-700 text-center">Medicine Guide</span>
        </Link>
      </section>

      {/* Latest Report Analysis */}
      {latestReport && (
        <section className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-slate-800">Latest Analysis</h3>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-primary text-white border-none p-6 relative overflow-hidden"
          >
            <div className="relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Recent Scan</span>
              <h4 className="text-xl font-bold mt-1 capitalize">{latestReport.report_type?.replace('_', ' ') || latestReport.type?.replace('_', ' ')}</h4>
              <p className="text-sm mt-2 line-clamp-2 opacity-90">
                {latestReport.summary || "No summary available for this report."}
              </p>
              <Link to="/reports" className="inline-flex items-center gap-2 text-sm font-bold mt-4 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors">
                View Details <ChevronRight size={16} />
              </Link>
            </div>
            <FileText className="absolute -right-4 -bottom-4 text-white/10" size={120} />
          </motion.div>
        </section>
      )}

      {/* Medicine Reminders */}
      <section className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Medicine Reminders</h3>
          <span className="text-primary text-xs font-bold bg-secondary px-2 py-1 rounded-md">Today</span>
        </div>
        {medicines.length === 0 ? (
          <div className="card text-center py-8 border-dashed">
            <Pill className="mx-auto text-slate-300 mb-2" size={40} />
            <p className="text-slate-500 text-sm">No active medicines found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {medicines.map((med) => (
              <motion.div 
                key={med.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="card flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                  <Pill size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800">{med.name}</h4>
                  <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center text-slate-300">
                  <Plus size={16} />
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
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-primary">
                  <FileText size={20} />
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
