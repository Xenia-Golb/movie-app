import { backendRequest } from './client';

export const fetchMovies = async (query, page = 1, signal, year = '') => {
  const params = new URLSearchParams({
    query,
    page: String(page),
  });

  if (year) {
    params.set('year', year);
  }

  return backendRequest(`/movies/search/tmdb?${params.toString()}`, { signal });
};

export const discoverMovies = async (
  { year = '', minRating = 0 },
  page = 1,
  signal,
) => {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (year) {
    params.set('year', year);
  }

  if (minRating) {
    params.set('min_rating', String(minRating));
  }

  return backendRequest(`/movies/discover/tmdb?${params.toString()}`, {
    signal,
  });
};

export const fetchPopularMovies = async (page = 1, signal) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  const data = await backendRequest(`/movies?limit=${limit}&offset=${offset}`, {
    signal,
  });

  return {
    page,
    results: data.items.map((movie) => ({
      ...movie,
      id: movie.tmdb_id,
      db_id: movie.id,
    })),
    total_results: data.total,
    total_pages: Math.ceil(data.total / limit),
  };
};

export const fetchMovieDetails = (movieId, signal) => {
  if (!/^[1-9]\d*$/.test(String(movieId)) || Number(movieId) > 2147483647) {
    return Promise.reject(new Error('Некорректный ID фильма.'));
  }

  return backendRequest(`/movies/tmdb/${movieId}`, { signal });
};

export const syncAllMovies = () =>
  backendRequest('/movies/sync-all', { method: 'POST' });
