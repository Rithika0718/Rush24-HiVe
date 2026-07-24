export type CloudProvider = 'AWS' | 'GCP' | 'Azure' | 'Kubernetes';

export type IncidentSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'TRIAGING' 
  | 'ANALYZING' 
  | 'REMEDIATING' 
  | 'RESOLVED' 
  | 'FAILED';

export type AgentRole = 
  | 'sentinel'            // Health Sentinel Agent
  | 'log_investigator'    // Log & Stacktrace Analyzer
  | 'remediation_agent'   // Self-Healing Playbook Agent
  | 'post_mortem';        // Incident Auditor & Advisory Agent

export interface AgentActivityTrace {
  id: string;
  agentRole: AgentRole;
  agentName: string;
  timestamp: string;
  action: string;
  details: string;
  status: 'thinking' | 'executing' | 'completed' | 'warning';
  codeSnippet?: string;
}

export interface MetricSnapshot {
  cpuUsagePct: number;
  memoryUsagePct: number;
  errorRatePct: number;
  latencyMs: number;
  requestsPerSec: number;
}

export interface PlaybookStep {
  id: string;
  title: string;
  command: string;
  type: 'kubectl' | 'aws_cli' | 'gcloud' | 'terraform' | 'script';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'pending' | 'running' | 'success' | 'failed';
  output?: string;
}

export interface Playbook {
  title: string;
  summary: string;
  requiresHumanApproval: boolean;
  steps: PlaybookStep[];
  rollbackSteps?: PlaybookStep[];
}

export interface CloudIncident {
  id: string;
  title: string;
  cloudProvider: CloudProvider;
  region: string;
  service: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  detectedAt: string;
  resolvedAt?: string;
  metrics: MetricSnapshot;
  rawLogs: string[];
  rootCauseAnalysis?: {
    summary: string;
    primaryCause: string;
    affectedComponents: string[];
    confidenceScore: number; // 0 to 100
  };
  playbook?: Playbook;
  agentTraces: AgentActivityTrace[];
  postMortem?: {
    executiveSummary: string;
    mttrMinutes: number;
    impactDescription: string;
    preventionSteps: string[];
  };
}

export interface ServiceNode {
  id: string;
  name: string;
  provider: CloudProvider;
  region: string;
  type: 'cluster' | 'database' | 'microservice' | 'gateway' | 'cache' | 'queue';
  status: 'HEALTHY' | 'DEGRADED' | 'INCIDENT';
  cpu: number;
  memory: number;
  latency: number;
  reqRate: number;
  dependencies: string[]; // IDs of nodes this node connects to
}

export interface CloudIntegration {
  provider: CloudProvider;
  name: string;
  connected: boolean;
  region: string;
  resourceCount: number;
  lastSync: string;
  credentialsConfigured: boolean;
}

export interface ChaosScenario {
  id: string;
  title: string;
  provider: CloudProvider;
  service: string;
  description: string;
  severity: IncidentSeverity;
  logs: string[];
  metrics: MetricSnapshot;
}
