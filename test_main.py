"""
Unit tests for HIVE Nebula - GCP Digital Twin FastAPI service.
Tests state initialization, incident injection with dependency cascade, and incident resolution.
"""

import unittest
from fastapi.testclient import TestClient
from main import app, store, ServiceStatus

class TestGCPDigitalTwin(unittest.TestCase):

    def setUp(self):
        # Reset state before each test
        store.reset()
        self.client = TestClient(app)

    def test_01_initial_system_state(self):
        """Test that initial state has 5 healthy services and OPERATIONAL status."""
        response = self.client.get("/system-state")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["system_health"], "OPERATIONAL")
        self.assertEqual(data["active_incidents_count"], 0)
        self.assertEqual(len(data["services"]), 5)
        
        # Check orders-db baseline status
        orders_db = data["services"]["orders-db"]
        self.assertEqual(orders_db["status"], "Healthy")
        self.assertLess(orders_db["cpu_percent"], 50.0)

    def test_02_inject_incident_and_ripple_cascade(self):
        """Test injecting cpu_spike into orders-db and verifying ripple to dependent services."""
        payload = {
            "service": "orders-db",
            "type": "cpu_spike",
            "details": "Simulated thread lock on PostgreSQL primary"
        }
        response = self.client.post("/inject-incident", json=payload)
        self.assertEqual(response.status_code, 200)
        resp_data = response.json()
        
        self.assertEqual(resp_data["target_service"]["status"], "Critical")
        self.assertGreater(resp_data["target_service"]["cpu_percent"], 90.0)
        
        # Check overall system state after injection
        state_resp = self.client.get("/system-state")
        state_data = state_resp.json()
        self.assertEqual(state_data["system_health"], "CRITICAL_INCIDENT")
        self.assertEqual(state_data["active_incidents_count"], 1)

        # Verify cascading ripple: payments-service depends on orders-db -> should be Degraded/Critical
        payments = state_data["services"]["payments-service"]
        self.assertIn(payments["status"], ["Degraded", "Critical"])
        self.assertGreater(payments["latency_ms"], 35.0) # Latency increased

        # Verify cascading ripple: api-gateway depends on payments-service and orders-db
        gateway = state_data["services"]["api-gateway"]
        self.assertIn(gateway["status"], ["Degraded", "Critical"])

    def test_03_resolve_incident_and_recovery(self):
        """Test resolving incident on orders-db and confirming restoration of healthy state."""
        # First inject
        self.client.post("/inject-incident", json={"service": "orders-db", "type": "cpu_spike"})
        
        # Then resolve
        resolve_payload = {
            "service": "orders-db",
            "action": "restart"
        }
        response = self.client.post("/resolve-incident", json=resolve_payload)
        self.assertEqual(response.status_code, 200)
        
        # Check system state after resolution
        state_resp = self.client.get("/system-state")
        state_data = state_resp.json()
        
        self.assertEqual(state_data["system_health"], "OPERATIONAL")
        self.assertEqual(state_data["active_incidents_count"], 0)
        
        # Check orders-db restored to Healthy
        self.assertEqual(state_data["services"]["orders-db"]["status"], "Healthy")
        
        # Check dependent service payments-service restored to Healthy
        self.assertEqual(state_data["services"]["payments-service"]["status"], "Healthy")

    def test_04_topology_endpoint(self):
        """Test topology graph nodes and edges endpoint."""
        response = self.client.get("/topology")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(len(data["nodes"]), 5)
        self.assertGreater(len(data["edges"]), 0)

    def test_05_multi_agent_handle_incident(self):
        """Test LangGraph multi-agent orchestration end-to-end endpoint /handle-incident."""
        payload = {
            "service": "orders-db",
            "auto_inject": True,
            "incident_type": "cpu_spike"
        }
        response = self.client.post("/handle-incident", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        self.assertEqual(data["status"], "REPORTED")
        self.assertIn("monitor_findings", data)
        self.assertIn("diagnosis_report", data)
        self.assertIn("resource_options", data)
        self.assertIn("cost_estimates", data)
        self.assertIn("risk_estimates", data)
        self.assertIn("traffic_options", data)
        self.assertIn("consensus_decision", data)
        self.assertIn("final_report", data)
        self.assertEqual(len(data["agent_logs"]), 8)

if __name__ == "__main__":
    unittest.main()
