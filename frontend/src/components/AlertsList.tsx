import React from 'react';
import { AlertOctagon, AlertTriangle, Bell, Info } from 'lucide-react';
import { Alert } from '../types';

interface AlertsListProps {
  alerts: Alert[];
}

export default function AlertsList({ alerts }: AlertsListProps) {
  
  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'WARNING':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <AlertOctagon size={14} className="text-rose-500" />;
      case 'WARNING':
        return <AlertTriangle size={14} className="text-amber-500" />;
      default:
        return <Info size={14} className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col h-full overflow-hidden">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-mono text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Bell size={16} className="text-brand-500" />
            Alert Ingestion Stream
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">Active infrastructure event thresholds</p>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-slate-400">
          {alerts.filter(a => a.status === 'ACTIVE').length} Active
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 min-h-[160px] max-h-[300px]">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-9 h-9 rounded-full border border-dark-border flex items-center justify-center bg-dark-bg text-slate-500 mb-2">
              <Bell size={18} />
            </div>
            <p className="text-xs text-slate-400 font-mono">No alerts active.</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Infrastructure limits are operating inside baseline quotas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-[11px] text-slate-300">
              <thead>
                <tr className="border-b border-dark-border text-slate-400 font-medium">
                  <th className="pb-2 font-mono">Timestamp</th>
                  <th className="pb-2 font-mono">ID</th>
                  <th className="pb-2 font-mono">Severity</th>
                  <th className="pb-2 font-mono">Message</th>
                  <th className="pb-2 font-mono">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-dark-hover/40 transition-colors">
                    <td className="py-2.5 whitespace-nowrap text-slate-400">{alert.timestamp}</td>
                    <td className="py-2.5 whitespace-nowrap text-slate-400 font-semibold">{alert.id}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold ${getSeverityBadge(alert.severity)}`}>
                        {getSeverityIcon(alert.severity)}
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-200 font-sans max-w-xs truncate">{alert.message}</td>
                    <td className="py-2.5 whitespace-nowrap">
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase ${
                        alert.status === 'ACTIVE' 
                          ? 'text-rose-500 bg-rose-500/5 border border-rose-500/15 animate-pulse' 
                          : 'text-slate-500 bg-slate-800/40 border border-slate-700/30'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
