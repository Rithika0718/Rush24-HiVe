export interface ServiceTelemetry {
  cpu: number;
  memory: number;
  latency: number;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  status_message: string;
}

export interface ServiceNode {
  id: string;
  label: string;
  role: 'gateway' | 'service' | 'database' | 'cache' | 'external';
  telemetry: ServiceTelemetry;
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
}

export interface DependencyGraph {
  nodes: ServiceNode[];
  edges: DependencyEdge[];
}

export interface TimelineEntry {
  timestamp: string;
  type: 'detection' | 'debate' | 'analysis' | 'recovery' | 'resolution' | 'chaos';
  title: string;
  description: string;
}

export interface DebateMessage {
  timestamp: string;
  agent_name: string;
  agent_role: string;
  message: string;
  sentiment: 'analytical' | 'cautious' | 'alarmed' | 'remedial' | 'summarizing' | 'historical';
}

export interface RcaDetails {
  root_cause: string;
  impact: string;
  affected_services: string[];
  timeline: string[];
  recovery: string;
  recommendations: string[];
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'WARNING' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'RESOLVED';
}

export interface MetricPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  latency: number;
}

export interface SimulationState {
  overall_status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  services: Record<string, ServiceNode>;
  dependency_graph: DependencyGraph;
  timeline: TimelineEntry[];
  debate_log: DebateMessage[];
  rca: RcaDetails | null;
  alerts: Alert[];
  metrics_history: Record<string, MetricPoint[]>;
}
