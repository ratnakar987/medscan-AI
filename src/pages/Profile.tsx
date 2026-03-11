import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { User, Mail, Shield, Bell, HelpCircle, LogOut, ChevronRight, Heart, Phone, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  const menuItems = [
    { icon: Shield, label: 'Privacy & Security', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: Bell, label: 'Notifications', color: 'text-orange-500', bg: 'bg-orange-50' },
    { icon: Heart, label: 'Health Profile', color: 'text-red-500', bg: 'bg-red-50' },
    { icon: HelpCircle, label: 'Help & Support', color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="relative">
          <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center text-primary border-4 border-white shadow-lg overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={48} />
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white">
            <User size={14} />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold">{userData?.name || user?.displayName || 'User'}</h2>
          <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
            <Mail size={14} /> {user?.email}
          </p>
          {userData?.phone && (
            <p className="text-slate-500 text-sm flex items-center justify-center gap-1">
              <Phone size={14} /> {userData.phone}
            </p>
          )}
        </div>
      </div>

      {userData && (
        <div className="grid grid-cols-2 gap-4">
          <div className="card flex flex-col items-center gap-1 py-3">
            <span className="text-xs text-slate-400 uppercase font-bold">Age</span>
            <span className="text-lg font-bold text-primary">{userData.age} yrs</span>
          </div>
          <div className="card flex flex-col items-center gap-1 py-3">
            <span className="text-xs text-slate-400 uppercase font-bold">Gender</span>
            <span className="text-lg font-bold text-primary capitalize">{userData.gender}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Settings</h3>
        <div className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.98 }}
              className="card flex items-center gap-4 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className={`${item.bg} ${item.color} p-2.5 rounded-xl`}>
                <item.icon size={20} />
              </div>
              <span className="flex-1 text-left font-medium">{item.label}</span>
              <ChevronRight className="text-slate-300" size={20} />
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Account</h3>
        <button 
          onClick={() => signOut(auth)}
          className="card flex items-center gap-4 py-4 text-red-500 hover:bg-red-50 transition-colors"
        >
          <div className="bg-red-50 p-2.5 rounded-xl">
            <LogOut size={20} />
          </div>
          <span className="flex-1 text-left font-medium">Sign Out</span>
          <ChevronRight className="text-slate-300" size={20} />
        </button>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-slate-400">MedScan AI v1.0.0</p>
        <p className="text-[10px] text-slate-300 mt-1">Made with ❤️ for your health</p>
      </div>
    </div>
  );
};

export default Profile;
