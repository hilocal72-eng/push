
import React, { useState, useEffect } from 'react';
import { PermissionStatus, HistoryItem, PushSubscriptionData } from './types';
import HistoryList from './components/HistoryList';
import { getPushInstructions } from './services/geminiService';

// Public VAPID Key (Replace with your own after generating them)
const PUBLIC_VAPID_KEY = 'BEl62Ohptw_4n9drSgYv9m_yC6Xq7v4r1-X7qS2_08S_f6Z_4859-j2_X5_8_X7qS2_08S_f6Z_4859-j2_X5_8';

const App: React.FC = () => {
  const [permission, setPermission] = useState<PermissionStatus>('default');
  const [swActive, setSwActive] = useState(false);
  const [isSandboxed, setIsSandboxed] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [instructions, setInstructions] = useState<string | null>(null);
  const [isLoadingInstructions, setIsLoadingInstructions] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const [title, setTitle] = useState('Remote Alert 🌐');
  const [body, setBody] = useState('This message came from the cloud.');

  const checkStatus = async () => {
    try {
      if ('Notification' in window) {
        setPermission(Notification.permission as PermissionStatus);
      }
      
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration().catch(err => {
          if (err.message.includes('origin') || err.name === 'SecurityError') {
            setIsSandboxed(true);
          }
          return null;
        });

        setSwActive(!!reg);
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          setSubscription(sub);
        }
      }
    } catch (err: any) {
      console.warn('Status check limited:', err.message);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = () => {
    if (subscription) {
      navigator.clipboard.writeText(JSON.stringify(subscription));
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToRemote = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
      });
      setSubscription(sub);
      setErrorMessage(null);
    } catch (err: any) {
      setErrorMessage(`Push Error: ${err.message}.`);
    }
  };

  const simulateSubscription = () => {
    const mockSub = {
      endpoint: "https://fcm.googleapis.com/fcm/send/d_mock_endpoint_123",
      keys: {
        p256dh: "BBD_Mock_Key_p256dh_ABC123...",
        auth: "Mock_Auth_Key_789"
      }
    } as any;
    setSubscription(mockSub);
    setErrorMessage("Simulation mode enabled.");
  };

  const fetchInstructions = async () => {
    if (!subscription) return;
    setIsLoadingInstructions(true);
    try {
      const text = await getPushInstructions(JSON.stringify(subscription));
      setInstructions(text || 'No instructions generated.');
    } catch (err) {
      setErrorMessage('Failed to generate Cloudflare Worker guide.');
    } finally {
      setIsLoadingInstructions(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900 selection:bg-blue-100">
      <div className="max-w-md mx-auto px-6 pt-12">
        
        {isSandboxed && (
          <div className="mb-8 bg-amber-50 border border-amber-100 p-5 rounded-3xl shadow-sm">
            <div className="flex gap-3">
              <div className="bg-amber-100 p-2 rounded-xl h-fit">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xs font-black text-amber-800 uppercase tracking-wider">Cloudflare Preview Lock</h3>
                <p className="text-[11px] text-amber-700/80 font-medium mt-1 leading-relaxed">
                  Service Workers are blocked in cross-origin iframes. Deploy to a <b>Cloudflare Pages</b> domain to test live.
                </p>
                <button 
                  onClick={simulateSubscription}
                  className="mt-3 text-[10px] font-black text-white bg-amber-600 px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all"
                >
                  Enter Simulator Mode
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="text-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cloudflare Push Lab</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">VAPID • WORKERS • PAGES</p>
        </header>

        <section className="space-y-6">
          {/* PERMISSION CARD */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black uppercase text-slate-400">System Notification</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${permission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {permission.toUpperCase()}
              </span>
            </div>
            {permission !== 'granted' && (
              <button 
                onClick={() => Notification.requestPermission().then(p => setPermission(p as any))}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-100 active:scale-95 transition-all"
              >
                Request Access
              </button>
            )}
          </div>

          {/* REMOTE PUSH CARD */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <h2 className="text-sm font-black mb-4 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${subscription ? 'bg-emerald-500 shadow-[0_0_8px_#10B981]' : 'bg-slate-200'}`}></span>
              Push Subscription
            </h2>
            
            {!subscription ? (
              <button 
                onClick={subscribeToRemote}
                disabled={permission !== 'granted' || isSandboxed}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm disabled:opacity-20 active:scale-95 transition-all"
              >
                Register for Cloud Push
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-tighter">Subscription JSON</p>
                  <pre className="text-[10px] text-slate-600 font-mono whitespace-pre-wrap break-all leading-relaxed max-h-32 overflow-y-auto">
                    {JSON.stringify(subscription, null, 2)}
                  </pre>
                  <button 
                    onClick={copyToClipboard}
                    className="absolute top-4 right-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {copyFeedback ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    )}
                  </button>
                </div>
                
                <button 
                  onClick={fetchInstructions}
                  disabled={isLoadingInstructions}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {isLoadingInstructions ? (
                    <span className="animate-pulse">Building Cloudflare Guide...</span>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      Setup Cloudflare Worker
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSubscription(null)}
                  className="w-full py-3 text-slate-400 font-bold text-[10px] uppercase hover:text-rose-500 transition-colors"
                >
                  Clear Subscription
                </button>
              </div>
            )}
          </div>

          {instructions && (
            <div className="bg-white p-7 rounded-[2.5rem] text-slate-900 shadow-2xl overflow-hidden relative border-2 border-blue-50">
              <button 
                onClick={() => setInstructions(null)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all"
              >
                &times;
              </button>
              <h3 className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em] mb-6">Worker Implementation</h3>
              <div className="prose prose-slate prose-xs max-w-none">
                <div 
                   className="text-[11px] leading-loose text-slate-600 font-medium font-mono bg-slate-50 p-4 rounded-xl border border-slate-100 overflow-x-auto"
                   dangerouslySetInnerHTML={{ __html: instructions.replace(/\n/g, '<br/>') }} 
                />
              </div>
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                   <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor"><path d="M18.83 12.5a.83.83 0 0 1 .83-.83h1.67a.83.83 0 0 1 0 1.66h-1.67a.83.83 0 0 1-.83-.83zM12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm0-13a5 5 0 1 0 5 5 5 5 0 0 0-5-5z"/></svg>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase text-slate-900">Worker Tip</h4>
                  <p className="text-[9px] text-slate-400 font-bold">Use Environment Secrets for your Private Key.</p>
                </div>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black text-center uppercase tracking-widest">
              {errorMessage}
            </div>
          )}
        </section>

        <HistoryList history={history} onClear={() => setHistory([])} />

        <footer className="mt-20 text-center">
          <div className="inline-flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-slate-100 shadow-sm">
             <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full ${swActive ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
               <span className="text-[8px] font-black uppercase text-slate-400">SW</span>
             </div>
             <div className="w-px h-3 bg-slate-100"></div>
             <div className="flex items-center gap-1.5">
               <div className={`w-2 h-2 rounded-full ${window.isSecureContext ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
               <span className="text-[8px] font-black uppercase text-slate-400">HTTPS</span>
             </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
