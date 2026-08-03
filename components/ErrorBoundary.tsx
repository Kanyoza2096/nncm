import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 text-center ring-1 ring-slate-100">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-900 mb-3">System Encountered a Glitch</h2>
        <p className="text-slate-500 mb-8 font-light leading-relaxed">
          We've encountered an unexpected technical issue. Our logs have been notified, but you can try refreshing or returning home.
        </p>

        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          
          <a
            href="/"
            className="w-full bg-white text-slate-600 font-bold py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </a>
        </div>

        {/* Always show debug info for troubleshooting */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-left">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Debug Info</p>
          <div className="bg-slate-50 rounded-lg p-3 text-[10px] font-mono text-red-500 overflow-auto max-h-32">
            {error instanceof Error ? error.message : String(error)}
            {error instanceof Error && error.stack && (
              <pre className="mt-2 text-[8px] text-slate-400 overflow-auto max-h-24 whitespace-pre-wrap">
                {error.stack}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
