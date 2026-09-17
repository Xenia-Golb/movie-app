from fastapi import APIRouter
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.movie import Movie
from app.schemas import MovieCreate


router = APIRouter(
    prefix="/movies",
    tags=["movies"],
)


@router.post("")
def create_movie(movie_data: MovieCreate):
    db: Session = SessionLocal()

    try:
        movie = Movie(
            tmdb_id=movie_data.tmdb_id,
            title=movie_data.title,
            overview=movie_data.overview,
            release_date=movie_data.release_date,
            poster_path=movie_data.poster_path,
            vote_average=movie_data.vote_average,
            runtime=movie_data.runtime,
        )

        db.add(movie)
        db.commit()
        db.refresh(movie)

        return movie
    finally:
        db.close()