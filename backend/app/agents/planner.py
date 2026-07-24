from app.models.schemas import DebateMessage
from datetime import datetime

class PlannerAgent:
    def __init__(self):
        self.name = "Planner Agent"
        self.role = "Incident Coordinator"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "📝 Proposing Recovery Sequence [PLAN-DB-LATENCY-01]:\n"
                "1. Terminate running locked query threads on auth_db.\n"
                "2. Force scale-up of auth_db CPU allocation from 2 vCPUs to 8 vCPUs.\n"
                "3. Perform database primary-secondary failover to restore active transactional endpoints.\n"
                "4. Implement rate-limiting rules on auth_service API Gateway."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "📝 Proposing Recovery Sequence [PLAN-MEM-LEAK-02]:\n"
                "1. Trigger rolling restart of catalog_service containers to free leaked heap allocations.\n"
                "2. Allocate additional 2GB RAM buffer space to catalog_service JVM config.\n"
                "3. Bypass recommendation caching layers temporarily to decrease overall memory footprints."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "📝 Proposing Recovery Sequence [PLAN-NET-PARTITION-03]:\n"
                "1. Activate egress traffic rerouting rule to direct traffic to Backup Payment Gateway.\n"
                "2. Deploy connection pooling timeout reduction patch (30s ➔ 2s) to payment_service config.\n"
                "3. Enable queue-based asynchronous retry buffers for failed orders."
            )
        else:
            msg = "System is healthy. Recovery planning state: Idle."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="remedial"
        )
