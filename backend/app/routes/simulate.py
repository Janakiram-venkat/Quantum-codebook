import json
import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from app.simulator.stim_simulator import StimSimulator

router = APIRouter()

class CustomSimulationRequest(BaseModel):
    operations: List[Dict[str, Any]]
    shots: int = 1000

CONTENT_BASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "content",
)

# include advanced track
LEVEL_FOLDERS = [
    "beginner",
    "intermediate",
    "advance",
    "research"
]


def load_json(topic: str):

    for folder in LEVEL_FOLDERS:

        file_path = os.path.join(
            CONTENT_BASE_PATH,
            folder,
            f"{topic}.json"
        )

        if os.path.exists(file_path):

            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)

    raise FileNotFoundError(f"{topic}.json not found")


@router.post("/simulate/custom")
def simulate_custom(request: CustomSimulationRequest):
    try:
        if not request.operations:
            return {
                "topic": "custom",
                "message": "No simulation block found",
                "result": None
            }

        simulator = StimSimulator()
        result = simulator.run(
            request.operations,
            shots=request.shots
        )
        return {
            "topic": "custom",
            "level": "custom",
            "operations": request.operations,
            "result": result
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("/simulate/{topic}")
def simulate(topic: str):

    try:

        data = load_json(topic)

        simulation = data.get("simulation", {})

        operations = simulation.get("operations", [])

        shots = simulation.get("shots", 1000)

        if not operations:

            return {

                "topic": topic,

                "message": "No simulation block found",

                "result": None
            }

        simulator = StimSimulator()

        result = simulator.run(
            operations,
            shots=shots
        )

        return {

            "topic": topic,

            "level": data.get("level"),

            "operations": operations,

            "result": result
        }

    except FileNotFoundError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e)
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )