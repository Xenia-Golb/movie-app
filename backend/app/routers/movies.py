from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Movie
from app.schemas import MovieRating, MovieResponse, MoviesResponse
from app.services import (
    create_guest_session,
    discover_movies,
    get_genres,
    get_movie_from_tmdb,
    get_trending_movies,
    rate_movie,
    search_movies,
    upsert_movie,
)


router = APIRouter(
    prefix="/movies",
    tags=["movies"],
)


@router.get("", response_model=MoviesResponse)
def get_movies(
    limit: int = 20,
    offset: int = 0,
    search: str | None = None,
):
    db: Session = SessionLocal()

    try:
        query = select(Movie)
        count_query = select(func.count(Movie.id))

        if search:
            search_filter = Movie.title.ilike(f"%{search}%")

            query = query.where(search_filter)
            count_query = count_query.where(search_filter)

        total = db.scalar(count_query) or 0

        query = (
            query
            .offset(offset)
            .limit(limit)
        )

        result = db.execute(query)
        movies = result.scalars().all()

        return {
            "items": movies,
            "total": total,
            "limit": limit,
            "offset": offset,
        }

    finally:
        db.close()

@router.post("/sync-all")
async def sync_all_movies():
    db: Session = SessionLocal()

    try:
        movies = db.scalars(
            select(Movie)
        ).all()

        updated = 0

        for movie in movies:
            tmdb_movie = await get_movie_from_tmdb(
                movie.tmdb_id
            )

            upsert_movie(
                db=db,
                movie_data=tmdb_movie,
            )

            updated += 1

        db.commit()

        return {
            "updated": updated,
        }

    finally:
        db.close()
@router.get("/search/tmdb")
async def search_tmdb_movies(
    query: str,
    page: int = 1,
    year: str | None = None,
):
    return await search_movies(
        query=query,
        page=page,
        year=year,
    )


@router.get("/discover/tmdb")
async def discover_tmdb_movies(
    page: int = 1,
    year: str | None = None,
    min_rating: float = 0,
):
    return await discover_movies(
        page=page,
        year=year,
        min_rating=min_rating,
    )


@router.get("/genres")
async def get_movie_genres():
    data = await get_genres()

    return data["genres"]


@router.get("/tmdb/{tmdb_id}")
async def get_tmdb_movie(tmdb_id: int):
    return await get_movie_from_tmdb(tmdb_id)


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


@router.post("/guest-session")
async def create_tmdb_guest_session():
    data = await create_guest_session()

    return {
        "guest_session_id": data["guest_session_id"],
    }


@router.post("/tmdb/{tmdb_id}/rating")
async def set_movie_rating(
    tmdb_id: int,
    rating: MovieRating,
    guest_session_id: str,
):
    return await rate_movie(
        tmdb_id=tmdb_id,
        value=rating.value,
        guest_session_id=guest_session_id,
    )