from datetime import date

from pydantic import BaseModel


class MovieCreate(BaseModel):
    tmdb_id: int
    title: str
    overview: str | None = None
    release_date: date | None = None
    poster_path: str | None = None
    vote_average: float | None = None
    runtime: int | None = None