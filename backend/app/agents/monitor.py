from app.models.schemas import DebateMessage
from datetime import datetime

class MonitorAgent:
    def __init__(self):
        self.name = "Monitor Agent"
        self.role = "Observability Coordinator"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            db_lat = services["auth_db"].telemetry.latency
            db_cpu = services["auth_db"].telemetry.cpu
            msg = (
                f"🚨 CRITICAL ALERT! Threshold breach on auth_db. Latency is {db_lat:.1f}ms (threshold 10ms), "
                f"CPU at {db_cpu:.1f}%. Cascade detected on auth_service latency ({services['auth_service'].telemetry.latency:.1f}ms). "
                "System status is set to CRITICAL."
            )
        elif scenario == "MEMORY_LEAK":
            cat_mem = services["catalog_service"].telemetry.memory
            msg = (
                f"⚠️ WARNING ALERT! Memory leak detected on catalog_service. Memory consumption is {cat_mem:.1f}% "
                f"and rising. HTTP 500 error rates on gateway API are increasing as a consequence."
            )
        elif scenario == "NETWORK_PARTITION":
            gw_lat = services["payment_gateway"].telemetry.latency
            msg = (
                f"🚨 CRITICAL ALERT! External Payment Gateway latency has reached {gw_lat:.1f}ms. "
                "Socket timeouts are accumulating on payment_service. Customer transactions are blocked."
            )
        else:
            msg = "Telemetry check complete. All nodes operating within healthy SLA boundaries."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="alarmed"
        )
