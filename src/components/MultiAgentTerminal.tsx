import React, { useState } from 'react';
import { 
  Terminal, 
  Bot, 
  ShieldAlert, 
  Search, 
  Zap, 
  Cpu, 
  Filter,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AgentActivityTrace, AgentRole } from '../types';

interface MultiAgentTerminalProps {
  traces: AgentActivityTrace[];
  onTriggerGlobalHealthCheck: () => void;
}

export const MultiAgentTerminal: React.FC<MultiAgentTerminalProps> = ({
  traces,
  onTriggerGlobalHealthCheck,
}) => {
  const [filterRole, setFilterRole] = useState<AgentRole | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const filtered = traces.filter((t) => {
    const matchesRole = filterRole === 'ALL' || t.agentRole === filterRole;
    const matchesSearch = 
      t.action.toLowerCase().includes(search.toLowerCase()) ||
      t.details.toLowerCase().includes(search.toLowerCase()) ||
      t.agentName.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: AgentRole) => {
    switch (role) {
      case 'sentinel':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-800">Sentinel</span>;
      case 'log_investigator':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-950 text-cyan-400 border border-cyan-800">Log Investigator</span>;
      case 'remediation_agent':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-950 text-purple-400 border border-purple-800">Remediation Agent</span>;
      case 'post_mortem':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-800">Post-Mortem</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-100">Collaborative Agent Swarm Stream</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Watch specialized AI SRE agents communicate, inspect stacktraces, and execute self-healing steps in real-time.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onTriggerGlobalHealthCheck}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Request Global Health Sweep</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
        
        {/* Role Tabs */}
        <div className="flex items-center space-x-1 flex-wrap gap-y-1">
          {(['ALL', 'sentinel', 'log_investigator', 'remediation_agent', 'post_mortem'] as const).map((role) => (
            <button
              key={role}
              onClick={() => setFilterRole(role)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all capitalize ${
                filterRole === role
                  ? 'bg-slate-800 text-cyan-300 border border-cyan-800/80 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {role === 'ALL' ? 'All Swarm Agents' : role.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agent traces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 w-full focus:outline-none focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Terminal Trace Feed */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-4 max-h-[600px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No agent traces match the filter criteria.
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t.id} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">{t.agentName}</span>
                  {getRoleBadge(t.agentRole)}
                </div>
                <span className="text-[11px] text-slate-500">{t.timestamp}</span>
              </div>

              <div className="text-cyan-300 font-semibold">{t.action}</div>
              <div className="text-slate-300 text-[11px] leading-relaxed">{t.details}</div>

              {t.codeSnippet && (
                <div className="p-2 bg-slate-950 border border-slate-800/90 rounded text-emerald-400 text-[11px] overflow-x-auto">
                  <pre>{t.codeSnippet}</pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
};
