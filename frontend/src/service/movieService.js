const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;
const TMDB_API_URL = import.meta.env.VITE_TMDB_API_URL;
const apiKey = import.meta.env.VITE_TMDB_API_KEY;

const request = async (path, params = {}, options = {}) => {
  const url = new URL(`${TMDB_API_URL}/${path}`);

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

const backendRequest = async (path, options = {}) => {
  const response = await fetch(`${BACKEND_API_URL}${path}`, options);

  if (!response.ok) {
    const error = new Error(
      'Не удалось связаться с backend-сервером.',
    );

    error.status = response.status;

    throw error;
  }

  return response.json();
};

export const fetchMovies = async (
  query,
  page = 1,
  signal,
  year = '',
) => {
  const params = new URLSearchParams({
    query,
    page: String(page),
  });

  if (year) {
    params.set('year', year);
  }

  return backendRequest(
    `/movies/search/tmdb?${params.toString()}`,
    {
      signal,
    },
  );
};
export const discoverMovies = (
  {
    year = '',
    minRating = 0,
  },
  page = 1,
  signal,
) =>
  request(
    'discover/movie',
    {
      page,
      sort_by: 'popularity.desc',
      ...(year
        ? {
            primary_release_year: year,
          }
        : {}),
      ...(minRating
        ? {
            'vote_average.gte': minRating,
          }
        : {}),
    },
    {
      signal,
    },
  );

export const fetchPopularMovies = async (
  page = 1,
  signal,
) => {
  const limit = 20;
  const offset = (page - 1) * limit;

  const data = await backendRequest(
    `/movies?limit=${limit}&offset=${offset}`,
    {
      signal,
    },
  );

  return {
    page,
    results: data.items.map((movie) => ({
      ...movie,

      // frontend пока ожидает,
      // что id — это TMDB id
      id: movie.tmdb_id,

      // внутренний id PostgreSQL сохраняем отдельно
      db_id: movie.id,
    })),
    total_results: data.total,
    total_pages: Math.ceil(data.total / limit),
  };
};

export const fetchGenres = async () =>
  (await request('genre/movie/list')).genres;

export const createSession = async () =>
  (
    await request(
      'authentication/guest_session/new',
    )
  ).guest_session_id;

export const rateMovie = (
  movie,
  value,
  sessionId,
) =>
  request(
    `movie/${movie.id}/rating`,
    {
      guest_session_id: sessionId,
    },
    {
      method: value
        ? 'POST'
        : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(value
        ? {
            body: JSON.stringify({
              value,
            }),
          }
        : {}),
    },
  );

export const fetchMovieDetails = (
  movieId,
  signal,
) => {
  if (
    !/^[1-9]\d*$/.test(String(movieId)) ||
    Number(movieId) > 2147483647
  ) {
    return Promise.reject(
      new Error('Некорректный ID фильма.'),
    );
  }

  return request(
    `movie/${movieId}`,
    {},
    {
      signal,
    },
  );
};