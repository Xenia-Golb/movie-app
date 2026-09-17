from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Movie
from app.schemas import MovieCreate, MovieResponse
from app.services import get_movie_from_tmdb, get_trending_movies


router = APIRouter(
    prefix="/movies",
    tags=["movies"],
)

@router.post("/import/{tmdb_id}", response_model=MovieResponse)
async def import_movie(tmdb_id: int):
    db: Session = SessionLocal()

    try:
        tmdb_movie = await get_movie_from_tmdb(tmdb_id)

        existing_movie = db.scalar(
            select(Movie).where(Movie.tmdb_id == tmdb_id)
        )

        if existing_movie:
            existing_movie.title = tmdb_movie["title"]
            existing_movie.overview = tmdb_movie.get("overview")
            existing_movie.release_date = tmdb_movie.get("release_date") or None
            existing_movie.poster_path = tmdb_movie.get("poster_path")
            existing_movie.vote_average = tmdb_movie.get("vote_average")
            existing_movie.runtime = tmdb_movie.get("runtime")

            db.commit()
            db.refresh(existing_movie)

            return existing_movie

        movie = Movie(
            tmdb_id=tmdb_movie["id"],
            title=tmdb_movie["title"],
            overview=tmdb_movie.get("overview"),
            release_date=tmdb_movie.get("release_date") or None,
            poster_path=tmdb_movie.get("poster_path"),
            vote_average=tmdb_movie.get("vote_average"),
            runtime=tmdb_movie.get("runtime"),
        )

        db.add(movie)
        db.commit()
        db.refresh(movie)

        return movie

    finally:
        db.close()

@router.get("", response_model=list[MovieResponse])
def get_movies():
    db: Session = SessionLocal()

    try:
        result = db.execute(select(Movie))
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
            existing_movie = db.scalar(
                select(Movie).where(
                    Movie.tmdb_id == item["id"]
                )
            )

            if existing_movie:
                existing_movie.title = item["title"]
                existing_movie.overview = item.get("overview")
                existing_movie.release_date = item.get("release_date") or None
                existing_movie.poster_path = item.get("poster_path")
                existing_movie.vote_average = item.get("vote_average")
            else:
                movie = Movie(
                    tmdb_id=item["id"],
                    title=item["title"],
                    overview=item.get("overview"),
                    release_date=item.get("release_date") or None,
                    poster_path=item.get("poster_path"),
                    vote_average=item.get("vote_average"),
                )

                db.add(movie)

        db.commit()

        return {
            "synced": len(data["results"]),
        }

    finally:
        db.close()