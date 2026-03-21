import json
import os

from fastapi import APIRouter, HTTPException

from app.simulator.stim_simulator import StimSimulator

router = APIRouter()

CONTENT_BASE_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "..",
    "content",
)

LEVEL_FOLDERS = ["begainner", "intermidiate", "research"]


def load_json(topic: str):
    for folder in LEVEL_FOLDERS:
        file_path = os.path.join(CONTENT_BASE_PATH, folder, f"{topic}.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)

    raise FileNotFoundError(f"{topic}.json not found")

@router.get("/simulate/{topic}")
def simulate(topic: str):
    try:
        data = load_json(topic)

        simulation = data.get("simulation", {})
        operations = simulation.get("operations", [])

        if not operations:
            return {
                "topic": topic,
                "message": "No operations found",
                "result": None,
            }

        simulator = StimSimulator()
        result = simulator.run(operations)

        return {
            "topic": topic,
            "operations": operations,
            "result": result,
        }

    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
