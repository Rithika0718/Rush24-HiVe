from pydantic import BaseModel
from typing import List, Dict, Optional

class ServiceTelemetry(BaseModel):
    cpu: float
    memory: float
    latency: float  # in ms
    status: str     # "HEALTHY", "WARNING", "CRITICAL"
    status_message: str

class ServiceNode(BaseModel):
    id: str
    label: str
    role: str       # "gateway", "service", "database", "cache", "external"
    telemetry: ServiceTelemetry

class DependencyEdge(BaseModel):
    id: str
    source: str
    target: str

class DependencyGraph(BaseModel):
    nodes: List[ServiceNode]
    edges: List[DependencyEdge]

class TimelineEntry(BaseModel):
    timestamp: str
    type: str       # "detection", "debate", "analysis", "recovery", "resolution", "chaos"
    title: str
    description: str

class DebateMessage(BaseModel):
    timestamp: str
    agent_name: str
    agent_role: str
    message: str
    sentiment: str  # "analytical", "cautious", "alarmed", "remedial", "summarizing", "historical"

class RcaDetails(BaseModel):
    root_cause: str
    impact: str
    affected_services: List[str]
    timeline: List[str]
    recovery: str
    recommendations: List[str]

class Alert(BaseModel):
    id: str
    timestamp: str
    severity: str    # "WARNING", "CRITICAL"
    message: str
    status: str      # "ACTIVE", "RESOLVED"

class MetricPoint(BaseModel):
    timestamp: str
    cpu: float
    memory: float
    latency: float

class SimulationState(BaseModel):
    overall_status: str  # "HEALTHY", "DEGRADED", "CRITICAL"
    services: Dict[str, ServiceNode]
    dependency_graph: DependencyGraph
    timeline: List[TimelineEntry]
    debate_log: List[DebateMessage]
    rca: Optional[RcaDetails] = None
    alerts: List[Alert]
    metrics_history: Dict[str, List[MetricPoint]]  # key is service_id
