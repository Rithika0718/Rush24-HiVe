from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.models.schemas import SimulationState
from app.services.state import state_manager
from app.services.simulation import simulation_engine

router = APIRouter()

class ChaosRequest(BaseModel):
    scenario: str  # "DB_LATENCY_SPIKE", "MEMORY_LEAK", "NETWORK_PARTITION"

@router.get("/health")
def get_health():
    return {"status": "OK", "timestamp": state_manager._get_timestamp()}

@router.get("/simulation", response_model=SimulationState)
def get_simulation():
    return state_manager.get_simulation_state()

@router.post("/inject-chaos", response_model=SimulationState)
def inject_chaos(request: ChaosRequest):
    valid_scenarios = ["DB_LATENCY_SPIKE", "MEMORY_LEAK", "NETWORK_PARTITION"]
    if request.scenario not in valid_scenarios:
        raise HTTPException(status_code=400, detail=f"Invalid scenario. Choose from {valid_scenarios}")
    
    updated_state = simulation_engine.run_chaos(request.scenario)
    return updated_state

@router.post("/reset", response_model=SimulationState)
def reset_simulation():
    state_manager.reset()
    return state_manager.get_simulation_state()
