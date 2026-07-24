from app.models.schemas import DebateMessage
from datetime import datetime

class PerformanceAgent:
    def __init__(self):
        self.name = "Performance Agent"
        self.role = "Telemetry Engineer"

    def analyze(self, services: dict, scenario: str) -> DebateMessage:
        timestamp = datetime.now().strftime("%H:%M:%S")
        if scenario == "DB_LATENCY_SPIKE":
            msg = (
                "📊 Telemetry signature profile matches DATABASE THREAD EXHAUSTION. "
                "Auth Database CPU is saturated at 98.4% and disk IOPS are maxed. "
                "The thread-dump shows 140 database connection threads in BLOCKED state waiting on locks. "
                "Upstream service connection pools are depleted, leading to HTTP thread exhaustion."
            )
        elif scenario == "MEMORY_LEAK":
            msg = (
                "📊 Telemetry signature profile matches CLASSIC HEAP LEAK. "
                "Memory consumption on catalog_service has grown linearly from 45% to 92.5% over the simulation period. "
                "Garbage collection overhead is consuming 88% of CPU cycles, resulting in extreme service latency and timeouts."
            )
        elif scenario == "NETWORK_PARTITION":
            msg = (
                "📊 Telemetry signature profile matches TCP TIMEOUT STACK. "
                "Payment Service is seeing 100% TCP packet loss on egress route to payment_gateway. "
                "Sockets are locked in ESTABLISHED state, waiting for the 30-second read deadline. "
                "Gateway thread allocation is fully saturated due to downstream wait states."
            )
        else:
            msg = "Resource usage profiles show stable CPU, Memory, and Network latency distributions."

        return DebateMessage(
            timestamp=timestamp,
            agent_name=self.name,
            agent_role=self.role,
            message=msg,
            sentiment="analytical"
        )
