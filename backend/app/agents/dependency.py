from app.models.schemas import DebateMessage
from datetime import datetime

class DependencyAgent:
    def __init__(self):
        self.name = "Dependency Agent"
        self.role = "Topology Analyzer"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "🔍 Topology trace completed. The root incident on 'auth_db' is propagating upstream. "
                "auth_service depends directly on auth_db and is experiencing database connection queue starvation. "
                "gateway API depends on auth_service for token verification, causing gateway latency to spike cascade-style. "
                "Affected path: auth_db ➔ auth_service ➔ gateway."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "🔍 Topology trace completed. 'catalog_service' memory leak is causing container CPU throttling. "
                "gateway depends on catalog_service for product views. The gateway has begun dropping connection pools. "
                "Affected path: catalog_service ➔ gateway."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "🔍 Topology trace completed. Connection failures are located at the egress interface to external 'payment_gateway'. "
                "payment_service is waiting on socket read timeouts. order_service depends on payment_service and is backing up order creation queues. "
                "gateway is seeing order failures. Affected path: payment_gateway ➔ payment_service ➔ order_service ➔ gateway."
            )
        else:
            msg = "Dependency graph is healthy. No anomalous upstream or downstream propagation routes identified."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="analytical"
        )
