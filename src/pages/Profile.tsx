import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut, updateProfile as updateAuthProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Bell, HelpCircle, LogOut, ChevronRight, Heart, Phone, Edit2, Check, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserData(data);
            setEditData(data);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        displayName: editData.displayName || '',
        age: parseInt(editData.age) || 0,
        gender: editData.gender || 'male',
        phone: editData.phone || '',
      });
      
      if (editData.displayName !== user.displayName) {
        await updateAuthProfile(user, { displayName: editData.displayName });
      }
      
      setUserData(editData);
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const menuItems = [
    { icon: Shield, label: 'Privacy & Security', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Bell, label: 'Notifications', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Heart, label: 'Health Profile', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-[#007BFF] border-[6px] border-white shadow-2xl overflow-hidden transition-transform group-hover:scale-105 duration-500">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <User size={64} className="opacity-20" />
              )}
            </div>
            <button className="absolute -bottom-2 -right-2 bg-[#007BFF] text-white p-3 rounded-2xl border-4 border-white shadow-lg motion-safe:hover:scale-110 active:scale-95 transition-all">
              <Edit2 size={16} />
            </button>
          </div>
          
          <div className="text-center mt-8 w-full max-w-sm">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col gap-4"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Full Name</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[#007BFF] focus:bg-white rounded-2xl py-4 px-6 text-center font-black text-slate-900 outline-none transition-all shadow-sm"
                      value={editData.displayName}
                      onChange={e => setEditData({...editData, displayName: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-[#28A745] text-white py-4 rounded-2xl font-black shadow-lg shadow-[#28A745]/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] active:translate-y-0 transition-all"
                    >
                      {saving ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />} Save Changes
                    </button>
                    <button 
                      onClick={() => { setIsEditing(false); setEditData(userData); }}
                      className="flex-1 bg-slate-100 text-slate-500 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors"
                    >
                      <X size={20} /> Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-center gap-3">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">{userData?.displayName || user?.displayName || 'User'}</h1>
                    <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#007BFF]/5 text-[#007BFF] hover:bg-[#007BFF]/10 transition-colors">
                      <Edit2 size={14} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-500 font-bold flex items-center justify-center gap-2 opacity-70">
                      <Mail size={16} /> {user?.email}
                    </p>
                    {userData?.phone && (
                      <p className="text-slate-400 font-bold flex items-center justify-center gap-2">
                        <Phone size={16} className="text-[#28A745]" /> {userData.phone}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#007BFF]/5 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#28A745]/5 blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center gap-2 group hover:border-[#007BFF]/20 transition-all">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Patient Age</span>
          {isEditing ? (
            <input 
              type="number"
              className="w-20 text-center text-2xl font-black text-[#007BFF] bg-slate-50 rounded-xl border-none focus:ring-0"
              value={editData.age}
              onChange={e => setEditData({...editData, age: e.target.value})}
            />
          ) : (
            <span className="text-3xl font-black text-slate-900 underline underline-offset-8 decoration-[#007BFF]/20 decoration-4">{userData?.age || '--'} <span className="text-sm text-slate-400 font-bold ml-1">yrs</span></span>
          )}
        </div>
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center gap-2 group hover:border-[#28A745]/20 transition-all">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">Gender</span>
          {isEditing ? (
            <select 
              className="text-lg font-black text-[#28A745] bg-slate-50 rounded-xl border-none focus:ring-0 capitalize"
              value={editData.gender}
              onChange={e => setEditData({...editData, gender: e.target.value})}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <span className="text-3xl font-black text-slate-900 capitalize underline underline-offset-8 decoration-[#28A745]/20 decoration-4">{userData?.gender || '--'}</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">Account Preferences</h3>
        <div className="grid gap-3">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              className="group bg-white flex items-center gap-6 p-6 rounded-[2rem] border border-slate-50 hover:bg-slate-50 hover:border-[#007BFF]/30 hover:translate-x-2 transition-all shadow-sm"
            >
              <div className={`${item.bg} ${item.color} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                <item.icon size={24} />
              </div>
              <span className="flex-1 text-left font-black text-lg text-slate-800">{item.label}</span>
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-[#007BFF] group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-4">System Actions</h3>
        <button 
          onClick={() => signOut(auth)}
          className="group w-full bg-rose-50/50 flex items-center gap-6 p-6 rounded-[2rem] border border-rose-100 hover:bg-rose-50 hover:border-rose-300 transition-all text-rose-600"
        >
          <div className="bg-rose-100 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogOut size={24} />
          </div>
          <span className="flex-1 text-left font-black text-lg">Secure Logout</span>
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      <div className="text-center pt-8 border-t border-slate-100">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 tracking-[0.3em] uppercase mb-2">
          <Shield size={10} className="text-[#007BFF]" /> RxDecode Secure Access
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Version 1.2.0 • Stable Release</p>
      </div>
    </div>
  );
};

export default Profile;
