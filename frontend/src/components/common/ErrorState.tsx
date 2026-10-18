import React from 'react';
import { AlertCircle, RotateCcw, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'Failed to retrieve information from the Namma Pavagada backend server.',
  error,
  onRetry,
  isRetrying = false,
}) => {
  const errorText = typeof error === 'string' ? error : error?.message;
  const isNetworkIssue =
    errorText && (errorText.toLowerCase().includes('network') || errorText.toLowerCase().includes('fetch'));

  return (
    <div
      role="alert"
      className="bg-white border-2 border-red-200/90 rounded-2xl p-8 md:p-12 text-center my-6 shadow-sm max-w-2xl mx-auto"
    >
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center mx-auto mb-5 shadow-2xs">
        {isNetworkIssue ? (
          <WifiOff className="w-8 h-8 stroke-[1.8]" />
        ) : (
          <ServerCrash className="w-8 h-8 stroke-[1.8]" />
        )}
      </div>

      <h3 className="text-xl md:text-2xl font-serif font-bold text-dark-text mb-2">
        {title}
      </h3>

      <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto mb-4 font-sans">
        {message}
      </p>

      {errorText && (
        <div className="bg-red-50/70 border border-red-200/60 rounded-xl p-3 text-xs font-mono text-red-800 max-w-md mx-auto mb-6 text-left break-words">
          <span className="font-bold">Error: </span>
          {errorText}
        </div>
      )}

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="accent"
            size="md"
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Connecting to Server...' : 'Try Again'}</span>
          </Button>
        </div>
      )}
    </div>
  );
};
