/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchGenres, createSession, rateMovie } from '../service/index';
const MovieContext = createContext();
export const useMovieContext = () => useContext(MovieContext);
const storageKey = 'frame-rated-movies';
const watchedKey = 'frame-watched-movies';
function readWatched() {
  try {
    const value = JSON.parse(localStorage.getItem(watchedKey) || '[]');
    return Array.isArray(value)
      ? value.filter(
          (movie) =>
            movie &&
            Number.isFinite(movie.id) &&
            typeof movie.title === 'string',
        )
      : [];
  } catch {
    return [];
  }
}
function readRatings() {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(value)
      ? value.filter(
          (movie) =>
            movie &&
            Number.isFinite(movie.id) &&
            typeof movie.title === 'string' &&
            movie.rating > 0 &&
            movie.rating <= 10,
        )
      : [];
  } catch {
    return [];
  }
}
// eslint-disable-next-line react/prop-types
export const MovieProvider = ({ children }) => {
  const [genres, setGenres] = useState([]);
  const [ratedMovies, setRatedMovies] = useState(readRatings);
  const [watchedMovies, setWatchedMovies] = useState(readWatched);
  const [watchedError, setWatchedError] = useState(null);
  const [pending, setPending] = useState({});
  const [error, setError] = useState(null);
  const session = useRef(null);
  const inFlight = useRef(new Set());
  useEffect(() => {
    let cancelled = false;
    fetchGenres()
      .then((value) => {
        if (!cancelled) setGenres(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(ratedMovies));
    } catch {
      setError(
        'Оценка принята, но браузер не разрешил сохранить коллекцию на этом устройстве.',
      );
    }
  }, [ratedMovies]);
  useEffect(() => {
    try {
      localStorage.setItem(watchedKey, JSON.stringify(watchedMovies));
      setWatchedError(null);
    } catch {
      setWatchedError(
        'Браузер не разрешил сохранить просмотренное. Изменения доступны только до перезагрузки.',
      );
    }
  }, [watchedMovies]);
  const toggleWatched = (movie) => {
    setWatchedMovies((previous) =>
      previous.some((item) => item.id === movie.id)
        ? previous.filter((item) => item.id !== movie.id)
        : [movie, ...previous],
    );
  };
  const handleRateMovie = async (movie, value) => {
    if (inFlight.current.has(movie.id)) return;
    inFlight.current.add(movie.id);
    setPending((previous) => ({ ...previous, [movie.id]: true }));
    setError(null);
    try {
      if (!session.current) session.current = createSession();
      const sessionId = await session.current;
      await rateMovie(movie, value, sessionId);
      setRatedMovies((previous) =>
        value
          ? [
              ...previous.filter((item) => item.id !== movie.id),
              { ...movie, rating: value },
            ]
          : previous.filter((item) => item.id !== movie.id),
      );
    } catch {
      session.current = null;
      setError(
        'Не удалось сохранить оценку. Проверьте подключение к TMDB и попробуйте ещё раз.',
      );
    } finally {
      inFlight.current.delete(movie.id);
      setPending((previous) => ({ ...previous, [movie.id]: false }));
    }
  };
  return (
    <MovieContext.Provider
      value={{
        genres,
        ratedMovies,
        watchedMovies,
        toggleWatched,
        watchedError,
        rateMovie: handleRateMovie,
        pending,
        error,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
};
