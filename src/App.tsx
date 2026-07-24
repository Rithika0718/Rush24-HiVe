import React, { useState } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Zap, 
  Layers, 
  Cpu, 
  CheckCircle2, 
  Flame, 
  Terminal, 
  Bot,
  RefreshCw,
  Server,
  ArrowRight
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { TopologyMap } from './components/TopologyMap';
import { TelemetryCharts } from './components/TelemetryCharts';
import { IncidentList } from './components/IncidentList';
import { IncidentDetailView } from './components/IncidentDetailView';
import { MultiAgentTerminal } from './components/MultiAgentTerminal';
import { CloudProvidersModal } from './components/CloudProvidersModal';
import { ChaosEngineeringPanel } from './components/ChaosEngineeringPanel';
import { AgentChatDrawer } from './components/AgentChatDrawer';

import { 
  INITIAL_INCIDENTS, 
  INITIAL_NODES, 
  INITIAL_INTEGRATIONS 
} from './data/mockData';
import { 
  CloudIncident, 
  ServiceNode, 
  CloudIntegration, 
  ChaosScenario, 
  AgentActivityTrace 
} from './types';

export default function App() {
  const [incidents, setIncidents] = useState<CloudIncident[]>(INITIAL_INCIDENTS);
  const [nodes, setNodes] = useState<ServiceNode[]>(INITIAL_NODES);
  const [integrations, setIntegrations] = useState<CloudIntegration[]>(INITIAL_INTEGRATIONS);
  
  const [selectedIncident, setSelectedIncident] = useState<CloudIncident | null>(INITIAL_INCIDENTS[0]);
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(INITIAL_NODES[2]);

  const [activeView, setActiveView] = useState<'dashboard' | 'topology' | 'incidents' | 'terminal'>('dashboard');
  const [autonomousMode, setAutonomousMode] = useState<boolean>(true);

  // Modals & Drawers
  const [isProvidersOpen, setIsProvidersOpen] = useState<boolean>(false);
  const [isChaosOpen, setIsChaosOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Count active unresolved incidents
  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED').length;

  // Aggregate all agent traces across incidents for global terminal
  const allTraces: AgentActivityTrace[] = incidents.flatMap((i) => i.agentTraces);

  // Toggle Cloud Integration
  const handleToggleIntegration = (providerName: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.provider === providerName ? { ...item, connected: !item.connected } : item
      )
    );
  };

  // Inject Chaos Scenario
  const handleInjectScenario = (scenario: ChaosScenario) => {
    const newIncident: CloudIncident = {
      id: `INC-${Math.floor(8900 + Math.random() * 1000)}`,
      title: scenario.title,
      cloudProvider: scenario.provider,
      region: 'us-east-1',
      service: scenario.service,
      severity: scenario.severity,
      status: 'ANALYZING',
      detectedAt: new Date().toISOString(),
      metrics: scenario.metrics,
      rawLogs: scenario.logs,
      agentTraces: [
        {
          id: `tr-s-${Date.now()}`,
          agentRole: 'sentinel',
          agentName: 'Sentinel Agent-Prime',
          timestamp: new Date().toLocaleTimeString(),
          action: 'Telemetry Anomaly Detected',
          details: `Injected telemetry failure: ${scenario.title}. Triggering multi-agent diagnosis pipeline.`,
          status: 'completed',
        }
      ],
      rootCauseAnalysis: {
        summary: `Chaos scenario triggered on ${scenario.service}: ${scenario.description}`,
        primaryCause: `Injected fault on ${scenario.provider} node`,
        affectedComponents: [scenario.service],
        confidenceScore: 92,
      },
      playbook: {
        title: `Self-Healing Sequence for ${scenario.service}`,
        summary: 'Automated remediation steps ready for execution.',
        requiresHumanApproval: !autonomousMode,
        steps: [
          {
            id: `step-c1-${Date.now()}`,
            title: `Restart and scale pods for ${scenario.service}`,
            command: `kubectl rollout restart deployment/${scenario.service} -n production`,
            type: 'kubectl',
            riskLevel: 'LOW',
            status: 'pending',
          },
          {
            id: `step-c2-${Date.now()}`,
            title: `Flush connection cache and verify endpoint health`,
            command: `gcloud compute target-pools get-health k8s-ingress-pool --region=us-central1`,
            type: 'gcloud',
            riskLevel: 'MEDIUM',
            status: 'pending',
          }
        ]
      }
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    // Update node status in topology
    setNodes((prev) =>
      prev.map((n) =>
        n.name === scenario.service ? { ...n, status: 'INCIDENT', cpu: scenario.metrics.cpuUsagePct, memory: scenario.metrics.memoryUsagePct } : n
      )
    );
  };

  // Inject Custom Prompt Incident
  const handleInjectCustomPrompt = async (promptText: string) => {
    const newId = `INC-${Math.floor(8900 + Math.random() * 1000)}`;
    const newIncident: CloudIncident = {
      id: newId,
      title: `Custom Prompt Incident: ${promptText.slice(0, 40)}...`,
      cloudProvider: 'Kubernetes',
      region: 'us-east-1',
      service: 'custom-workload-v1',
      severity: 'HIGH',
      status: 'ANALYZING',
      detectedAt: new Date().toISOString(),
      metrics: {
        cpuUsagePct: 88,
        memoryUsagePct: 84,
        errorRatePct: 14.2,
        latencyMs: 450,
        requestsPerSec: 1200,
      },
      rawLogs: [
        `[${new Date().toISOString()}] [ALARM] Custom incident prompt injected: "${promptText}"`,
        `[${new Date().toISOString()}] [AGENT_SENTINEL] Anomaly detected on custom-workload-v1 pod group`,
      ],
      agentTraces: [
        {
          id: `tr-cp-${Date.now()}`,
          agentRole: 'sentinel',
          agentName: 'Sentinel AI',
          timestamp: new Date().toLocaleTimeString(),
          action: 'Parsing Custom Prompt Context',
          details: `User prompt: "${promptText}". Triggering Gemini server agent analysis...`,
          status: 'completed',
        }
      ]
    };

    setIncidents((prev) => [newIncident, ...prev]);
    setSelectedIncident(newIncident);

    // Call server to generate full Gemini analysis for custom prompt
    try {
      const res = await fetch('/api/agent/collaborate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: promptText,
          cloudProvider: 'Kubernetes',
          service: 'custom-workload-v1',
          region: 'us-east-1',
          metrics: newIncident.metrics,
          rawLogs: newIncident.rawLogs,
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.data) {
        const { rootCause, agentTraces, playbook } = resData.data;
        setIncidents((prev) =>
          prev.map((inc) => {
            if (inc.id === newId) {
              return {
                ...inc,
                rootCauseAnalysis: rootCause ? {
                  summary: rootCause.summary,
                  primaryCause: rootCause.primaryCause,
                  affectedComponents: rootCause.affectedComponents,
                  confidenceScore: rootCause.confidenceScore || 94,
                } : inc.rootCauseAnalysis,
                playbook: playbook ? {
                  title: playbook.title || 'Custom Playbook',
                  summary: playbook.summary || 'Remediation steps',
                  requiresHumanApproval: true,
                  steps: (playbook.steps || []).map((s: any, idx: number) => ({
                    id: `st-cp-${Date.now()}-${idx}`,
                    title: s.title,
                    command: s.command,
                    type: s.type || 'kubectl',
                    riskLevel: s.riskLevel || 'MEDIUM',
                    status: 'pending',
                  })),
                } : inc.playbook,
              };
            }
            return inc;
          })
        );
      }
    } catch (err) {
      console.error('Error generating custom incident:', err);
    }
  };

  // Update incident callback
  const handleUpdateIncident = (updated: CloudIncident) => {
    setIncidents((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    if (selectedIncident?.id === updated.id) {
      setSelectedIncident(updated);
    }

    // If resolved, update topology node health
    if (updated.status === 'RESOLVED') {
      setNodes((prev) =>
        prev.map((n) =>
          n.name === updated.service ? { ...n, status: 'HEALTHY', cpu: 28, memory: 42 } : n
        )
      );
    }
  };

  // Trigger Global Health Check across nodes
  const handleTriggerGlobalHealthCheck = () => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        cpu: Math.floor(20 + Math.random() * 30),
        memory: Math.floor(35 + Math.random() * 25),
        latency: Math.floor(5 + Math.random() * 25),
      }))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      
      {/* Top Navbar */}
      <Navbar
        activeIncidentsCount={activeIncidentsCount}
        autonomousMode={autonomousMode}
        setAutonomousMode={setAutonomousMode}
        onOpenProviders={() => setIsProvidersOpen(true)}
        onOpenChaos={() => setIsChaosOpen(true)}
        onOpenTerminal={() => setActiveView('terminal')}
        onOpenChat={() => setIsChatOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Metric Overview Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
            <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Monitored Services</span>
              <span className="text-lg font-bold text-slate-100 font-mono">{nodes.length} Nodes</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
            <div className={`p-3 rounded-xl border ${activeIncidentsCount > 0 ? 'bg-rose-950 text-rose-400 border-rose-800' : 'bg-emerald-950 text-emerald-400 border-emerald-800'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Active Incidents</span>
              <span className={`text-lg font-bold font-mono ${activeIncidentsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {activeIncidentsCount} Critical
              </span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
            <div className="p-3 rounded-xl bg-purple-950 text-purple-400 border border-purple-800">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Swarm AI Agents</span>
              <span className="text-lg font-bold text-slate-100 font-mono">4 Active Swarms</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3 shadow-lg">
            <div className="p-3 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Avg MTTR</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">12.4 Minutes</span>
            </div>
          </div>

        </div>

        {/* VIEW 1: COMMAND CENTER (DASHBOARD) */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            
            {/* Telemetry Charts */}
            <TelemetryCharts />

            {/* Split View: Left Topology / Right Incidents */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-7">
                <TopologyMap
                  nodes={nodes}
                  onSelectNode={(node) => setSelectedNode(node)}
                  selectedNodeId={selectedNode?.id}
                />
              </div>

              <div className="lg:col-span-5">
                <IncidentList
                  incidents={incidents}
                  onSelectIncident={(inc) => {
                    setSelectedIncident(inc);
                    setActiveView('incidents');
                  }}
                  selectedIncidentId={selectedIncident?.id}
                  onOpenChaosModal={() => setIsChaosOpen(true)}
                />
              </div>

            </div>

          </div>
        )}

        {/* VIEW 2: TOPOLOGY ONLY */}
        {activeView === 'topology' && (
          <TopologyMap
            nodes={nodes}
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
        )}

        {/* VIEW 3: INCIDENTS DETAIL COMMAND CENTER */}
        {activeView === 'incidents' && (
          <div className="space-y-8">
            <IncidentList
              incidents={incidents}
              onSelectIncident={(inc) => setSelectedIncident(inc)}
              selectedIncidentId={selectedIncident?.id}
              onOpenChaosModal={() => setIsChaosOpen(true)}
            />

            {selectedIncident && (
              <IncidentDetailView
                incident={selectedIncident}
                onUpdateIncident={handleUpdateIncident}
                autonomousMode={autonomousMode}
              />
            )}
          </div>
        )}

        {/* VIEW 4: MULTI-AGENT TERMINAL */}
        {activeView === 'terminal' && (
          <MultiAgentTerminal
            traces={allTraces}
            onTriggerGlobalHealthCheck={handleTriggerGlobalHealthCheck}
          />
        )}

      </main>

      {/* Cloud Connectors Modal */}
      <CloudProvidersModal
        isOpen={isProvidersOpen}
        onClose={() => setIsProvidersOpen(false)}
        integrations={integrations}
        onToggleIntegration={handleToggleIntegration}
      />

      {/* Chaos Engineering Simulator Modal */}
      <ChaosEngineeringPanel
        isOpen={isChaosOpen}
        onClose={() => setIsChaosOpen(false)}
        onInjectScenario={handleInjectScenario}
        onInjectCustomPrompt={handleInjectCustomPrompt}
      />

      {/* AI Assistant Chat Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        selectedIncident={selectedIncident || undefined}
      />

    </div>
  );
}
