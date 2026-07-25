"""
HIVE Nebula - GCP Digital Twin Foundation Layer
================================================
Autonomous Multi-Agent Incident Commander - Simulated GCP Infrastructure Environment

A lightweight, zero-dependency Python service modeling a Google Cloud environment.
Handles incident injection, realistic cascading dependency ripple effects, real-time
state management, and resolution endpoints.
"""

from typing import Dict, List, Optional
from enum import Enum
from datetime import datetime, timezone
import logging
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("gcp-digital-twin")

# --- ENUMS & DATA MODELS ---

class ServiceStatus(str, Enum):
    HEALTHY = "Healthy"
    DEGRADED = "Degraded"
    CRITICAL = "Critical"

class IncidentType(str, Enum):
    CPU_SPIKE = "cpu_spike"
    MEMORY_LEAK = "memory_leak"
    LATENCY_SPIKE = "latency_spike"
    NETWORK_PARTITION = "network_partition"
    DB_CONNECTION_EXHAUSTION = "db_connection_exhaustion"
    SERVICE_CRASH = "service_crash"

class ServiceState:
    def __init__(self, id, name, gcp_resource_type, status=ServiceStatus.HEALTHY,
                 cpu_percent=0.0, memory_percent=0.0, latency_ms=0.0,
                 error_rate_percent=0.0, dependencies=None, description="", last_updated=None):
        self.id = id
        self.name = name
        self.gcp_resource_type = gcp_resource_type
        self.status = status if isinstance(status, ServiceStatus) else ServiceStatus(status)
        self.cpu_percent = float(cpu_percent)
        self.memory_percent = float(memory_percent)
        self.latency_ms = float(latency_ms)
        self.error_rate_percent = float(error_rate_percent)
        self.dependencies = dependencies or []
        self.description = description
        self.last_updated = last_updated or datetime.now(timezone.utc).isoformat()

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "gcp_resource_type": self.gcp_resource_type,
            "status": self.status.value if hasattr(self.status, "value") else str(self.status),
            "cpu_percent": self.cpu_percent,
            "memory_percent": self.memory_percent,
            "latency_ms": self.latency_ms,
            "error_rate_percent": self.error_rate_percent,
            "dependencies": self.dependencies,
            "description": self.description,
            "last_updated": self.last_updated
        }

# --- BASELINE INITIAL GCP STATE ---

INITIAL_SERVICES: Dict[str, dict] = {
    "api-gateway": {
        "id": "api-gateway",
        "name": "API Gateway Ingress",
        "gcp_resource_type": "GCP Cloud Load Balancer & API Gateway",
        "status": ServiceStatus.HEALTHY,
        "cpu_percent": 18.5,
        "memory_percent": 32.0,
        "latency_ms": 15.0,
        "error_rate_percent": 0.05,
        "dependencies": ["auth-service", "orders-db", "payments-service"],
        "description": "Public edge ingress routing user traffic to backend microservices.",
    },
    "auth-service": {
        "id": "auth-service",
        "name": "Authentication Microservice",
        "gcp_resource_type": "GCP Cloud Run (Container)",
        "status": ServiceStatus.HEALTHY,
        "cpu_percent": 14.0,
        "memory_percent": 28.5,
        "latency_ms": 12.0,
        "error_rate_percent": 0.02,
        "dependencies": ["cache"],
        "description": "JWT authentication and OAuth identity service.",
    },
    "orders-db": {
        "id": "orders-db",
        "name": "Orders Database",
        "gcp_resource_type": "GCP Cloud SQL (PostgreSQL Primary)",
        "status": ServiceStatus.HEALTHY,
        "cpu_percent": 24.0,
        "memory_percent": 45.0,
        "latency_ms": 22.0,
        "error_rate_percent": 0.0,
        "dependencies": [],
        "description": "Relational database holding core customer order records.",
    },
    "payments-service": {
        "id": "payments-service",
        "name": "Payments Processing Service",
        "gcp_resource_type": "GCP GKE Microservice (Kubernetes)",
        "status": ServiceStatus.HEALTHY,
        "cpu_percent": 20.0,
        "memory_percent": 36.0,
        "latency_ms": 35.0,
        "error_rate_percent": 0.1,
        "dependencies": ["orders-db", "cache"],
        "description": "Handles payment gateway processing and transaction logging.",
    },
    "cache": {
        "id": "cache",
        "name": "Session & Metrics Cache",
        "gcp_resource_type": "GCP Memorystore (Redis Cluster)",
        "status": ServiceStatus.HEALTHY,
        "cpu_percent": 10.0,
        "memory_percent": 38.0,
        "latency_ms": 2.5,
        "error_rate_percent": 0.0,
        "dependencies": [],
        "description": "High-speed Redis cache for token sessions and order metadata.",
    },
}

