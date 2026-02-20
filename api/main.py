from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from api.routes import health
from api.database import engine, Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting EdiculaWorks API...")
    Base.metadata.create_all(bind=engine)
    yield
    print("Shutting down EdiculaWorks API...")


app = FastAPI(
    title="EdiculaWorks API",
    description="API para gestão de tarefas, contratos e análises",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:18789", "https://edihub.work.gd", "http://edihub.work.gd"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])


@app.get("/")
async def root():
    return {
        "name": "EdiculaWorks API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
