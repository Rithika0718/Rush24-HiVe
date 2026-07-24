import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from app.models.schemas import (
    SimulationState, ServiceNode, ServiceTelemetry, DependencyGraph,
    DependencyEdge, TimelineEntry, DebateMessage, Alert, RcaDetails, MetricPoint
)

class StateManager:
    def __init__(self):
        self.reset()

    def _get_timestamp(self, offset_seconds: int = 0) -> str:
        # Generate formatted timestamp
        t = datetime.now() + timedelta(seconds=offset_seconds)
        return t.strftime("%H:%M:%S")

    def reset(self):
        self.overall_status = "HEALTHY"
        self.timeline: List[TimelineEntry] = [
            TimelineEntry(
                timestamp=self._get_timestamp(-60),
                type="resolution",
                title="System Initialized",
                description="HIVE Nebula digital twin running. Monitoring systems active."
            )
        ]
        self.debate_log: List[DebateMessage] = []
        self.alerts: List[Alert] = []
        self.rca: Optional[RcaDetails] = None
        
        # Initialize Services
        self.services: Dict[str, ServiceNode] = {
            "gateway": ServiceNode(
                id="gateway", label="Gateway API", role="gateway",
                telemetry=ServiceTelemetry(cpu=12.5, memory=34.2, latency=18.0, status="HEALTHY", status_message="Routing requests normally")
            ),
            "auth_service": ServiceNode(
                id="auth_service", label="Auth Service", role="service",
                telemetry=ServiceTelemetry(cpu=8.0, memory=22.4, latency=12.5, status="HEALTHY", status_message="Tokens active")
            ),
            "auth_db": ServiceNode(
                id="auth_db", label="Auth Database", role="database",
                telemetry=ServiceTelemetry(cpu=5.2, memory=15.0, latency=2.1, status="HEALTHY", status_message="Primary replica active")
            ),
            "order_service": ServiceNode(
                id="order_service", label="Order Service", role="service",
                telemetry=ServiceTelemetry(cpu=10.1, memory=40.5, latency=25.0, status="HEALTHY", status_message="Orders processing")
            ),
            "order_db": ServiceNode(
                id="order_db", label="Order Database", role="database",
                telemetry=ServiceTelemetry(cpu=6.4, memory=18.2, latency=3.8, status="HEALTHY", status_message="Writes persistent")
            ),
            "catalog_service": ServiceNode(
                id="catalog_service", label="Catalog Service", role="service",
                telemetry=ServiceTelemetry(cpu=15.3, memory=45.1, latency=30.0, status="HEALTHY", status_message="Catalog synchronized")
            ),
            "catalog_db": ServiceNode(
                id="catalog_db", label="Catalog Database", role="database",
                telemetry=ServiceTelemetry(cpu=7.9, memory=24.8, latency=4.5, status="HEALTHY", status_message="All tables indexed")
            ),
            "recommend_cache": ServiceNode(
                id="recommend_cache", label="Recommend Cache", role="cache",
                telemetry=ServiceTelemetry(cpu=3.1, memory=60.2, latency=1.2, status="HEALTHY", status_message="Hit rate 94.2%")
            ),
            "payment_service": ServiceNode(
                id="payment_service", label="Payment Service", role="service",
                telemetry=ServiceTelemetry(cpu=5.0, memory=18.7, latency=50.2, status="HEALTHY", status_message="Ready for payments")
            ),
            "payment_gateway": ServiceNode(
                id="payment_gateway", label="Payment Gateway API", role="external",
                telemetry=ServiceTelemetry(cpu=0.0, memory=0.0, latency=100.5, status="HEALTHY", status_message="Third party API operational")
            ),
        }

        # Initialize Edges
        self.edges: List[DependencyEdge] = [
            DependencyEdge(id="e1", source="gateway", target="auth_service"),
            DependencyEdge(id="e2", source="gateway", target="order_service"),
            DependencyEdge(id="e3", source="gateway", target="catalog_service"),
            DependencyEdge(id="e4", source="auth_service", target="auth_db"),
            DependencyEdge(id="e5", source="order_service", target="payment_service"),
            DependencyEdge(id="e6", source="order_service", target="order_db"),
            DependencyEdge(id="e7", source="catalog_service", target="catalog_db"),
            DependencyEdge(id="e8", source="catalog_service", target="recommend_cache"),
            DependencyEdge(id="e9", source="payment_service", target="payment_gateway"),
        ]

        # Generate metrics history
        self.metrics_history: Dict[str, List[MetricPoint]] = {}
        for s_id, s_node in self.services.items():
            history = []
            # Make 15 data points of baseline
            base_cpu = s_node.telemetry.cpu
            base_mem = s_node.telemetry.memory
            base_lat = s_node.telemetry.latency
            for i in range(15):
                history.append(MetricPoint(
                    timestamp=self._get_timestamp(-150 + i * 10),
                    cpu=base_cpu,
                    memory=base_mem,
                    latency=base_lat
                ))
            self.metrics_history[s_id] = history

    def get_simulation_state(self) -> SimulationState:
        graph = DependencyGraph(
            nodes=list(self.services.values()),
            edges=self.edges
        )
        return SimulationState(
            overall_status=self.overall_status,
            services=self.services,
            dependency_graph=graph,
            timeline=self.timeline,
            debate_log=self.debate_log,
            rca=self.rca,
            alerts=self.alerts,
            metrics_history=self.metrics_history
        )

# Global in-memory state instance
state_manager = StateManager()
