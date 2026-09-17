from fastapi import FastAPI
from sqlalchemy import text

from app.database import Base, engine
from app.models import Movie
from app.routers import movies_router

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(movies_router)


@app.get("/")
def root():
    return {"message": "Backend works"}


@app.get("/db-check")
def db_check():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT 1"))
        return {"database": result.scalar()}