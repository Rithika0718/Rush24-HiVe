from app.services.state import state_manager, StateManager
from app.models.schemas import TimelineEntry, Alert, RcaDetails, MetricPoint, SimulationState
from app.agents.monitor import MonitorAgent
from app.agents.dependency import DependencyAgent
from app.agents.performance import PerformanceAgent
from app.agents.risk import RiskAgent
from app.agents.memory import MemoryAgent
from app.agents.planner import PlannerAgent
from app.agents.recovery import RecoveryAgent
from app.agents.reporter import ReporterAgent
from datetime import datetime, timedelta
import random

class SimulationEngine:
    def __init__(self):
        self.monitor = MonitorAgent()
        self.dependency = DependencyAgent()
        self.performance = PerformanceAgent()
        self.risk = RiskAgent()
        self.memory = MemoryAgent()
        self.planner = PlannerAgent()
        self.recovery = RecoveryAgent()
        self.reporter = ReporterAgent()

    def run_chaos(self, scenario: str) -> SimulationState:
        # 1. Reset state first to start fresh (or mutate on top of baseline)
        state_manager.reset()
        
        state_manager.overall_status = "CRITICAL" if scenario in ["DB_LATENCY_SPIKE", "NETWORK_PARTITION"] else "DEGRADED"

        # 2. Mutate telemetry and generate cascading failure states
        if scenario == "DB_LATENCY_SPIKE":
            self._apply_db_latency_spike()
        elif scenario == "MEMORY_LEAK":
            self._apply_memory_leak()
        elif scenario == "NETWORK_PARTITION":
            self._apply_network_partition()

        # 3. Create active alerts
        self._create_alerts(scenario)

        # 4. Generate Timeline
        self._generate_timeline(scenario)

        # 5. Run Agent Debate Pipeline
        self._run_debate(scenario)

        # 6. Generate Root Cause Analysis (RCA)
        self._generate_rca(scenario)

        return state_manager.get_simulation_state()

    def _apply_db_latency_spike(self):
        # Primary failure: auth_db
        state_manager.services["auth_db"].telemetry.cpu = 98.4
        state_manager.services["auth_db"].telemetry.memory = 42.1
        state_manager.services["auth_db"].telemetry.latency = 2450.0
        state_manager.services["auth_db"].telemetry.status = "CRITICAL"
        state_manager.services["auth_db"].telemetry.status_message = "Query lock contention / deadlock on active users table"

        # Cascade 1: auth_service
        state_manager.services["auth_service"].telemetry.cpu = 84.8
        state_manager.services["auth_service"].telemetry.memory = 62.0
        state_manager.services["auth_service"].telemetry.latency = 2800.0
        state_manager.services["auth_service"].telemetry.status = "CRITICAL"
        state_manager.services["auth_service"].telemetry.status_message = "Database connection pool saturated (waiting on lock)"

        # Cascade 2: gateway
        state_manager.services["gateway"].telemetry.cpu = 45.2
        state_manager.services["gateway"].telemetry.memory = 55.4
        state_manager.services["gateway"].telemetry.latency = 1250.0
        state_manager.services["gateway"].telemetry.status = "WARNING"
        state_manager.services["gateway"].telemetry.status_message = "Upstream Auth timeouts on endpoint /v1/auth"

        # Adjust metrics history to show a massive spike at the end
        self._inject_history_spike("auth_db", cpu_val=98.4, mem_val=42.1, lat_val=2450.0)
        self._inject_history_spike("auth_service", cpu_val=84.8, mem_val=62.0, lat_val=2800.0)
        self._inject_history_spike("gateway", cpu_val=45.2, mem_val=55.4, lat_val=1250.0)

    def _apply_memory_leak(self):
        # Primary failure: catalog_service
        state_manager.services["catalog_service"].telemetry.cpu = 82.5
        state_manager.services["catalog_service"].telemetry.memory = 95.8
        state_manager.services["catalog_service"].telemetry.latency = 1520.0
        state_manager.services["catalog_service"].telemetry.status = "CRITICAL"
        state_manager.services["catalog_service"].telemetry.status_message = "JVM Heap exhaustion / GC pause > 15s"

        # Cascade 1: gateway
        state_manager.services["gateway"].telemetry.cpu = 30.1
        state_manager.services["gateway"].telemetry.memory = 42.0
        state_manager.services["gateway"].telemetry.latency = 820.0
        state_manager.services["gateway"].telemetry.status = "WARNING"
        state_manager.services["gateway"].telemetry.status_message = "Slow downstream response times for catalog listings"

        self._inject_history_spike("catalog_service", cpu_val=82.5, mem_val=95.8, lat_val=1520.0)
        self._inject_history_spike("gateway", cpu_val=30.1, mem_val=42.0, lat_val=820.0)

    def _apply_network_partition(self):
        # Primary failure: payment_gateway
        state_manager.services["payment_gateway"].telemetry.cpu = 0.0
        state_manager.services["payment_gateway"].telemetry.memory = 0.0
        state_manager.services["payment_gateway"].telemetry.latency = 10000.0
        state_manager.services["payment_gateway"].telemetry.status = "CRITICAL"
        state_manager.services["payment_gateway"].telemetry.status_message = "100% egress packet loss / partner API offline"

        # Cascade 1: payment_service
        state_manager.services["payment_service"].telemetry.cpu = 60.5
        state_manager.services["payment_service"].telemetry.memory = 48.2
        state_manager.services["payment_service"].telemetry.latency = 5200.0
        state_manager.services["payment_service"].telemetry.status = "CRITICAL"
        state_manager.services["payment_service"].telemetry.status_message = "Thread pool exhausted waiting on TCP socket reads"

        # Cascade 2: order_service
        state_manager.services["order_service"].telemetry.cpu = 40.1
        state_manager.services["order_service"].telemetry.memory = 52.4
        state_manager.services["order_service"].telemetry.latency = 3100.0
        state_manager.services["order_service"].telemetry.status = "CRITICAL"
        state_manager.services["order_service"].telemetry.status_message = "Transaction validation blocks / orders queue overflow"

        # Cascade 3: gateway
        state_manager.services["gateway"].telemetry.cpu = 28.5
        state_manager.services["gateway"].telemetry.memory = 38.0
        state_manager.services["gateway"].telemetry.latency = 1600.0
        state_manager.services["gateway"].telemetry.status = "WARNING"
        state_manager.services["gateway"].telemetry.status_message = "Timeouts on customer purchase routing paths"

        self._inject_history_spike("payment_gateway", cpu_val=0.0, mem_val=0.0, lat_val=10000.0)
        self._inject_history_spike("payment_service", cpu_val=60.5, mem_val=48.2, lat_val=5200.0)
        self._inject_history_spike("order_service", cpu_val=40.1, mem_val=52.4, lat_val=3100.0)
        self._inject_history_spike("gateway", cpu_val=28.5, mem_val=38.0, lat_val=1600.0)

    def _inject_history_spike(self, service_id: str, cpu_val: float, mem_val: float, lat_val: float):
        history = state_manager.metrics_history[service_id]
        # Mutate the last 5 points of the history to show a rising spike
        points_to_mutate = 5
        base_cpu = history[0].cpu
        base_mem = history[0].memory
        base_lat = history[0].latency
        
        for idx, i in enumerate(range(15 - points_to_mutate, 15)):
            step_factor = (idx + 1) / points_to_mutate
            history[i].cpu = base_cpu + (cpu_val - base_cpu) * step_factor
            history[i].memory = base_mem + (mem_val - base_mem) * step_factor
            history[i].latency = base_lat + (lat_val - base_lat) * step_factor

    def _create_alerts(self, scenario: str):
        t_str = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            state_manager.alerts = [
                Alert(id="AL-001", timestamp=t_str, severity="CRITICAL", message="auth_db response latency > 2000ms", status="ACTIVE"),
                Alert(id="AL-002", timestamp=t_str, severity="CRITICAL", message="auth_service HTTP connection pool depleted", status="ACTIVE"),
                Alert(id="AL-003", timestamp=t_str, severity="WARNING", message="gateway API SLA violation (latency peak)", status="ACTIVE")
            ]
        elif scenario == "MEMORY_LEAK":
            state_manager.alerts = [
                Alert(id="AL-004", timestamp=t_str, severity="CRITICAL", message="catalog_service heap memory exhaustion > 95%", status="ACTIVE"),
                Alert(id="AL-005", timestamp=t_str, severity="WARNING", message="gateway HTTP 502 Bad Gateway rate spiked", status="ACTIVE")
            ]
        elif scenario == "NETWORK_PARTITION":
            state_manager.alerts = [
                Alert(id="AL-006", timestamp=t_str, severity="CRITICAL", message="payment_gateway route unavailable / socket errors", status="ACTIVE"),
                Alert(id="AL-007", timestamp=t_str, severity="CRITICAL", message="payment_service thread pool locks detected", status="ACTIVE"),
                Alert(id="AL-008", timestamp=t_str, severity="WARNING", message="order_service creation queue overflowed", status="ACTIVE")
            ]

    def _generate_timeline(self, scenario: str):
        now = datetime.now()
        
        def t_offset(sec: int) -> str:
            return (now + timedelta(seconds=sec)).strftime("%H:%M:%S")

        if scenario == "DB_LATENCY_SPIKE":
            state_manager.timeline = [
                TimelineEntry(timestamp=t_offset(-45), type="chaos", title="Chaos Injected", description="Database Latency Injection started. Database lock contention simulated."),
                TimelineEntry(timestamp=t_offset(-40), type="detection", title="Breach Detected", description="Alert triggered: auth_db latency rose above 2000ms threshold."),
                TimelineEntry(timestamp=t_offset(-30), type="debate", title="Incident War Room Opened", description="HIVE Nebula agent debate engine initiated with 8 observers."),
                TimelineEntry(timestamp=t_offset(-20), type="analysis", title="Root Cause Found", description="Query log analysis matches unindexed user logins. Risk assessed as high."),
                TimelineEntry(timestamp=t_offset(-10), type="recovery", title="Recovery Action Dispatched", description="Scaling auth_db instances and triggering failover to read-replica."),
                TimelineEntry(timestamp=t_offset(0), type="resolution", title="Incident Mitigated", description="Telemetry returning to baseline values. Active recovery verifications complete.")
            ]
        elif scenario == "MEMORY_LEAK":
            state_manager.timeline = [
                TimelineEntry(timestamp=t_offset(-35), type="chaos", title="Chaos Injected", description="Catalog service heap leak injection triggered. Memory usage rising."),
                TimelineEntry(timestamp=t_offset(-30), type="detection", title="SLA Breach Detected", description="catalog_service latency exceeded 1500ms limit. GC cycles saturated."),
                TimelineEntry(timestamp=t_offset(-22), type="debate", title="Collaboration Started", description="Agents debating JVM garbage collection logs and heap signatures."),
                TimelineEntry(timestamp=t_offset(-15), type="analysis", title="Memory Leak Isolated", description="Isolated leaking class in recommendation model controller. Risk: Medium."),
                TimelineEntry(timestamp=t_offset(-8), type="recovery", title="Hot Restart Initiated", description="Dispatched rolling restart commands. Augmented heap space threshold by 2GB."),
                TimelineEntry(timestamp=t_offset(0), type="resolution", title="Memory Reclaimed", description="Nodes restarted. Heap allocations stabilized at normal levels.")
            ]
        elif scenario == "NETWORK_PARTITION":
            state_manager.timeline = [
                TimelineEntry(timestamp=t_offset(-50), type="chaos", title="Chaos Injected", description="Egress route network partition injected for payment_gateway link."),
                TimelineEntry(timestamp=t_offset(-45), type="detection", title="Connection Timeout", description="Alert: 100% packet loss on outbound socket ports. Latency > 10s."),
                TimelineEntry(timestamp=t_offset(-35), type="debate", title="War Room Created", description="Agents analyzing routing tables, DNS endpoints, and payment sockets."),
                TimelineEntry(timestamp=t_offset(-25), type="analysis", title="Gateway Unreachable", description="Risk: Critical. Complete checkout halt. Fallback trigger suggested."),
                TimelineEntry(timestamp=t_offset(-15), type="recovery", title="Route Rerouted", description="Rerouted egress traffic to Backup Payment Gateway. Reduced timeout limit."),
                TimelineEntry(timestamp=t_offset(0), type="resolution", title="Transactional Flow Restored", description="Payment transactions processing. Inbound queues flushed.")
            ]

    def _run_debate(self, scenario: str):
        services = state_manager.services
        # Gather messages chronologically from all agents
        msg_monitor = self.monitor.analyze(services, scenario)
        msg_dep = self.dependency.analyze(services, scenario)
        msg_perf = self.performance.analyze(services, scenario)
        msg_risk = self.risk.analyze(services, scenario)
        msg_mem = self.memory.analyze(services, scenario)
        msg_planner = self.planner.analyze(services, scenario)
        msg_recovery = self.recovery.analyze(services, scenario)
        msg_reporter = self.reporter.analyze(services, scenario)

        # Set sequential timestamps to look realistic
        now = datetime.now()
        messages = [msg_monitor, msg_dep, msg_perf, msg_risk, msg_mem, msg_planner, msg_recovery, msg_reporter]
        for idx, msg in enumerate(messages):
            msg.timestamp = (now + timedelta(seconds=idx * 2 - 20)).strftime("%H:%M:%S")

        state_manager.debate_log = messages

    def _generate_rca(self, scenario: str):
        t_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            state_manager.rca = RcaDetails(
                root_cause="Shared database table lock contention on user profiles. CPU query threads starvation due to missing composite query indices on catalog validation paths under peak write loads.",
                impact="User token authorization fails. Authentication endpoints return 504 Gateway Timeouts. Checkout and account views blocked. Gateway latency spiked to 1250ms.",
                affected_services=["auth_db", "auth_service", "gateway"],
                timeline=[
                    f"{t_str} - Primary database latency spike registered.",
                    f"{t_str} - Auth Service connection pools depleted.",
                    f"{t_str} - Gateway API SLA threshold violated."
                ],
                recovery="Scaled database core capacity from 2 to 8 vCPUs. Dispatched administrative thread kills for hung SQL blocks. Executed failover swap to replica nodes.",
                recommendations=[
                    "Implement read-replica query splitting for profile lookups.",
                    "Establish composite query indices for user logins.",
                    "Apply token-caching mechanisms to reduce auth_db lookups."
                ]
            )
        elif scenario == "MEMORY_LEAK":
            state_manager.rca = RcaDetails(
                root_cause="Linear memory leak in recommendations cache serializer class. Memory allocated during product loading is not garbage collected, causing heap saturation and JVM freezing.",
                impact="Product listings and catalog search display slow-downs. 15% of cart checkout queries failing. CPU throttled due to high garbage collection pause overheads.",
                affected_services=["catalog_service", "gateway"],
                timeline=[
                    f"{t_str} - JVM heap memory consumption > 90%.",
                    f"{t_str} - Garbage collection overhead exceeds 80%.",
                    f"{t_str} - Gateway API registers 502/504 response spikes."
                ],
                recovery="Dispatched rolling container restart on catalog_service pods. Extended memory pool thresholds by 2GB via deployment configurations.",
                recommendations=[
                    "Refactor recommendations cache serializer to utilize system weak references.",
                    "Enable heap dump capture on out-of-memory alerts.",
                    "Setup JVM garbage collection alerting filters."
                ]
            )
        elif scenario == "NETWORK_PARTITION":
            state_manager.rca = RcaDetails(
                root_cause="TCP socket blocking on primary Payment Gateway route. Lack of connection timeouts (defaulted to 30s) caused immediate thread starvation across the payment processing layers.",
                impact="100% transactional billing failure. Purchase submissions backlogged and timeout. Complete checkout halt across ordering channels.",
                affected_services=["payment_gateway", "payment_service", "order_service", "gateway"],
                timeline=[
                    f"{t_str} - Payment Gateway latency rose above 10s.",
                    f"{t_str} - Sockets wait locks depleted Payment Service threads.",
                    f"{t_str} - Purchase workflow queues overflowed order_service."
                ],
                recovery="Rerouted egress transactions to Secondary Payment Gateway. Reduced client-side connection timeout properties to 2 seconds. Cleared backlogged transaction queues.",
                recommendations=[
                    "Implement circuit-breaker pattern with fallback routes.",
                    "Reduce socket connection timeouts on all external egress routers.",
                    "Build asynchronous queue buffer mechanisms for billing transactions."
                ]
            )

# Global simulation engine instance
simulation_engine = SimulationEngine()
