from app.models.schemas import DebateMessage
from datetime import datetime

class RiskAgent:
    def __init__(self):
        self.name = "Risk Agent"
        self.role = "Risk & Compliance Officer"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "⚠️ BLAST RADIUS ALERT: 3 critical nodes affected. Gateway API failure rate has spiked to 34%. "
                "Active login sessions are dropping. We are violating the P99 Latency SLA (current 3000ms vs limit 200ms). "
                "Business impact rating: HIGH. Financial exposure is mounting due to transaction drop-offs."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "⚠️ BLAST RADIUS ALERT: 2 nodes affected. 15% of checkout requests are failing due to catalog timeouts. "
                "Product recommendations are offline. Customer conversion rates have decreased by 22% in the last 5 minutes. "
                "Business impact rating: MEDIUM. Customers are unable to browse catalog items."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "⚠️ BLAST RADIUS ALERT: 4 nodes affected. 100% of order submissions are failing. "
                "Payment Service cannot capture authorizations. Credit card transactions are in error. "
                "Business impact rating: SEVERE. Complete transaction halt. Urgent mitigation required to prevent cart abandonment."
            )
        else:
            msg = "SLA compliance stands at 100%. No service risks or commercial exposure detected."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="cautious"
        )
