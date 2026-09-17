from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Movie


def parse_release_date(value: str | None) -> date | None:
    if not value:
        return None

    return date.fromisoformat(value)


def upsert_movie(
    db: Session,
    movie_data: dict,
) -> Movie:
    tmdb_id = movie_data["id"]

    movie = db.scalar(
        select(Movie).where(Movie.tmdb_id == tmdb_id)
    )

    if movie is None:
        movie = Movie(
            tmdb_id=tmdb_id,
            title=movie_data["title"],
        )

        db.add(movie)

    movie.title = movie_data["title"]
    movie.overview = movie_data.get("overview")
    movie.release_date = parse_release_date(
        movie_data.get("release_date")
    )
    movie.poster_path = movie_data.get("poster_path")
    movie.vote_average = movie_data.get("vote_average")

    if "runtime" in movie_data:
        movie.runtime = movie_data.get("runtime")

    return movie