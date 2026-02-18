
import React, { useState, useEffect } from 'react';
import { PermissionStatus, HistoryItem } from './types';
import HistoryList from './components/HistoryList';

const App: React.FC = () => {
  const [permission, setPermission] = useState<PermissionStatus>('default');
  const [swActive, setSwActive] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSecure, setIsSecure] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  
  const [title, setTitle] = useState('Push Lab Test 🚀');
  const [body, setBody] = useState('Testing notifications on this mobile device.');

  const checkStatus = async () => {
    setIsSecure(window.isSecureContext);
    
    if ('Notification' in window) {
      setPermission(Notification.permission as PermissionStatus);
    } else {
      setErrorMessage('Notifications are not supported on this browser.');
    }

    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        setSwActive(!!reg);
      } catch (err) {
        setSwActive(false);
      }
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const addToHistory = (title: string, body: string, method: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      title,
      body,
      type: method as any
    };
    setHistory(prev => [newItem, ...prev].slice(0, 5));
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionStatus);
    } catch (err) {
      setErrorMessage('Permission request failed.');
    }
  };

  const triggerNotification = async (delaySeconds: number = 0) => {
    if (permission !== 'granted') {
      setErrorMessage('Please grant notification permissions first.');
      return;
    }

    if (delaySeconds > 0) {
      setIsSimulating(true);
      setTimeout(() => {
        executeTrigger();
        setIsSimulating(false);
      }, delaySeconds * 1000);
    } else {
      executeTrigger();
    }
  };

  const executeTrigger = async () => {
    try {
      let method = 'Standard';
      
      // Attempt Service Worker first for better mobile background support
      if ('serviceWorker' in navigator && swActive) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).showNotification(title, {
          body: body,
          icon: 'https://picsum.photos/192/192?random=' + Math.random(),
          badge: 'https://picsum.photos/96/96?random=' + Math.random(),
          vibrate: [200, 100, 200],
          tag: 'push-lab-test'
        });
        method = 'ServiceWorker';
      } else {
        // Fallback to standard web notification
        new Notification(title, { 
          body: body,
          icon: 'https://picsum.photos/192/192?random=' + Math.random()
        });
      }
      
      addToHistory(title, body, method);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Trigger failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center font-sans text-slate-900 pb-12">
      <div className="w-full max-w-md px-6 pt-10">
        
        {/* MOBILE HEADER */}
        <header className="mb-8 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-2xl shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Push Lab</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Direct Mobile Testing</p>
        </header>

        {/* STATUS TILES */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Status</span>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
              permission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 
              permission === 'denied' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {permission.toUpperCase()}
            </span>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 text-center">
            <span className="block text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Engine</span>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
              swActive ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {swActive ? 'SW READY' : 'BROWSER ONLY'}
            </span>
          </div>
        </div>

        {/* MAIN CONTROLS */}
        <main className="space-y-4">
          {permission !== 'granted' ? (
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 text-center">
              <p className="text-sm text-slate-500 mb-6 font-medium">Notifications must be enabled to test push functionality.</p>
              <button
                onClick={requestPermission}
                disabled={permission === 'denied'}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-50"
              >
                {permission === 'denied' ? 'System Blocked' : 'Enable Notifications'}
              </button>
              {permission === 'denied' && (
                <p className="mt-4 text-[10px] text-rose-500 font-bold leading-relaxed">
                  You denied permissions. Reset them in your browser settings (usually the lock icon in the URL bar).
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Message Body</label>
                  <textarea 
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500/10 resize-none transition-all"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => triggerNotification(0)}
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 active:scale-[0.97] transition-all"
                >
                  Send Now
                </button>
                <button
                  onClick={() => triggerNotification(5)}
                  disabled={isSimulating}
                  className="w-full py-4 bg-white text-blue-600 border-2 border-blue-50 rounded-[2rem] font-black text-sm active:scale-[0.97] transition-all disabled:opacity-50"
                >
                  {isSimulating ? 'Sending in 5s...' : 'Test Background (5s Delay)'}
                </button>
              </div>
            </div>
          )}

          {!swActive && permission === 'granted' && (
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-[10px] font-bold text-amber-700 leading-relaxed text-center">
              Service Worker inactive. This is normal in preview environments. Notifications will still work while the app is open.
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center">
              {errorMessage}
            </div>
          )}
        </main>

        <HistoryList 
          history={history} 
          onClear={() => setHistory([])} 
        />

        <footer className="mt-12 text-center px-8">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] mb-2">
            {isSecure ? 'Secure Context Verified' : 'Insecure Connection'}
          </p>
          <p className="text-[8px] text-slate-300 font-medium leading-relaxed">
            Note: "Origin Mismatch" is a browser security feature. In production, ensure sw.js is on your domain.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
