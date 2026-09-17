from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class MovieCreate(BaseModel):
    tmdb_id: int
    title: str
    overview: str | None = None
    release_date: date | None = None
    poster_path: str | None = None
    vote_average: float | None = None
    runtime: int | None = None


class MovieResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tmdb_id: int
    title: str
    overview: str | None
    release_date: date | None
    poster_path: str | None
    vote_average: float | None
    runtime: int | None
    updated_at: datetime
class MoviesResponse(BaseModel):
    items: list[MovieResponse]
    total: int
    limit: int
    offset: int
class MovieRating(BaseModel):
    value: float | None = None