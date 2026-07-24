from app.models.schemas import DebateMessage
from datetime import datetime

class ReporterAgent:
    def __init__(self):
        self.name = "Reporter Agent"
        self.role = "Lead RCA Scribe"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "📝 Final Incident Summary: System state has fully restored to HEALTHY.\n"
                "• Incident Root Cause: auth_db CPU starvation due to missing catalog query indexing.\n"
                "• Total Outage Duration: 4 minutes, 20 seconds.\n"
                "• Corrective Action: Database failover and CPU scaling.\n"
                "RCA Report has been saved to the HIVE Nebula registry."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "📝 Final Incident Summary: System state has fully restored to HEALTHY.\n"
                "• Incident Root Cause: Memory leak in catalog_service heap space allocations.\n"
                "• Total Outage Duration: 3 minutes, 15 seconds.\n"
                "• Corrective Action: Container rolling restart and RAM expansion.\n"
                "RCA Report has been saved to the HIVE Nebula registry."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "📝 Final Incident Summary: System state has fully restored to HEALTHY.\n"
                "• Incident Root Cause: Route partition between internal payment_service and Payment Gateway.\n"
                "• Total Outage Duration: 5 minutes, 40 seconds.\n"
                "• Corrective Action: Failover to backup API endpoint and socket adjustment.\n"
                "RCA Report has been saved to the HIVE Nebula registry."
            )
        else:
            msg = "System health check report: Clean run. Operational SLA maintained at 100%."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="summarizing"
        )
