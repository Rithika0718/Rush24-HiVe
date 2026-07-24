import React from 'react';
import { FileText, ShieldCheck, ShieldAlert, Award, ArrowRightCircle } from 'lucide-react';
import { RcaDetails } from '../types';

interface RcaPanelProps {
  rca: RcaDetails | null;
}

export default function RcaPanel({ rca }: RcaPanelProps) {
  return (
    <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col h-full overflow-hidden">
      <div className="mb-4 shrink-0 flex items-center justify-between">
        <div>
          <h3 className="font-mono text-sm font-semibold text-slate-100 flex items-center gap-2">
            <FileText size={16} className="text-brand-500" />
            Root Cause Analysis (RCA)
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">Incident Post-Mortem Registry</p>
        </div>
        {rca && (
          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold px-2 py-0.5 rounded uppercase font-mono">
            RCA Drafted
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 min-h-[300px]">
        {!rca ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center bg-dark-bg text-slate-500 mb-3">
              <FileText size={20} />
            </div>
            <p className="text-xs text-slate-400 font-mono">RCA not yet compiled.</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">HIVE Nebula will generate a post-mortem once chaos simulation ends.</p>
          </div>
        ) : (
          <div className="space-y-5 font-mono text-xs text-slate-300">
            {/* Root Cause */}
            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-lg">
              <div className="flex items-center gap-1.5 text-rose-400 font-semibold mb-1">
                <ShieldAlert size={14} />
                <span>ROOT CAUSE IDENTIFIED:</span>
              </div>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">{rca.root_cause}</p>
            </div>

            {/* Impact */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1">Outage Impact:</span>
              <p className="text-slate-300 text-xs font-sans leading-relaxed">{rca.impact}</p>
            </div>

            {/* Affected services */}
            <div>
              <span className="text-slate-400 font-semibold block mb-1.5">Blast Radius Nodes:</span>
              <div className="flex flex-wrap gap-1.5">
                {rca.affected_services.map((svc, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-slate-300 text-[10px]">
                    {svc}
                  </span>
                ))}
              </div>
            </div>

            {/* Recovery Action */}
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <ShieldCheck size={14} />
                <span>AUTOMATED REMEDIATION DISPATCHED:</span>
              </div>
              <p className="text-slate-200 text-xs font-sans leading-relaxed">{rca.recovery}</p>
            </div>

            {/* Recommendations */}
            <div>
              <span className="text-slate-400 font-semibold block mb-2">Architectural Recommendations:</span>
              <ul className="space-y-1.5 pl-1">
                {rca.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-2 text-slate-300 font-sans text-xs items-start leading-relaxed">
                    <ArrowRightCircle size={14} className="text-brand-500 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
