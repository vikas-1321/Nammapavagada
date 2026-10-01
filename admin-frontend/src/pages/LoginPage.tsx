import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@nammapavagada.com');
  const [password, setPassword] = useState('PavagadaAdmin@2026');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative gradient backdrops */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-forest/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-terracotta/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full glass-panel rounded-2xl p-8 shadow-2xl relative z-10 border border-slate-800">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-forest to-emerald-700 flex items-center justify-center text-white mb-4 shadow-xl shadow-forest/30 border border-emerald-500/30">
            <ShieldCheck size={32} className="text-emerald-300" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Namma Pavagada</h1>
          <p className="text-xs uppercase tracking-widest font-semibold text-emerald-400 mt-1">
            Administrative Management CMS
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Secure portal for administrators to manage local information, maps, transportation, and AWS media.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 flex items-start gap-3 text-red-300 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
            <div>
              <p className="font-semibold">Authentication Error</p>
              <p className="text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nammapavagada.com"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-forest to-emerald-700 hover:from-forest-light hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-forest/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-400">
            Initial Seed Admin: <span className="font-mono text-emerald-300">admin@nammapavagada.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};
