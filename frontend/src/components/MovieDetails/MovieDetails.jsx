/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react';
import { Alert, Rate } from 'antd';
import { fetchMovieDetails } from '../../service';
import { useMovieContext } from '../../context/MovieContext';
import './MovieDetails.css';

export default function MovieDetails({ movieId, onBack }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const {
    ratedMovies,
    watchedMovies,
    toggleWatched,
    rateMovie,
    pending,
    error: ratingError,
    watchedError,
  } = useMovieContext();
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetchMovieDetails(movieId, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted)
          setMovie({
            ...data,
            genre_ids: (data.genres || []).map((genre) => genre.id),
          });
      })
      .catch((err) => {
        if (!controller.signal.aborted)
          setError(
            err.status === 404 ? 'Фильм не найден в TMDB.' : err.message,
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [movieId, retry]);
  useEffect(() => {
    if (!movie) return;
    const previous = document.title;
    document.title = `${movie.title} — Кинотека`;
    return () => {
      document.title = previous;
    };
  }, [movie]);
  const watched = watchedMovies.some((item) => item.id === Number(movieId));
  const rating =
    ratedMovies.find((item) => item.id === Number(movieId))?.rating || 0;
  const runtime = movie?.runtime
    ? `${Math.floor(movie.runtime / 60) ? `${Math.floor(movie.runtime / 60)} ч ` : ''}${movie.runtime % 60 ? `${movie.runtime % 60} мин` : ''}`.trim()
    : 'Не указана';

  return (
    <div className="movie-page">
      {movie?.backdrop_path && (
        <div
          className="movie-backdrop"
          style={{
            backgroundImage: `url(https://image.tmdb.org/t/p/w1280${movie.backdrop_path})`,
          }}
          aria-hidden="true"
        />
      )}
      <header className="page-container movie-header">
        <button className="back-button" onClick={onBack}>
          ← Назад к фильмам
        </button>
        <span>КИНОТЕКА</span>
      </header>
      <main className="page-container movie-main">
        {loading ? (
          <div
            role="status"
            aria-label="Загрузка информации о фильме"
            className="movie-loading"
          >
            <div className="skeleton" />
            <p>Загружаем историю…</p>
          </div>
        ) : error ? (
          <div className="empty-state" role="alert">
            <h1>Не удалось открыть фильм</h1>
            <p>{error}</p>
            <button onClick={() => setRetry((value) => value + 1)}>
              Попробовать снова
            </button>
          </div>
        ) : (
          movie && (
            <>
              <div className="movie-layout">
                <div className="movie-poster">
                  {movie.poster_path && !imageFailed ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={`Постер: ${movie.title}`}
                      onError={() => setImageFailed(true)}
                    />
                  ) : (
                    <div className="movie-poster-fallback">
                      Постер пока не добавлен
                    </div>
                  )}
                </div>
                <div className="movie-content">
                  <div className="eyebrow">
                    {movie.release_date?.slice(0, 4) || 'ДАТА НЕИЗВЕСТНА'} ·
                    ФИЛЬМ
                  </div>
                  <h1>{movie.title}</h1>
                  {movie.original_title !== movie.title && (
                    <p className="original-title">{movie.original_title}</p>
                  )}
                  {movie.tagline && (
                    <p className="movie-tagline">«{movie.tagline}»</p>
                  )}
                  <div className="movie-genres">
                    {(movie.genres || []).map((genre) => (
                      <span key={genre.id}>{genre.name}</span>
                    ))}
                  </div>
                  <dl className="movie-facts">
                    <div>
                      <dt>Рейтинг TMDB</dt>
                      <dd className="movie-score">
                        ★{' '}
                        {movie.vote_average > 0
                          ? movie.vote_average.toFixed(1)
                          : '—'}
                        <small>
                          {(movie.vote_count || 0).toLocaleString('ru-RU')}{' '}
                          оценок
                        </small>
                      </dd>
                    </div>
                    <div>
                      <dt>Длительность</dt>
                      <dd>{runtime}</dd>
                    </div>
                    <div>
                      <dt>Страна</dt>
                      <dd>
                        {(movie.production_countries || [])
                          .map((country) => country.name)
                          .join(', ') || 'Не указана'}
                      </dd>
                    </div>
                  </dl>
                  <section className="movie-overview">
                    <h2>О фильме</h2>
                    <p>
                      {movie.overview ||
                        'Описание этого фильма пока не добавлено.'}
                    </p>
                  </section>
                  <div className="movie-actions">
                    <button
                      className={watched ? 'watched-active' : ''}
                      onClick={() => toggleWatched(movie)}
                      aria-pressed={watched}
                    >
                      {watched ? '✓ Просмотрено' : '+ Уже смотрела'}
                    </button>
                    <div className="movie-personal-rating">
                      <span>Ваша оценка {rating ? `${rating}/10` : ''}</span>
                      <Rate
                        aria-label={`Ваша оценка: ${movie.title}`}
                        allowHalf
                        value={rating / 2}
                        disabled={!!pending[movie.id]}
                        onChange={(value) => rateMovie(movie, value * 2)}
                      />
                      {pending[movie.id] && <small>Сохраняем…</small>}
                    </div>
                  </div>
                  {(ratingError || watchedError) && (
                    <Alert
                      className="notice"
                      type="warning"
                      showIcon
                      message={watchedError || ratingError}
                    />
                  )}
                </div>
              </div>
            </>
          )
        )}
      </main>
    </div>
  );
}
