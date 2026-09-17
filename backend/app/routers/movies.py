from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Movie
from app.schemas import MovieResponse
from app.services import (
    get_movie_from_tmdb,
    get_trending_movies,
    upsert_movie,
)


router = APIRouter(
    prefix="/movies",
    tags=["movies"],
)


@router.post("/import/{tmdb_id}", response_model=MovieResponse)
async def import_movie(tmdb_id: int):
    db: Session = SessionLocal()

    try:
        tmdb_movie = await get_movie_from_tmdb(tmdb_id)

        movie = upsert_movie(
            db=db,
            movie_data=tmdb_movie,
        )

        db.commit()
        db.refresh(movie)

        return movie

    finally:
        db.close()


@router.get("", response_model=list[MovieResponse])
def get_movies(
    limit: int = 20,
    offset: int = 0,
):
    db: Session = SessionLocal()

    try:
        query = (
            select(Movie)
            .offset(offset)
            .limit(limit)
        )

        result = db.execute(query)
        movies = result.scalars().all()

        return movies

    finally:
        db.close()


@router.get("/{movie_id}", response_model=MovieResponse)
def get_movie(movie_id: int):
    db: Session = SessionLocal()

    try:
        movie = db.get(Movie, movie_id)

        if movie is None:
            raise HTTPException(
                status_code=404,
                detail="Movie not found",
            )

        return movie

    finally:
        db.close()


@router.post("/sync-trending")
async def sync_trending():
    db: Session = SessionLocal()

    try:
        data = await get_trending_movies()

        for item in data["results"]:
            upsert_movie(
                db=db,
                movie_data=item,
            )

        db.commit()

        return {
            "synced": len(data["results"]),
        }

    finally:
        db.close()