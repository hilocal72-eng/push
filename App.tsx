
import React, { useState, useEffect } from 'react';
import { PermissionStatus, HistoryItem } from './types';
import HistoryList from './components/HistoryList';

const App: React.FC = () => {
  const [permission, setPermission] = useState<PermissionStatus>('default');
  const [swActive, setSwActive] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [customTitle, setCustomTitle] = useState('Deployment Test');
  const [customBody, setCustomBody] = useState('Testing notifications on Cloudflare!');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as PermissionStatus);
    } else {
      setErrorMessage('This browser does not support desktop notifications.');
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwActive(true));
    }
  }, []);

  const addToHistory = (title: string, body: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      title,
      body,
      type: 'local'
    };
    setHistory(prev => [newItem, ...prev].slice(0, 10));
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const result = await Notification.requestPermission();
      setPermission(result as PermissionStatus);
    } catch (err) {
      setErrorMessage('Failed to request notification permissions.');
    }
  };

  const triggerNotification = async (title: string, body: string) => {
    if (permission !== 'granted') {
      setErrorMessage('Please grant notification permissions first.');
      return;
    }

    try {
      // Use Service Worker if available for a more "real" push experience
      if ('serviceWorker' in navigator && swActive) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          body: body,
          icon: 'https://picsum.photos/128/128',
          badge: 'https://picsum.photos/48/48',
          tag: 'tester-' + Date.now()
        });
      } else {
        // Fallback to standard window notification
        new Notification(title, { body });
      }

      addToHistory(title, body);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage('Notification failed. Ensure you are visiting via HTTPS (Cloudflare provides this).');
    }
  };

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    triggerNotification(customTitle, customBody);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-md w-full">
        <header className="text-center mb-10">
          <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Cloudflare Push Tester</h1>
          <p className="mt-2 text-gray-500">Test notification delivery and Service Worker registration.</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Browser Permission</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                permission === 'granted' ? 'bg-green-100 text-green-700' : 
                permission === 'denied' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {permission}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Service Worker</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                swActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'
              }`}>
                {swActive ? 'Active' : 'Not Found'}
              </span>
            </div>
          </div>

          {permission !== 'granted' ? (
            <button
              onClick={requestPermission}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100"
            >
              Enable Notifications
            </button>
          ) : (
            <form onSubmit={handleSendCustom} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Title</label>
                <input 
                  type="text" 
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-tight">Body</label>
                <textarea 
                  value={customBody}
                  onChange={(e) => setCustomBody(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm"
                  rows={2}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-100 flex items-center justify-center space-x-2"
              >
                <span>Fire Notification</span>
              </button>
            </form>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start space-x-3">
             <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
             </svg>
             <span>{errorMessage}</span>
          </div>
        )}

        <HistoryList 
          history={history} 
          onClear={() => setHistory([])} 
        />

        <footer className="mt-12 text-center text-gray-400 text-[10px] leading-relaxed px-6">
          <p>Cloudflare Pages Deployment Ready. Service Worker handles background clicks. Standard Browser APIs used.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
