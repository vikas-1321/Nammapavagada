import React, { useState, useEffect } from 'react';
import { Settings, Server, Database, Cloud, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getHealth();
      setHealth(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings size={18} className="text-emerald-400" />
            <span>AWS Cloud & System Architecture Settings</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time status of backend REST API, Amazon RDS database, and Amazon S3 object storage.
          </p>
        </div>
        <button
          onClick={fetchHealth}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Backend REST API */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-forest/40 flex items-center justify-center text-emerald-400">
              <Server size={20} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              <CheckCircle2 size={12} />
              <span>Operational</span>
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Backend REST API</h4>
          <p className="text-xs text-slate-400">
            Python Flask modular microservice following SOLID architectural principles.
          </p>
          <div className="pt-3 border-t border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
            <p>Environment: <span className="text-emerald-400">{health?.environment || 'development'}</span></p>
            <p>Port: 5000</p>
            <p>CORS: Enabled (Multi-Origin)</p>
          </div>
        </div>

        {/* Database */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 flex items-center justify-center text-blue-400">
              <Database size={20} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              <CheckCircle2 size={12} />
              <span>{health?.database === 'connected' ? 'Connected' : 'Degraded'}</span>
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Relational Database</h4>
          <p className="text-xs text-slate-400">
            Amazon RDS PostgreSQL (or local SQLite for zero-friction local development).
          </p>
          <div className="pt-3 border-t border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
            <p>State: <span className="text-emerald-400">{health?.database || 'connected'}</span></p>
            <p>Dialect: SQLAlchemy ORM 2.0</p>
            <p>Pool Pre-Ping: Active</p>
          </div>
        </div>

        {/* Amazon S3 Storage */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 flex items-center justify-center text-amber-400">
              <Cloud size={20} />
            </div>
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              <CheckCircle2 size={12} />
              <span>{health?.s3Storage === 'active' ? 'AWS S3 Active' : 'Local Fallback'}</span>
            </span>
          </div>
          <h4 className="text-sm font-bold text-white">Object Media Storage</h4>
          <p className="text-xs text-slate-400">
            Amazon S3 bucket for authentic photographs with local disk storage fallback.
          </p>
          <div className="pt-3 border-t border-slate-800 text-[11px] space-y-1 font-mono text-slate-300">
            <p>AWS Region: <span className="text-amber-400">{health?.region || 'ap-south-1'}</span></p>
            <p>Bucket: <span className="text-amber-400 truncate">{health?.bucket || 'namma-pavagada-media'}</span></p>
            <p>Storage Engine: {health?.s3Storage === 'active' ? 'boto3 S3 Client' : 'Local Disk Handler'}</p>
          </div>
        </div>
      </div>

      {/* Cloud Architecture Diagram Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800">
        <h4 className="text-sm font-bold text-white mb-2">AWS Target Deployment Topology</h4>
        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
{`                    Route 53 / DNS
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
   CloudFront / S3           CloudFront / S3
   (Public Website)          (Admin Dashboard)
             │                         │
             └────────────┬────────────┘
                          ▼
             AWS App Runner / ECS Fargate
                 (Flask Backend REST API)
                          │
             ┌────────────┴────────────┐
             ▼                         ▼
   Amazon RDS (PostgreSQL)    Amazon S3 (Photos/Media)
     Multi-AZ Subnets          Bucket: namma-pavagada-media`}
        </pre>
      </div>
    </div>
  );
};
