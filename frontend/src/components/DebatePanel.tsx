import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Terminal, Eye, BrainCircuit, Activity, HeartHandshake, History, FileSpreadsheet } from 'lucide-react';
import { DebateMessage } from '../types';

interface DebatePanelProps {
  debateLog: DebateMessage[];
}

export default function DebatePanel({ debateLog }: DebatePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom when new messages arrive
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [debateLog]);

  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Monitor Agent': return <Eye size={16} className="text-rose-400" />;
      case 'Dependency Agent': return <BrainCircuit size={16} className="text-blue-400" />;
      case 'Performance Agent': return <Activity size={16} className="text-emerald-400" />;
      case 'Risk Agent': return <ShieldAlert size={16} className="text-amber-400" />;
      case 'Memory Agent': return <History size={16} className="text-cyan-400" />;
      case 'Planner Agent': return <Terminal size={16} className="text-indigo-400" />;
      case 'Recovery Agent': return <HeartHandshake size={16} className="text-teal-400" />;
      case 'Reporter Agent': return <FileSpreadsheet size={16} className="text-purple-400" />;
      default: return <BrainCircuit size={16} className="text-slate-400" />;
    }
  };

  const getAgentBg = (name: string) => {
    switch (name) {
      case 'Monitor Agent': return 'bg-rose-500/10 border-rose-500/20';
      case 'Dependency Agent': return 'bg-blue-500/10 border-blue-500/20';
      case 'Performance Agent': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'Risk Agent': return 'bg-amber-500/10 border-amber-500/20';
      case 'Memory Agent': return 'bg-cyan-500/10 border-cyan-500/20';
      case 'Planner Agent': return 'bg-indigo-500/10 border-indigo-500/20';
      case 'Recovery Agent': return 'bg-teal-500/10 border-teal-500/20';
      case 'Reporter Agent': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-dark-hover border-dark-border';
    }
  };

  return (
    <div className="bg-dark-panel border border-dark-border rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-dark-border flex items-center justify-between shrink-0 bg-[#0e1423]/50">
        <div>
          <h3 className="font-mono text-sm font-semibold text-slate-100 flex items-center gap-2">
            <BrainCircuit size={16} className="text-brand-500" />
            AI Incident Debate Console
          </h3>
          <p className="text-[10px] text-slate-400 font-mono">Autonomous multi-agent consensus log</p>
        </div>
        <span className="text-[10px] bg-brand-500/15 text-brand-500 font-semibold px-2 py-0.5 rounded border border-brand-500/25 uppercase font-mono">
          {debateLog.length} Threads Active
        </span>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[300px] max-h-[500px]"
      >
        <AnimatePresence initial={false}>
          {debateLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-10 h-10 rounded-full border border-dark-border flex items-center justify-center bg-dark-bg text-slate-500 mb-3">
                <BrainCircuit size={20} />
              </div>
              <p className="text-xs text-slate-400 font-mono">War room is currently inactive.</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Inject chaos to watch the agents debate the incident.</p>
            </div>
          ) : (
            debateLog.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className={`p-3.5 rounded-xl border flex gap-3 ${getAgentBg(msg.agent_name)}`}
              >
                {/* Agent Avatar Badge */}
                <div className="w-8 h-8 rounded-lg bg-dark-bg border border-dark-border flex items-center justify-center shrink-0 shadow-inner">
                  {getAgentIcon(msg.agent_name)}
                </div>

                {/* Message Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-baseline gap-1.5 min-w-0">
                      <span className="text-xs font-semibold text-slate-200 font-mono truncate">
                        {msg.agent_name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono truncate">
                        ({msg.agent_role})
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono whitespace-nowrap">
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
