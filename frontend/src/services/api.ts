import { SimulationState } from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export async function checkHealth(): Promise<{ status: string; timestamp: string }> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error(`Failed to fetch API health check status: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchSimulationState(): Promise<SimulationState> {
  const response = await fetch(`${API_BASE}/simulation`);
  if (!response.ok) {
    throw new Error(`Failed to fetch current simulation telemetry: ${response.statusText}`);
  }
  return response.json();
}

export async function injectChaos(scenario: string): Promise<SimulationState> {
  const response = await fetch(`${API_BASE}/inject-chaos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenario }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to inject simulated infrastructure chaos: ${response.statusText}`);
  }
  return response.json();
}

export async function resetSimulation(): Promise<SimulationState> {
  const response = await fetch(`${API_BASE}/reset`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(`Failed to reset system digital twin simulation: ${response.statusText}`);
  }
  return response.json();
}
