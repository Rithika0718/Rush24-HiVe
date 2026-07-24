import React, { useState } from 'react';
import { Activity, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

interface TopNavProps {
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  onInjectChaos: (scenario: string) => void;
  onReset: () => void;
  isLoading: boolean;
}

export default function TopNav({ overallStatus, onInjectChaos, onReset, isLoading }: TopNavProps) {
  const [selectedScenario, setSelectedScenario] = useState('DB_LATENCY_SPIKE');

  const getStatusColor = () => {
    switch (overallStatus) {
      case 'HEALTHY':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'DEGRADED':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'CRITICAL':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse';
    }
  };

  return (
    <header className="h-16 bg-dark-panel border-b border-dark-border px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono tracking-wider uppercase">Global State:</span>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide uppercase ${getStatusColor()}`}>
            <Activity size={14} />
            {overallStatus}
          </div>
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-3">
        <select
          value={selectedScenario}
          onChange={(e) => setSelectedScenario(e.target.value)}
          disabled={isLoading || overallStatus !== 'HEALTHY'}
          className="bg-dark-bg border border-dark-border rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none hover:border-slate-500 focus:border-brand-500 disabled:opacity-50 transition-all font-mono"
        >
          <option value="DB_LATENCY_SPIKE">DB CPU/Latency Spike</option>
          <option value="MEMORY_LEAK">Catalog API Memory Leak</option>
          <option value="NETWORK_PARTITION">Payment Gateway Partition</option>
        </select>

        {overallStatus === 'HEALTHY' ? (
          <button
            onClick={() => onInjectChaos(selectedScenario)}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-rose-950/20 disabled:opacity-50 transition-all font-mono"
          >
            <Zap size={14} className={isLoading ? 'animate-bounce' : ''} />
            Inject Chaos
          </button>
        ) : (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-lg shadow-teal-950/20 disabled:opacity-50 transition-all font-mono"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Reset Twin
          </button>
        )}
      </div>
    </header>
  );
}
