from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from api.routes import health, system
from api.routes import projetos, tarefas, grupos, sprints, tags, usuarios, contratos, transacoes, search, chat
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
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:18789", 
        "https://edihub.work.gd", 
        "http://edihub.work.gd",
        "http://31.97.164.206",
        "http://31.97.164.206:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(system.router, prefix="/api", tags=["System"])
app.include_router(projetos.router, prefix="/api/projetos", tags=["Projetos"])
app.include_router(tarefas.router, prefix="/api/tarefas", tags=["Tarefas"])
app.include_router(grupos.router, prefix="/api/grupos", tags=["Grupos"])
app.include_router(sprints.router, prefix="/api/sprints", tags=["Sprints"])
app.include_router(tags.router, prefix="/api/tags", tags=["Tags"])
app.include_router(usuarios.router, prefix="/api/usuarios", tags=["Usuarios"])
app.include_router(contratos.router, prefix="/api/contratos", tags=["Contratos"])
app.include_router(transacoes.router, prefix="/api/transacoes", tags=["Transacoes"])
app.include_router(search.router, prefix="/api/search", tags=["Search"])
app.include_router(chat.router, prefix="/api", tags=["Chat"])


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
