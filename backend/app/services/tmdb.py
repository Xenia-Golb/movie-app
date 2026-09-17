import httpx

from app.config import settings


TMDB_BASE_URL = "https://api.themoviedb.org/3"


async def get_movie_from_tmdb(tmdb_id: int):
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}"

    params = {
        "api_key": settings.tmdb_api_key,
        "language": "ru-RU",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params=params,
        )

        response.raise_for_status()

        return response.json()
async def get_trending_movies():
    url = f"{TMDB_BASE_URL}/trending/movie/week"

    params = {
        "api_key": settings.tmdb_api_key,
        "language": "ru-RU",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        return response.json()
async def search_movies(
    query: str,
    page: int = 1,
    year: str | None = None,
):
    url = f"{TMDB_BASE_URL}/search/movie"

    params = {
        "api_key": settings.tmdb_api_key,
        "language": "ru-RU",
        "query": query,
        "page": page,
    }

    if year:
        params["primary_release_year"] = year

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            params=params,
        )

        response.raise_for_status()

        return response.json()
async def discover_movies(
    page: int = 1,
    year: str | None = None,
    min_rating: float = 0,
):
    url = f"{TMDB_BASE_URL}/discover/movie"

    params = {
        "api_key": settings.tmdb_api_key,
        "language": "ru-RU",
        "page": page,
        "sort_by": "popularity.desc",
    }

    if year:
        params["primary_release_year"] = year

    if min_rating:
        params["vote_average.gte"] = min_rating

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        return response.json()
async def get_genres():
    url = f"{TMDB_BASE_URL}/genre/movie/list"

    params = {
        "api_key": settings.tmdb_api_key,
        "language": "ru-RU",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        return response.json()
async def create_guest_session():
    url = f"{TMDB_BASE_URL}/authentication/guest_session/new"

    params = {
        "api_key": settings.tmdb_api_key,
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()

        return response.json()


async def rate_movie(
    tmdb_id: int,
    value: float | None,
    guest_session_id: str,
):
    url = f"{TMDB_BASE_URL}/movie/{tmdb_id}/rating"

    params = {
        "api_key": settings.tmdb_api_key,
        "guest_session_id": guest_session_id,
    }

    async with httpx.AsyncClient() as client:
        if value is None:
            response = await client.delete(
                url,
                params=params,
            )
        else:
            response = await client.post(
                url,
                params=params,
                json={
                    "value": value,
                },
            )

        response.raise_for_status()

        return response.json()