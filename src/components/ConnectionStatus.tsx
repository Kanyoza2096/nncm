import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured, isSandboxMode } from '../lib/supabase';

const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'error' | 'sandbox'>('testing');
  const [message, setMessage] = useState<string>('Initializing Supabase connection...');
  const [details, setDetails] = useState<string>('');

  const switchToOffline = () => {
    localStorage.setItem('nncm_force_offline', 'true');
    window.location.reload();
  };

  const checkConnection = async () => {
    if (isSandboxMode()) {
      setStatus('sandbox');
      setMessage('Sandbox Mode (Offline Preview)');
      setDetails('Viewing mock data because you are logged in using sandbox credentials.');
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus('error');
      setMessage('Supabase Table Integration Incomplete');
      setDetails('Missing VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      return;
    }

    try {
      setStatus('testing');
      setMessage('Pinging Supabase tables...');
      setDetails('');
      
      const { count, error } = await supabase
        .from('beneficiaries')
        .select('*', { count: 'exact', head: true });
        
      if (error) {
        let errorDetails = error.message;
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          errorDetails = 'The "beneficiaries" table does not exist in your Supabase database. Please run the SQL schema setup from the System Health page.';
        } else if (error.code === 'PGRST301' || error.code?.startsWith('JWT')) {
          errorDetails = 'Authentication error. Please check your Supabase anon key.';
        } else if (error.message?.includes('FetchError') || error.message?.includes('Failed to fetch')) {
          errorDetails = 'Network error: Could not reach Supabase. Please verify your VITE_SUPABASE_URL environment variable.';
        }
        
        throw new Error(errorDetails);
      }
      
      setStatus('connected');
      setMessage('Integrated successfully with Supabase Cloud');
      setDetails(`Live records: ${count !== null ? count : 0} registered beneficiary households`);
    } catch (err: any) {
      console.error('Supabase status check failure:', err);
      setStatus('error');
      setMessage('Supabase Table Integration Incomplete');
      setDetails(err.message || 'Ensure beneficiaries table exists or environment variables are correct.');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${
      status === 'connected' 
        ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800/50' 
        : status === 'sandbox'
        ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-800/50'
        : status === 'error'
        ? 'bg-rose-50/50 border-rose-200 dark:bg-rose-950/20 dark:border-rose-800/50'
        : 'bg-slate-50 border-slate-200 dark:bg-slate-900/50 dark:border-slate-800'
    }`}>
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              status === 'connected' ? 'bg-emerald-100 text-emerald-600' : 
              status === 'sandbox' ? 'bg-indigo-100 text-indigo-600' :
              status === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {status === 'connected' ? <CheckCircle2 className="w-5 h-5" /> : 
               status === 'sandbox' ? <Database className="w-5 h-5" /> :
               status === 'error' ? <XCircle className="w-5 h-5" /> : 
               <Database className="w-5 h-5 animate-pulse" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Database Integration (Supabase)</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {message} {details && <span className="text-[10px] text-slate-400 font-mono block sm:inline sm:ml-2">({details})</span>}
              </p>
            </div>
          </div>

          <button 
            onClick={checkConnection}
            disabled={status === 'testing'}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 cursor-pointer"
            title="Retry connection"
          >
            <RefreshCw className={`w-4 h-4 ${status === 'testing' ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {status === 'error' && (
          <button
            onClick={switchToOffline}
            className="w-full py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors border border-rose-200"
          >
            Switch to Offline Mode (Demo)
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
