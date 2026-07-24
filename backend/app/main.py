import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers.simulation import router as simulation_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="HIVE Nebula API",
    description="The Autonomous AI Incident Commander Simulation Backend",
    version="1.0.0"
)

# Configure CORS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(simulation_router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "HIVE Nebula Backend API is running. Access simulation endpoints at /api/simulation."}

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host=host, port=port, reload=True)
