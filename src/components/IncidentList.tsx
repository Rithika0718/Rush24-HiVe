import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Bot, 
  Terminal,
  Activity,
  Cpu
} from 'lucide-react';
import { CloudIncident, IncidentSeverity, IncidentStatus, CloudProvider } from '../types';

interface IncidentListProps {
  incidents: CloudIncident[];
  onSelectIncident: (incident: CloudIncident) => void;
  selectedIncidentId?: string;
  onOpenChaosModal: () => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  onSelectIncident,
  selectedIncidentId,
  onOpenChaosModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<IncidentStatus | 'ALL'>('ALL');

  const filtered = incidents.filter((inc) => {
    const matchesSearch = 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'ALL' || inc.severity === severityFilter;
    const matchesStatus = statusFilter === 'ALL' || inc.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-rose-950 text-rose-400 border border-rose-800 animate-pulse">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-950 text-amber-400 border border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-yellow-950 text-yellow-400 border border-yellow-800">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-950 text-blue-400 border border-blue-800">LOW</span>;
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case 'DETECTED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-950 text-rose-300 border border-rose-800">Detected</span>;
      case 'TRIAGING':
      case 'ANALYZING':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center space-x-1"><Activity className="w-3 h-3 animate-spin mr-1" /> Analyzing</span>;
      case 'REMEDIATING':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-purple-950 text-purple-300 border border-purple-800 flex items-center space-x-1"><Terminal className="w-3 h-3 mr-1" /> Remediation Active</span>;
      case 'RESOLVED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center space-x-1"><CheckCircle2 className="w-3 h-3 mr-1" /> Self-Healed</span>;
      case 'FAILED':
        return <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-red-950 text-red-400 border border-red-800">Failed</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-100">Active Infrastructure Incident Feed</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time alert stream continuously triaged by collaborative AetherOps agents.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search incident, service, logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 w-48 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ANALYZING">Analyzing</option>
            <option value="REMEDIATING">Remediating</option>
            <option value="RESOLVED">Resolved</option>
          </select>

        </div>
      </div>

      {/* Incident List Table / Cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/50">
          <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-300">No matching incidents found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Your cloud environment is operating within baseline stability limits.</p>
          <button
            onClick={onOpenChaosModal}
            className="px-4 py-2 text-xs font-medium bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md transition-all"
          >
            Simulate Cloud Incident Now
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inc) => {
            const isSelected = inc.id === selectedIncidentId;
            const isUnresolved = inc.status !== 'RESOLVED';

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500'
                    : isUnresolved
                    ? 'bg-slate-950/80 border-slate-800 hover:border-rose-700/60 hover:bg-slate-900'
                    : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  
                  {/* Left Metadata */}
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {inc.severity === 'CRITICAL' ? (
                        <AlertCircle className="w-5 h-5 text-rose-500" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 text-amber-500" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-xs font-bold text-slate-400">{inc.id}</span>
                        <h3 className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {inc.title}
                        </h3>
                      </div>

                      <div className="mt-1.5 flex items-center space-x-3 text-xs text-slate-400 flex-wrap gap-y-1">
                        <span className="font-mono text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {inc.cloudProvider} ({inc.region})
                        </span>
                        <span>Service: <strong className="text-slate-200 font-mono">{inc.service}</strong></span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-500" />
                          {new Date(inc.detectedAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status & Badges */}
                  <div className="flex items-center space-x-3 self-end md:self-center">
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center space-x-2">
                        {getSeverityBadge(inc.severity)}
                        {getStatusBadge(inc.status)}
                      </div>

                      {inc.rootCauseAnalysis && (
                        <span className="text-[10px] text-cyan-400 font-mono">
                          Confidence: {inc.rootCauseAnalysis.confidenceScore}%
                        </span>
                      )}
                    </div>

                    <div className="p-2 text-slate-500 group-hover:text-cyan-400 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>

                </div>

                {/* Agent Activity Preview pill */}
                {inc.agentTraces.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center space-x-2 truncate pr-4">
                      <Bot className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                      <span className="font-mono text-[11px] text-slate-300 truncate">
                        <strong>[{inc.agentTraces[inc.agentTraces.length - 1].agentName}]</strong>: {inc.agentTraces[inc.agentTraces.length - 1].details}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                      {inc.agentTraces.length} Agent Actions
                    </span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
