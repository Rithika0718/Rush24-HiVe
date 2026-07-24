from app.models.schemas import DebateMessage
from datetime import datetime

class MemoryAgent:
    def __init__(self):
        self.name = "Memory Agent"
        self.role = "Historical Context Engine"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "📚 Incident Memory match found: [ID-9942, Date: 2026-06-18]. "
                "A database CPU/latency lockup occurred during catalog update scripts. "
                "Resolution was database replication scale-out and indexing. "
                "We must check if the database query cache has been bypassed."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "📚 Incident Memory match found: [ID-7123, Date: 2026-05-02]. "
                "Catalog service experienced a memory leak in the recommendation service model loader. "
                "Resolution was a service restart followed by an adjustment of JVM heap sizes. "
                "Restarting the service will temporarily clear the leak."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "📚 Incident Memory match found: [ID-5501, Date: 2026-04-10]. "
                "Third-party payment gateway experienced DNS route table failures, dropping connection requests. "
                "Resolution was toggling traffic to the secondary fallback payment endpoint or restarting ingress proxies."
            )
        else:
            msg = "No anomalous incident patterns found in historical cache databases."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="historical"
        )
