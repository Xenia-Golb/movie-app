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