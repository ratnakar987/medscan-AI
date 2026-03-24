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
    <div className="flex flex-col gap-8 pb-10">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <User size={48} />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-2 border-white shadow-md">
            <Edit2 size={12} />
          </button>
        </div>
        
        <div className="text-center w-full max-w-xs">
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="flex flex-col gap-3"
              >
                <input 
                  type="text"
                  className="input-field text-center font-bold"
                  value={editData.displayName}
                  onChange={e => setEditData({...editData, displayName: e.target.value})}
                  placeholder="Full Name"
                />
                <div className="flex gap-2">
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-emerald-500 text-white py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} Save
                  </button>
                  <button 
                    onClick={() => { setIsEditing(false); setEditData(userData); }}
                    className="flex-1 bg-slate-100 text-slate-500 py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <h2 className="text-xl font-bold">{userData?.displayName || user?.displayName || 'User'}</h2>
                  <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-primary">
                    <Edit2 size={14} />
                  </button>
                </div>
                <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
                  <Mail size={14} /> {user?.email}
                </p>
                {userData?.phone && (
                  <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
                    <Phone size={14} /> {userData.phone}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card flex flex-col items-center gap-1 py-4 bg-white border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Age</span>
          {isEditing ? (
            <input 
              type="number"
              className="w-16 text-center font-bold text-primary bg-slate-50 rounded-lg border-none focus:ring-0"
              value={editData.age}
              onChange={e => setEditData({...editData, age: e.target.value})}
            />
          ) : (
            <span className="text-lg font-black text-primary">{userData?.age || '--'} yrs</span>
          )}
        </div>
        <div className="card flex flex-col items-center gap-1 py-4 bg-white border-slate-100">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Gender</span>
          {isEditing ? (
            <select 
              className="text-sm font-bold text-primary bg-slate-50 rounded-lg border-none focus:ring-0 capitalize"
              value={editData.gender}
              onChange={e => setEditData({...editData, gender: e.target.value})}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <span className="text-lg font-black text-primary capitalize">{userData?.gender || '--'}</span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Settings</h3>
        <div className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              className="card flex items-center gap-4 py-4 hover:bg-slate-50 transition-colors border-slate-100"
            >
              <div className={`${item.bg} ${item.color} p-2.5 rounded-xl`}>
                <item.icon size={20} />
              </div>
              <span className="flex-1 text-left font-bold text-slate-700">{item.label}</span>
              <ChevronRight className="text-slate-300" size={20} />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Account</h3>
        <button 
          onClick={() => signOut(auth)}
          className="card flex items-center gap-4 py-4 text-rose-500 hover:bg-rose-50 transition-colors border-rose-100"
        >
          <div className="bg-rose-50 p-2.5 rounded-xl">
            <LogOut size={20} />
          </div>
          <span className="flex-1 text-left font-bold">Sign Out</span>
          <ChevronRight className="text-slate-300" size={20} />
        </button>
      </div>

      <div className="text-center py-4">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MedScan AI v1.2.0</p>
        <p className="text-[10px] text-slate-300 mt-1">Your data is secured with medical-grade encryption</p>
      </div>
    </div>
  );
};

export default Profile;
