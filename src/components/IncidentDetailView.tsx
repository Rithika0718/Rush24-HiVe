import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Bot, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RotateCw, 
  X, 
  FileText, 
  Activity, 
  Zap,
  Code,
  Copy,
  Check,
  Cpu,
  Layers
} from 'lucide-react';
import { CloudIncident, PlaybookStep, AgentActivityTrace } from '../types';

interface IncidentDetailViewProps {
  incident: CloudIncident;
  onClose?: () => void;
  onUpdateIncident: (updated: CloudIncident) => void;
  autonomousMode: boolean;
}

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incident,
  onClose,
  onUpdateIncident,
  autonomousMode,
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'playbook' | 'logs' | 'postmortem'>('agents');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [executingStepId, setExecutingStepId] = useState<string | null>(null);
  const [terminalStdout, setTerminalStdout] = useState<string[]>([]);
  const [copiedPostMortem, setCopiedPostMortem] = useState(false);

  // Trigger Gemini Multi-Agent Re-Analysis
  const handleTriggerAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/agent/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: incident.title,
          cloudProvider: incident.cloudProvider,
          service: incident.service,
          region: incident.region,
          metrics: incident.metrics,
          rawLogs: incident.rawLogs,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        const { rootCause, agentTraces, playbook, postMortem } = resData.data;

        const newTraces: AgentActivityTrace[] = (agentTraces || []).map((t: any, idx: number) => ({
          id: `tr-gen-${Date.now()}-${idx}`,
          agentRole: t.agentRole || 'log_investigator',
          agentName: t.agentName || 'Aether Agent',
          timestamp: new Date().toLocaleTimeString(),
          action: t.action || 'Investigation',
          details: t.details || 'Processed log payload',
          status: 'completed',
          codeSnippet: t.codeSnippet,
        }));

        const updatedIncident: CloudIncident = {
          ...incident,
          status: incident.status === 'RESOLVED' ? 'RESOLVED' : 'REMEDIATING',
          rootCauseAnalysis: rootCause ? {
            summary: rootCause.summary || incident.rootCauseAnalysis?.summary || 'Analysis completed',
            primaryCause: rootCause.primaryCause || incident.rootCauseAnalysis?.primaryCause || 'Unknown cause',
            affectedComponents: rootCause.affectedComponents || incident.rootCauseAnalysis?.affectedComponents || [incident.service],
            confidenceScore: rootCause.confidenceScore || 95,
          } : incident.rootCauseAnalysis,
          agentTraces: [...incident.agentTraces, ...newTraces],
          playbook: playbook ? {
            title: playbook.title || 'Auto Playbook',
            summary: playbook.summary || 'Generated auto-remediation sequence',
            requiresHumanApproval: playbook.requiresHumanApproval ?? true,
            steps: (playbook.steps || []).map((s: any, idx: number) => ({
              id: `step-${Date.now()}-${idx}`,
              title: s.title || `Step ${idx + 1}`,
              command: s.command || 'echo "Executing step..."',
              type: s.type || 'kubectl',
              riskLevel: s.riskLevel || 'MEDIUM',
              status: 'pending',
            })),
          } : incident.playbook,
          postMortem: postMortem ? {
            executiveSummary: postMortem.executiveSummary || 'Post-mortem report compiled.',
            mttrMinutes: postMortem.mttrMinutes || 12,
            impactDescription: postMortem.impactDescription || 'Isolated service degradation.',
            preventionSteps: postMortem.preventionSteps || ['Enforce policy checks'],
          } : incident.postMortem,
        };

        onUpdateIncident(updatedIncident);
      }
    } catch (err) {
      console.error('Error during AI analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Execute a specific Playbook Step
  const handleExecuteStep = async (step: PlaybookStep) => {
    setExecutingStepId(step.id);
    try {
      const res = await fetch('/api/agent/execute-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: step.command,
          stepTitle: step.title,
          type: step.type,
        }),
      });

      const resData = await res.json();
      if (resData.success) {
        setTerminalStdout((prev) => [...prev, resData.stdout]);

        // Update step state in incident
        if (incident.playbook) {
          const updatedSteps = incident.playbook.steps.map((s) => {
            if (s.id === step.id) {
              return { ...s, status: 'success' as const, output: resData.stdout };
            }
            return s;
          });

          const allSuccess = updatedSteps.every((s) => s.status === 'success');

          const updatedIncident: CloudIncident = {
            ...incident,
            status: allSuccess ? 'RESOLVED' : 'REMEDIATING',
            resolvedAt: allSuccess ? new Date().toISOString() : incident.resolvedAt,
            playbook: {
              ...incident.playbook,
              steps: updatedSteps,
            },
            agentTraces: [
              ...incident.agentTraces,
              {
                id: `exec-${Date.now()}`,
                agentRole: 'remediation_agent',
                agentName: 'Aether Auto-Executor',
                timestamp: new Date().toLocaleTimeString(),
                action: `Executed Step: ${step.title}`,
                details: `Command: "${step.command}" completed with return code 0.`,
                status: 'completed',
              }
            ]
          };

          onUpdateIncident(updatedIncident);
        }
      }
    } catch (err) {
      console.error('Execution failed:', err);
    } finally {
      setExecutingStepId(null);
    }
  };

  // Copy Post-Mortem Report
  const handleCopyPostMortem = () => {
    if (!incident.postMortem) return;
    const reportText = `
[AETHEROPS INCIDENT POST-MORTEM REPORT]
Incident ID: ${incident.id}
Title: ${incident.title}
Provider: ${incident.cloudProvider} (${incident.region})
Service: ${incident.service}
Severity: ${incident.severity}
Status: ${incident.status}
MTTR: ${incident.postMortem.mttrMinutes} minutes

Executive Summary:
${incident.postMortem.executiveSummary}

Root Cause:
${incident.rootCauseAnalysis?.summary || 'N/A'}

Impact Description:
${incident.postMortem.impactDescription}

Preventative Action Items:
${incident.postMortem.preventionSteps.map((s) => `- ${s}`).join('\n')}
`;
    navigator.clipboard.writeText(reportText);
    setCopiedPostMortem(true);
    setTimeout(() => setCopiedPostMortem(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      
      {/* Header Bar */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-slate-400 font-bold">{incident.id}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {incident.cloudProvider} ({incident.region})
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100">{incident.title}</h2>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleTriggerAnalysis}
            disabled={isAnalyzing}
            className="px-3.5 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Swarm Re-Analyzing...' : 'AI Swarm Re-Analyze'}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Primary Metrics Bar */}
      <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
        <div className="flex flex-col">
          <span className="text-slate-500">Target Service</span>
          <span className="font-bold text-slate-200">{incident.service}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500">CPU / Memory Load</span>
          <span className="font-bold text-slate-200">
            CPU: {incident.metrics.cpuUsagePct}% | RAM: {incident.metrics.memoryUsagePct}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500">Error Rate & Latency</span>
          <span className={`font-bold ${incident.metrics.errorRatePct > 10 ? 'text-rose-400' : 'text-slate-200'}`}>
            {incident.metrics.errorRatePct}% errors | {incident.metrics.latencyMs}ms
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-slate-500">AI Confidence Index</span>
          <span className="font-bold text-cyan-400">
            {incident.rootCauseAnalysis?.confidenceScore || 95}% Verified
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 flex space-x-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('agents')}
          className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'agents'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Collaborative Swarm Stream ({incident.agentTraces.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'playbook'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Remediation Playbook ({incident.playbook?.steps.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'logs'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Raw Telemetry Logs ({incident.rawLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('postmortem')}
          className={`py-3 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'postmortem'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Post-Mortem & Prevention</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        
        {/* TAB 1: AGENTS COLLABORATION STREAM */}
        {activeTab === 'agents' && (
          <div className="space-y-6">
            
            {/* Root Cause Card */}
            {incident.rootCauseAnalysis && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center">
                  <Activity className="w-4 h-4 mr-1.5" /> Root Cause Diagnosis
                </h3>
                <p className="text-sm font-semibold text-slate-100">{incident.rootCauseAnalysis.summary}</p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Primary Cause:</span>
                    <span className="text-rose-300 font-mono font-medium">{incident.rootCauseAnalysis.primaryCause}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Affected Microservices:</span>
                    <span className="text-slate-200 font-mono">{incident.rootCauseAnalysis.affectedComponents.join(', ')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Agent Activity Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Agent Swarm Activity Log
              </h3>

              {incident.agentTraces.map((trace) => {
                let badgeColor = 'bg-cyan-950 text-cyan-400 border-cyan-800';
                if (trace.agentRole === 'sentinel') badgeColor = 'bg-amber-950 text-amber-400 border-amber-800';
                if (trace.agentRole === 'remediation_agent') badgeColor = 'bg-purple-950 text-purple-400 border-purple-800';
                if (trace.agentRole === 'post_mortem') badgeColor = 'bg-emerald-950 text-emerald-400 border-emerald-800';

                return (
                  <div key={trace.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 relative pl-12">
                    <div className="absolute left-4 top-4 p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                      <Bot className="w-4 h-4" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-100">{trace.agentName}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${badgeColor}`}>
                          {trace.agentRole}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">{trace.timestamp}</span>
                    </div>

                    <p className="text-xs font-semibold text-cyan-300 mt-1">{trace.action}</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{trace.details}</p>

                    {trace.codeSnippet && (
                      <div className="mt-3 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                        <pre>{trace.codeSnippet}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 2: REMEDIATION PLAYBOOK */}
        {activeTab === 'playbook' && (
          <div className="space-y-6">
            
            {incident.playbook ? (
              <div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-sm text-slate-100">{incident.playbook.title}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      incident.playbook.requiresHumanApproval ? 'bg-amber-950 text-amber-400 border border-amber-800' : 'bg-emerald-950 text-emerald-400'
                    }`}>
                      {incident.playbook.requiresHumanApproval ? 'Requires Operator Approval' : 'Auto-Execution Authorized'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{incident.playbook.summary}</p>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  {incident.playbook.steps.map((step, idx) => (
                    <div key={step.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start space-x-3">
                          <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-slate-200">{step.title}</h4>
                            <div className="mt-1 flex items-center space-x-2">
                              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                                {step.type}
                              </span>
                              <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                step.riskLevel === 'HIGH' ? 'bg-rose-950 text-rose-400' : step.riskLevel === 'MEDIUM' ? 'bg-amber-950 text-amber-400' : 'bg-emerald-950 text-emerald-400'
                              }`}>
                                Risk: {step.riskLevel}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Step Action Button */}
                        <div className="self-end sm:self-center">
                          {step.status === 'success' ? (
                            <span className="px-3 py-1.5 text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl flex items-center space-x-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Executed Successfully</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleExecuteStep(step)}
                              disabled={executingStepId === step.id}
                              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-md transition-all flex items-center space-x-1.5"
                            >
                              <Play className={`w-3.5 h-3.5 ${executingStepId === step.id ? 'animate-spin' : ''}`} />
                              <span>{executingStepId === step.id ? 'Running Command...' : 'Execute Step'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Command Code Box */}
                      <div className="mt-3 bg-slate-900 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto">
                        <span className="text-slate-500 select-none">$ </span>
                        {step.command}
                      </div>

                      {/* Step Execution Output */}
                      {step.output && (
                        <div className="mt-3 bg-slate-950 p-3 rounded-lg border border-emerald-900/60 font-mono text-[11px] text-emerald-300">
                          <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Execution Terminal Output:</div>
                          <pre className="whitespace-pre-wrap">{step.output}</pre>
                        </div>
                      )}

                    </div>
                  ))}
                </div>

                {/* Output Stream Terminal Console */}
                {terminalStdout.length > 0 && (
                  <div className="mt-6 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-400">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                      <span className="text-slate-400 font-bold flex items-center">
                        <Terminal className="w-4 h-4 mr-1.5 text-cyan-400" /> AetherOps Live Execution Terminal
                      </span>
                      <span className="text-[10px] text-slate-500">TTY: /dev/pts/1</span>
                    </div>
                    <pre className="whitespace-pre-wrap max-h-48 overflow-y-auto space-y-1">
                      {terminalStdout.join('\n\n')}
                    </pre>
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No playbook generated yet. Click "AI Swarm Re-Analyze" to generate a self-healing sequence.</p>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: RAW LOGS */}
        {activeTab === 'logs' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 overflow-x-auto">
            <div className="text-slate-500 text-[10px] font-bold uppercase mb-2">Ingested Telemetry Stream</div>
            {incident.rawLogs.map((log, idx) => (
              <div key={idx} className="hover:bg-slate-900 p-1 rounded">
                <span className="text-slate-600 select-none mr-2">[{idx + 1}]</span>
                <span className={log.includes('ERROR') || log.includes('FATAL') ? 'text-rose-400 font-semibold' : log.includes('WARN') ? 'text-amber-400' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: POST-MORTEM REPORT */}
        {activeTab === 'postmortem' && (
          <div className="space-y-6">
            {incident.postMortem ? (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-100 flex items-center">
                    <Zap className="w-5 h-5 text-amber-400 mr-2" /> Executive Post-Mortem & Preventative Report
                  </h3>
                  <button
                    onClick={handleCopyPostMortem}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors flex items-center space-x-1.5"
                  >
                    {copiedPostMortem ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPostMortem ? 'Copied Report' : 'Copy Post-Mortem'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block">Mean Time To Resolve (MTTR):</span>
                    <span className="text-emerald-400 font-bold text-sm">{incident.postMortem.mttrMinutes} Minutes</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Business & SLA Impact:</span>
                    <span className="text-slate-200 font-medium">{incident.postMortem.impactDescription}</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Executive Summary</h4>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900 p-3 rounded-lg border border-slate-800">
                    {incident.postMortem.executiveSummary}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preventative Action Items</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {incident.postMortem.preventionSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Post-mortem will be compiled automatically upon incident resolution.</p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};