# --- IN-MEMORY STATE STORE ---

class GCPDigitalTwinStore:
    def __init__(self):
        self.reset()

    def reset(self):
        """Reset state back to clean healthy GCP baseline."""
        self.services: Dict[str, ServiceState] = {
            sid: ServiceState(**data) for sid, data in INITIAL_SERVICES.items()
        }
        self.active_incidents: Dict[str, dict] = {}
        logger.info("GCP Digital Twin state reset to clean baseline.")

    def get_service(self, service_id: str) -> Optional[ServiceState]:
        return self.services.get(service_id)

    def recalculate_cascade_effects(self):
        now_str = datetime.now(timezone.utc).isoformat()
        critical_roots = set(self.active_incidents.keys())

        for _ in range(len(self.services)):
            for sid, svc in self.services.items():
                if sid in critical_roots:
                    continue

                unhealthy_deps = []
                for dep_id in svc.dependencies:
                    dep_svc = self.services.get(dep_id)
                    if dep_svc and dep_svc.status in [ServiceStatus.CRITICAL, ServiceStatus.DEGRADED]:
                        unhealthy_deps.append(dep_svc)

                base_info = INITIAL_SERVICES[sid]

                if not unhealthy_deps:
                    svc.status = ServiceStatus.HEALTHY
                    svc.cpu_percent = base_info["cpu_percent"]
                    svc.memory_percent = base_info["memory_percent"]
                    svc.latency_ms = base_info["latency_ms"]
                    svc.error_rate_percent = base_info["error_rate_percent"]
                else:
                    has_critical_dep = any(d.status == ServiceStatus.CRITICAL for d in unhealthy_deps)
                    svc.status = ServiceStatus.CRITICAL if has_critical_dep and len(unhealthy_deps) >= 2 else ServiceStatus.DEGRADED
                    svc.cpu_percent = min(95.0, base_info["cpu_percent"] + 35.0 * len(unhealthy_deps))
                    svc.memory_percent = min(92.0, base_info["memory_percent"] + 20.0 * len(unhealthy_deps))
                    svc.latency_ms = base_info["latency_ms"] + sum(d.latency_ms * 0.75 for d in unhealthy_deps)
                    svc.error_rate_percent = min(85.0, base_info["error_rate_percent"] + 12.5 * len(unhealthy_deps))
                
                svc.last_updated = now_str

    def inject_incident(self, service_id: str, incident_type: str, details: str = None):
        if service_id not in self.services:
            return {"detail": f"Cannot inject incident: Service '{service_id}' does not exist."}, 404

        target = self.services[service_id]
        now_str = datetime.now(timezone.utc).isoformat()
        inc_id = f"INC-{service_id.upper()}-{int(datetime.now().timestamp())}"

        try:
            inc_enum = IncidentType(incident_type)
        except ValueError:
            inc_enum = IncidentType.CPU_SPIKE

        incident = {
            "id": inc_id,
            "target_service": service_id,
            "type": inc_enum.value,
            "started_at": now_str,
            "impacted_services": [],
            "details": details or f"Injected failure mode '{inc_enum.value}' on {target.name}."
        }
        self.active_incidents[service_id] = incident

        target.status = ServiceStatus.CRITICAL
        target.last_updated = now_str

        if inc_enum == IncidentType.CPU_SPIKE:
            target.cpu_percent = 98.4
            target.memory_percent = max(target.memory_percent, 72.0)
            target.latency_ms = max(target.latency_ms, 480.0)
            target.error_rate_percent = 18.5
        elif inc_enum == IncidentType.MEMORY_LEAK:
            target.cpu_percent = max(target.cpu_percent, 65.0)
            target.memory_percent = 97.2
            target.latency_ms = max(target.latency_ms, 620.0)
            target.error_rate_percent = 24.0
        elif inc_enum == IncidentType.LATENCY_SPIKE:
            target.cpu_percent = max(target.cpu_percent, 55.0)
            target.latency_ms = 1850.0
            target.error_rate_percent = 32.0
        elif inc_enum == IncidentType.NETWORK_PARTITION:
            target.cpu_percent = 88.0
            target.latency_ms = 3500.0
            target.error_rate_percent = 78.0
        elif inc_enum == IncidentType.DB_CONNECTION_EXHAUSTION:
            target.cpu_percent = 99.1
            target.memory_percent = 91.0
            target.latency_ms = 1200.0
            target.error_rate_percent = 45.0
        elif inc_enum == IncidentType.SERVICE_CRASH:
            target.cpu_percent = 0.0
            target.memory_percent = 0.0
            target.latency_ms = 5000.0
            target.error_rate_percent = 100.0

        self.recalculate_cascade_effects()

        impacted = [
            sid for sid, s in self.services.items()
            if s.status != ServiceStatus.HEALTHY and sid != service_id
        ]
        incident["impacted_services"] = impacted

        logger.warning(
            f"INCIDENT INJECTED on [{service_id}] ({inc_enum.value}). Ripple impacted: {impacted}"
        )

        return {
            "message": f"Successfully injected '{inc_enum.value}' into service '{service_id}'.",
            "incident_id": inc_id,
            "target_service": target.to_dict(),
            "cascaded_impacted_services": impacted,
        }, 200

    def resolve_incident_by_id(self, service_id: str, action: str = "restart"):
        if service_id not in self.services:
            return {"detail": f"Cannot resolve incident: Service '{service_id}' does not exist."}, 404

        if service_id in self.active_incidents:
            del self.active_incidents[service_id]

        base_info = INITIAL_SERVICES[service_id]
        target = self.services[service_id]
        target.status = ServiceStatus.HEALTHY
        target.cpu_percent = base_info["cpu_percent"]
        target.memory_percent = base_info["memory_percent"]
        target.latency_ms = base_info["latency_ms"]
        target.error_rate_percent = base_info["error_rate_percent"]
        target.last_updated = datetime.now(timezone.utc).isoformat()

        self.recalculate_cascade_effects()

        logger.info(f"INCIDENT RESOLVED on [{service_id}] via action '{action}'.")

        return {
            "message": f"Successfully resolved incident for service '{service_id}' via action '{action}'.",
            "service": target.to_dict(),
            "remaining_active_incidents": len(self.active_incidents),
        }, 200

    def get_system_state(self):
        now_str = datetime.now(timezone.utc).isoformat()
        statuses = [s.status for s in self.services.values()]
        if ServiceStatus.CRITICAL in statuses:
            sys_health = "CRITICAL_INCIDENT"
        elif ServiceStatus.DEGRADED in statuses:
            sys_health = "DEGRADED"
        else:
            sys_health = "OPERATIONAL"

        import os
        return {
            "system_health": sys_health,
            "active_incidents_count": len(self.active_incidents),
            "gemini_api_configured": bool(os.environ.get("GEMINI_API_KEY")),
            "services": {sid: s.to_dict() for sid, s in self.services.items()},
            "active_incidents": list(self.active_incidents.values()),
            "timestamp": now_str,
        }

