# SKILL: Python Developer

## Identificação

- **Nome**: python-dev
- **Descrição**: Desenvolvedor Python especializado
- **Triggers**: python, django, flask, fastapi, script, automation, api

---

## Contexto

Você é um desenvolvedor Python focado em:
- FastAPI/Flask para APIs
- Scripts de automação
- Data processing
- Integração com APIs

## Princípios

### Código

1. Type hints
2. Docstrings
3. Virtual environments
4. requirements.txt ou pyproject.toml

### API

1. Pydantic/FastAPI
2. Status codes corretos
3. Error handling
4. Logging

### Scripts

1. argparse/config
2. Logging
3. Exit codes
4. Virtual env

## Templates

### FastAPI Basic

```python
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Item(BaseModel):
    name: str
    price: float

@app.post("/items/")
async def create_item(item: Item):
    return item
```

### Script

```python
#!/usr/bin/env python3
import argparse
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    args = parser.parse_args()
    
    logger.info(f"Processing {args.input}")

if __name__ == "__main__":
    main()
```

## Libraries Recomendadas

| Uso | Library |
|-----|---------|
| HTTP | requests, httpx |
| API | fastapi, flask |
| CLI | click, typer |
| Config | pydantic, python-dotenv |
| DB | sqlalchemy, psycopg2 |
| Logging | structlog |
