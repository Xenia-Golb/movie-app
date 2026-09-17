const apiKey = '92fe3f0a161cd2c7f0da1ed04da51308';
const request = async (path, params = {}, options = {}) => {
  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  url.search = new URLSearchParams({
    api_key: apiKey,
    language: 'ru-RU',
    ...params,
  });
  const response = await fetch(url, options);
  if (!response.ok) {
    const error = new Error(
      'Не удалось связаться с TMDB. Проверьте подключение и попробуйте снова.',
    );
    error.status = response.status;
    throw error;
  }
  return response.json();
};

export const fetchMovies = (query, page = 1, signal, year = '') =>
  request(
    'search/movie',
    { query, page, ...(year ? { primary_release_year: year } : {}) },
    { signal },
  );

export const discoverMovies = (
  { year = '', minRating = 0 },
  page = 1,
  signal,
) =>
  request(
    'discover/movie',
    {
      page,
      sort_by: 'popularity.desc',
      ...(year ? { primary_release_year: year } : {}),
      ...(minRating ? { 'vote_average.gte': minRating } : {}),
    },
    { signal },
  );

export const fetchPopularMovies = (page = 1, signal) =>
  request('trending/movie/week', { page }, { signal });

export const fetchGenres = async () =>
  (await request('genre/movie/list')).genres;
export const createSession = async () =>
  (await request('authentication/guest_session/new')).guest_session_id;
export const rateMovie = (movie, value, sessionId) =>
  request(
    `movie/${movie.id}/rating`,
    { guest_session_id: sessionId },
    {
      method: value ? 'POST' : 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      ...(value ? { body: JSON.stringify({ value }) } : {}),
    },
  );

export const fetchMovieDetails = (movieId, signal) => {
  if (!/^[1-9]\d*$/.test(String(movieId)) || Number(movieId) > 2147483647) {
    return Promise.reject(new Error('Некорректный ID фильма.'));
  }
  return request(`movie/${movieId}`, {}, { signal });
};
