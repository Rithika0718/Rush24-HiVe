from app.models.schemas import DebateMessage
from datetime import datetime

class RecoveryAgent:
    def __init__(self):
        self.name = "Recovery Agent"
        self.role = "Automated Systems Administrator"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "🔧 Execution Report: Initiating PLAN-DB-LATENCY-01.\n"
                "• Scaling active auth_db cluster instances to 8 vCPUs... SUCCESS.\n"
                "• Triggering primary database failover node swap... SUCCESS.\n"
                "• Resetting HTTP gateway socket queues... SUCCESS.\n"
                "Telemetry check: Auth database latency has dropped from 2500ms back to 2.1ms. Status is recovery-verified."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "🔧 Execution Report: Initiating PLAN-MEM-LEAK-02.\n"
                "• Restarting catalog_service container nodes... SUCCESS.\n"
                "• Injecting 2GB RAM container overhead buffer config... SUCCESS.\n"
                "Telemetry check: Catalog service memory consumption dropped to 35%. Status is recovery-verified."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "🔧 Execution Report: Initiating PLAN-NET-PARTITION-03.\n"
                "• Rerouting egress transaction traffic to Backup Gateway API... SUCCESS.\n"
                "• Reducing payment_service write sockets timeout to 2 seconds... SUCCESS.\n"
                "Telemetry check: Payment service latency is 50.2ms. Sockets cleared. Transactions flow normalized."
            )
        else:
            msg = "No recovery operations needed. Telemetry registers healthy operational limits."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="remedial"
        )
