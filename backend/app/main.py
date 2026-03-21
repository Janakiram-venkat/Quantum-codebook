from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.simulate import router as simulate_router
from app.routes.lessons import router as lessons_router

app = FastAPI(title="Quantum Codebook API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(simulate_router, prefix="/api")
app.include_router(lessons_router, prefix="/api/lessons")


@app.get("/")
def root():
    return {"message": "Quantum Codebook API running"}
