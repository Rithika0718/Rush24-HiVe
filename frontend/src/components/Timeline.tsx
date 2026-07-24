import React from 'react';
import { ShieldAlert, Terminal, Eye, BrainCircuit, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { TimelineEntry } from '../types';

interface TimelineProps {
  timeline: TimelineEntry[];
}

export default function Timeline({ timeline }: TimelineProps) {
  
  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'chaos': return <ShieldAlert size={14} className="text-red-500" />;
      case 'detection': return <Eye size={14} className="text-orange-500" />;
      case 'debate': return <BrainCircuit size={14} className="text-blue-500" />;
      case 'analysis': return <Terminal size={14} className="text-purple-500" />;
      case 'recovery': return <HeartHandshake size={14} className="text-teal-500" />;
      case 'resolution': return <CheckCircle2 size={14} className="text-emerald-500" />;
      default: return <Terminal size={14} className="text-slate-400" />;
    }
  };

  const getTimelineBorder = (type: string) => {
    switch (type) {
      case 'chaos': return 'border-red-500/30 bg-red-500/10';
      case 'detection': return 'border-orange-500/30 bg-orange-500/10';
      case 'debate': return 'border-blue-500/30 bg-blue-500/10';
      case 'analysis': return 'border-purple-500/30 bg-purple-500/10';
      case 'recovery': return 'border-teal-500/30 bg-teal-500/10';
      case 'resolution': return 'border-emerald-500/30 bg-emerald-500/10';
      default: return 'border-slate-800 bg-slate-900';
    }
  };

  return (
    <div className="bg-dark-panel border border-dark-border rounded-xl p-5 flex flex-col h-full overflow-hidden">
      <div className="mb-4 shrink-0">
        <h3 className="font-mono text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Terminal size={16} className="text-brand-500" />
          Incident Command Timeline
        </h3>
        <p className="text-[10px] text-slate-400 font-mono">Sequence trace of automated recovery</p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 relative min-h-[300px]">
        {timeline.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center bg-dark-bg text-slate-500 mb-3">
              <Terminal size={20} />
            </div>
            <p className="text-xs text-slate-400 font-mono">No timeline events logged.</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">Timeline details populate when simulated issues occur.</p>
          </div>
        ) : (
          <div className="relative border-l border-dark-border pl-6 ml-3 py-1 space-y-6">
            {timeline.map((entry, index) => (
              <div key={index} className="relative">
                {/* Timeline node node */}
                <div className={`absolute -left-[35px] top-0.5 w-6.5 h-6.5 rounded-full border flex items-center justify-center shadow-md ${getTimelineBorder(entry.type)}`}>
                  {getTimelineIcon(entry.type)}
                </div>

                {/* Event info */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono bg-dark-hover border border-dark-border/40 text-slate-400 px-1.5 py-0.5 rounded">
                      {entry.timestamp}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-200 font-mono">
                      {entry.title}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {entry.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
