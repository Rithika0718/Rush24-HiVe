export type ServiceStatus = "Healthy" | "Degraded" | "Critical";

export type IncidentType =
  | "cpu_spike"
  | "memory_leak"
  | "latency_spike"
  | "network_partition"
  | "db_connection_exhaustion"
  | "service_crash";

export interface ServiceState {
  id: string;
  name: string;
  gcp_resource_type: string;
  status: ServiceStatus;
  cpu_percent: number;
  memory_percent: number;
  latency_ms: number;
  error_rate_percent: number;
  dependencies: string[];
  description: string;
  last_updated: string;
}

export interface ActiveIncident {
  id: string;
  target_service: string;
  type: string;
  started_at: string;
  impacted_services: string[];
  details: string;
}

export interface SystemState {
  system_health: "OPERATIONAL" | "DEGRADED" | "CRITICAL_INCIDENT";
  active_incidents_count: number;
  gemini_api_configured?: boolean;
  services: Record<string, ServiceState>;
  active_incidents: ActiveIncident[];
  timestamp: string;
}

export interface TopologyNode {
  id: string;
  label: string;
  type: string;
  status: ServiceStatus;
  cpu: number;
  latency: number;
}

export interface TopologyEdge {
  from: string;
  to: string;
  label: string;
}

export interface TopologyData {
  nodes: TopologyNode[];
  edges: TopologyEdge[];
}

export interface AgentLog {
  agent: string;
  timestamp: string;
  action: string;
  summary: string;
}

export interface ConsensusCandidate {
  option_id: string;
  action: string;
  label: string;
  resolution_confidence: string;
  risk_score: string;
  cost_usd: string;
  calculated_utility: number;
}

export interface IncidentState {
  incident_id: string;
  affected_service: string;
  dependency_impact?: string[];
  monitor_findings?: {
    timestamp: string;
    target_service: string;
    service_name: string;
    gcp_resource: string;
    current_status: string;
    metrics: {
      cpu_percent: number;
      memory_percent: number;
      latency_ms: number;
      error_rate_percent: number;
    };
    anomalies_detected: string[];
    severity: string;
  };
  diagnosis_report?: {
    target_service: string;
    root_cause_hypothesis: string;
    primary_failure_vector: string;
    cascading_impact_summary: string;
    downstream_impacted_services: string[];
    confidence_score: number;
  };
  resource_options?: Array<{
    option_id: string;
    action: string;
    label: string;
    mechanism: string;
    expected_time_sec: number;
  }>;
  cost_estimates?: Record<string, any>;
  risk_estimates?: Record<string, any>;
  traffic_options?: Array<{
    option_id: string;
    action: string;
    label: string;
    mechanism: string;
    status: string;
  }>;
  consensus_decision?: {
    selected_action: string;
    selected_label: string;
    winning_utility_score: number;
    ranking_matrix: ConsensusCandidate[];
    consensus_rationale: string;
  };
  recovery_action?: string;
  recovery_result?: {
    status: string;
    service: string;
    action_executed: string;
    new_health: string;
    timestamp: string;
  };
  final_report?: {
    title: string;
    generated_at: string;
    author: string;
    report_markdown: string;
    executive_summary: string;
  };
  status: string;
  agent_logs: AgentLog[];
}
