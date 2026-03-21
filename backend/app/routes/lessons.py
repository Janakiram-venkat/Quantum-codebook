import os
import json
from fastapi import APIRouter, HTTPException

router = APIRouter()

CONTENT_BASE_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "content")
LEVEL_FOLDERS = {
    "begainner": "begainner",
    "intermidiate": "intermidiate",
    "research": "research",
}


def build_lesson_summary(level: str, file_name: str):
    slug = file_name.replace(".json", "")
    summary = {
        "slug": slug,
        "id": slug,
        "title": slug,
        "level": level,
    }

    file_path = os.path.join(CONTENT_BASE_PATH, LEVEL_FOLDERS.get(level, "begainner"), file_name)

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        summary["id"] = data.get("id", slug)
        summary["title"] = data.get("title", slug)
        summary["level"] = data.get("level", level)
    except (OSError, json.JSONDecodeError):
        pass

    return summary


@router.get("/")
def get_lessons(level: str = 'all'):
    lessons = []

    target_levels = [level] if level in LEVEL_FOLDERS else list(LEVEL_FOLDERS.keys())

    for lvl in target_levels:
        folder = os.path.join(CONTENT_BASE_PATH, LEVEL_FOLDERS[lvl])
        if not os.path.exists(folder):
            continue

        for file in sorted(os.listdir(folder)):
            if file.endswith(".json"):
                lessons.append(build_lesson_summary(lvl, file))

    # keep natural order by filed content with beginner first
    return {"lessons": lessons}

@router.get("/{lesson_name}")
def get_lesson(lesson_name: str, level: str = None):
    levels_to_search = []

    if level and level in LEVEL_FOLDERS:
        levels_to_search = [level]
    else:
        levels_to_search = list(LEVEL_FOLDERS.keys())

    for lvl in levels_to_search:
        file_path = os.path.join(CONTENT_BASE_PATH, LEVEL_FOLDERS[lvl], f"{lesson_name}.json")
        if os.path.exists(file_path):
            with open(file_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data

    raise HTTPException(status_code=404, detail="Lesson not found")
