from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from api.routes import tarefas, contratos, transacoes, search, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting EdiculaWorks API...")
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
    allow_origins=["http://localhost:3000", "http://localhost:18789"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(tarefas.router, prefix="/api/tarefas", tags=["Tarefas"])
app.include_router(contratos.router, prefix="/api/contratos", tags=["Contratos"])
app.include_router(transacoes.router, prefix="/api/transacoes", tags=["Transações"])
app.include_router(search.router, prefix="/api/search", tags=["Busca"])


@app.get("/")
async def root():
    return {
        "name": "EdiculaWorks API",
        "version": "1.0.0",
        "status": "running"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