# Instantiate global state store
store = GCPDigitalTwinStore()

# --- HTTP REQUEST HANDLER ---

class DigitalTwinRequestHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress noisy standard HTTP logs
        return

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, data, status_code=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, html_str, status_code=200):
        body = html_str.encode("utf-8")
        self.send_response(status_code)
        self._send_cors_headers()
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"

        if path == "/":
            self._send_json({
                "system": "HIVE Nebula - Google Cloud Digital Twin",
                "status": "Online",
                "description": "Simulated Google Cloud Infrastructure state engine for AI Incident Commander.",
                "endpoints": {
                    "system_state": "/system-state",
                    "inject_incident": "POST /inject-incident",
                    "resolve_incident": "POST /resolve-incident",
                    "list_services": "/services",
                    "topology": "/topology",
                    "reset": "POST /reset-environment",
                    "interactive_docs": "/docs"
                }
            })
        elif path in ["/system-state", "/api/system-state"]:
            self._send_json(store.get_system_state())
        elif path in ["/services", "/api/services"]:
            self._send_json([s.to_dict() for s in store.services.values()])
        elif path.startswith("/services/") or path.startswith("/api/services/"):
            svc_id = path.split("/")[-1]
            svc = store.get_service(svc_id)
            if svc:
                self._send_json(svc.to_dict())
            else:
                self._send_json({"detail": f"Service '{svc_id}' not found."}, 404)
        elif path in ["/topology", "/api/topology"]:
            nodes = []
            edges = []
            for sid, svc in store.services.items():
                nodes.append({
                    "id": sid,
                    "label": svc.name,
                    "type": svc.gcp_resource_type,
                    "status": svc.status.value if hasattr(svc.status, "value") else str(svc.status),
                    "cpu": svc.cpu_percent,
                    "latency": svc.latency_ms
                })
                for dep in svc.dependencies:
                    edges.append({
                        "from": sid,
                        "to": dep,
                        "label": "depends_on"
                    })
            self._send_json({"nodes": nodes, "edges": edges})
        elif path == "/docs":
            docs_html = """<!DOCTYPE html>
<html>
<head>
    <title>HIVE Nebula GCP Digital Twin API</title>
    <style>
        body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; max-width: 900px; margin: 0 auto; }
        h1 { color: #38bdf8; }
        code { background: #1e293b; padding: 0.2rem 0.4rem; border-radius: 4px; color: #38bdf8; font-family: monospace; }
        .endpoint { background: #1e293b; border: 1px solid #334155; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; }
        .method { font-weight: bold; padding: 0.2rem 0.5rem; border-radius: 4px; display: inline-block; }
        .get { background: #0284c7; color: white; }
        .post { background: #16a34a; color: white; }
    </style>
</head>
<body>
    <h1>🚀 HIVE Nebula - GCP Digital Twin API</h1>
    <p>Simulated Google Cloud Infrastructure state engine for AI Incident Commander.</p>

    <div class="endpoint">
        <span class="method get">GET</span> <code>/system-state</code>
        <p>Returns system health, metrics for all 5 services, and active incidents.</p>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> <code>/inject-incident</code>
        <p>Injects failure (cpu_spike, memory_leak, latency_spike, network_partition, db_connection_exhaustion, service_crash) into a service.</p>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> <code>/resolve-incident</code>
        <p>Resolves active incident for a service via action (restart, scale_up, flush_cache).</p>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> <code>/handle-incident</code>
        <p>Runs 8-Agent LangGraph Orchestration pipeline end-to-end.</p>
    </div>

    <div class="endpoint">
        <span class="method post">POST</span> <code>/reset-environment</code>
        <p>Resets state to clean healthy baseline.</p>
    </div>
</body>
</html>"""
            self._send_html(docs_html)
        else:
            self._send_json({"detail": "Not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            body = json.loads(post_data.decode("utf-8")) if post_data else {}
        except Exception:
            body = {}

        if path in ["/inject-incident", "/api/inject-incident"]:
            target_svc = body.get("service", "orders-db")
            inc_type = body.get("type", "cpu_spike")
            details = body.get("details", "")
            res, status_code = store.inject_incident(target_svc, inc_type, details)
            self._send_json(res, status_code)

        elif path in ["/resolve-incident", "/api/resolve-incident"]:
            target_svc = body.get("service", "orders-db")
            action = body.get("action", "restart")
            res, status_code = store.resolve_incident_by_id(target_svc, action)
            self._send_json(res, status_code)

        elif path in ["/handle-incident", "/api/handle-incident"]:
            from orchestrator import run_incident_orchestration
            target_svc = body.get("service", "orders-db")
            auto_inject = body.get("auto_inject", True)
            inc_type = body.get("incident_type", "cpu_spike")

            if auto_inject:
                svc = store.get_service(target_svc)
                if svc and svc.status == ServiceStatus.HEALTHY:
                    store.inject_incident(target_svc, inc_type, "Auto-triggered by Multi-Agent Incident Commander")

            trace = run_incident_orchestration(target_svc)
            self._send_json(trace)

        elif path in ["/reset-environment", "/api/reset-environment"]:
            store.reset()
            self._send_json({
                "message": "GCP Digital Twin environment reset to healthy state.",
                "state": store.get_system_state()
            })

        else:
            self._send_json({"detail": "Not found"}, 404)

def run_server(port=8005):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, DigitalTwinRequestHandler)
    logger.info(f"Starting Python GCP Digital Twin HTTP server on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopping...")
        httpd.server_close()

if __name__ == "__main__":
    run_server(8005)
