from app.services.movies import upsert_movie
from app.services.tmdb import (
    create_guest_session,
    discover_movies,
    get_genres,
    get_movie_from_tmdb,
    get_trending_movies,
    rate_movie,
    search_movies,
)