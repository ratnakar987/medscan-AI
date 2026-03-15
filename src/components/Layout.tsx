import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Camera, FileText, User, WifiOff, RefreshCw } from 'lucide-react';
import { auth, db } from '../firebase';
import { onSnapshotsInSync } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Firestore sync listener
    const unsubscribe = onSnapshotsInSync(db, () => {
      setIsOnline(true);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/scan', icon: Camera, label: 'Scan' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen bg-white pb-24">
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-xs font-medium flex items-center justify-between sticky top-0 z-[60]">
          <div className="flex items-center gap-2">
            <WifiOff size={14} />
            <span>Firestore connection lost. Operating in offline mode.</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      )}
      
      <main className="max-w-md mx-auto px-4 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-100 px-8 py-4 flex justify-between items-center max-w-md mx-auto z-50">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}
            >
              <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
