import { useEffect, useState, useRef } from 'react';
import { ConfigProvider, theme, Alert } from 'antd';
import { MovieList, MyInput, MyPagination } from './components';
import { useMovieContext } from './context/MovieContext';
import { fetchMovies, fetchPopularMovies, discoverMovies } from './service';
import ColorBends from '@components/ColorBends';
import MovieDetails from './components/MovieDetails/MovieDetails';
import './App.css';

function App() {
  const [movieId, setMovieId] = useState(
    () => window.location.hash.match(/^#movie\/([1-9]\d*)$/)?.[1] || null,
  );
  const catalogScroll = useRef(0);
  const detailsOpen = useRef(!!movieId);
  useEffect(() => {
    let frame;
    const navigate = () => {
      const id =
        window.location.hash.match(/^#movie\/([1-9]\d*)$/)?.[1] || null;
      if (id && !detailsOpen.current) catalogScroll.current = window.scrollY;
      detailsOpen.current = !!id;
      setMovieId(id);
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        window.scrollTo(0, id ? 0 : catalogScroll.current),
      );
    };
    window.addEventListener('hashchange', navigate);
    return () => {
      window.removeEventListener('hashchange', navigate);
      cancelAnimationFrame(frame);
    };
  }, []);
  const {
    ratedMovies,
    watchedMovies,
    watchedError,
    error: ratingError,
  } = useMovieContext();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState('search');
  const [movies, setMovies] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [genre, setGenre] = useState('Все жанры');
  const { genres } = useMovieContext();
  const [year, setYear] = useState('');
  const [minRating, setMinRating] = useState(0);
  const hasFilters = genre !== 'Все жанры' || !!year || minRating > 0;
  const years = Array.from(
    { length: new Date().getFullYear() + 2 - 1874 + 1 },
    (_, index) => new Date().getFullYear() + 2 - index,
  );
  const resetFilters = () => {
    setYear('');
    setMinRating(0);
    setGenre('Все жанры');
    setPage(1);
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const timer = setTimeout(
      async () => {
        try {
          const data = await (query.trim()
            ? fetchMovies(query.trim(), page, controller.signal, year)
            : year || minRating > 0
              ? discoverMovies({ year, minRating }, page, controller.signal)
              : fetchPopularMovies(page, controller.signal));
          if (controller.signal.aborted) return;
          setMovies(data.results || []);
          setPages(Math.min(data.total_pages || 1, 500));
        } catch (err) {
          if (!controller.signal.aborted) {
            setError(err.message);
            setMovies([]);
          }
        } finally {
          if (!controller.signal.aborted) setLoading(false);
        }
      },
      query.trim() ? 300 : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, page, retry, year, minRating]);

  const source =
    tab === 'rated' ? ratedMovies : tab === 'watched' ? watchedMovies : movies;
  const visible = source.filter((movie) => {
    const matchesGenre =
      genre === 'Все жанры' ||
      movie.genre_ids?.includes(genres.find((item) => item.name === genre)?.id);
    const matchesYear = !year || movie.release_date?.slice(0, 4) === year;
    const matchesRating =
      !minRating ||
      (Number.isFinite(movie.vote_average) && movie.vote_average >= minRating);
    return matchesGenre && matchesYear && matchesRating;
  });
  const availableGenres = genres
    .filter((item) =>
      source.some((movie) => movie.genre_ids?.includes(item.id)),
    )
    .slice(0, 6);
  const changeTab = (value) => {
    setTab(value);
    resetFilters();
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#f5a9c7',
          colorBgContainer: '#261c26',
          fontFamily: 'Inter, sans-serif',
          borderRadius: 10,
        },
      }}
    >
      {movieId ? (
        <MovieDetails
          key={movieId}
          movieId={movieId}
          onBack={() => {
            window.location.hash = '';
          }}
        />
      ) : (
        <div className="app">
          <div className="hero-shell">
            <ColorBends
              className="hero-bends"
              rotation={90}
              speed={0.2}
              colors={['#dc27ff', '#FF9FFC', '#6776ff']}
              transparent
              autoRotate={0}
              scale={1}
              frequency={1}
              warpStrength={1}
              mouseInfluence={1}
              parallax={0.5}
              noise={0.15}
              iterations={1}
              intensity={1.5}
              bandWidth={6}
            />
            <header className="header page-container">
              <nav aria-label="Основная навигация">
                <button
                  className={tab === 'search' ? 'nav-active' : ''}
                  onClick={() => changeTab('search')}
                >
                  Обзор
                </button>
                <button
                  className={tab === 'rated' ? 'nav-active' : ''}
                  onClick={() => changeTab('rated')}
                >
                  Мои оценки <span className="count">{ratedMovies.length}</span>
                </button>
                <button
                  className={tab === 'watched' ? 'nav-active' : ''}
                  onClick={() => changeTab('watched')}
                >
                  Просмотренное{' '}
                  <span className="count">{watchedMovies.length}</span>
                </button>
              </nav>
              <span className="header-note">
                <span /> Место для хорошего кино
              </span>
            </header>
            <section className="intro page-container">
              <div className="eyebrow">
                <span /> ВАШ СЛЕДУЮЩИЙ КИНОВЕЧЕР
              </div>
              <h1>
                {tab === 'watched' ? (
                  <>
                    Уже в вашей <em>истории.</em>
                  </>
                ) : tab === 'rated' ? (
                  <>
                    Кино, которое <em>с вами.</em>
                  </>
                ) : (
                  <>
                    Хорошее кино.
                    <br />В нужный <em>момент.</em>
                  </>
                )}
              </h1>
              <p>
                {tab === 'watched'
                  ? 'Все истории, которые вы уже посмотрели. Сохраняйте их здесь и возвращайтесь к любимым.'
                  : tab === 'rated'
                    ? 'Ваша коллекция впечатлений. Все фильмы, которым вы поставили оценку.'
                    : 'Находите новые истории, оценивайте любимые фильмы\nи собирайте свою коллекцию впечатлений.'}
              </p>
            </section>
            {tab === 'search' && (
              <div className="hero-search page-container">
                <MyInput
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                    setGenre('Все жанры');
                  }}
                  placeholder="Какой фильм ищем сегодня?"
                />
              </div>
            )}
          </div>
          <main className="page-container">
            <section className="catalog" aria-labelledby="catalog-title">
              <div className="catalog-toolbar">
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      {tab !== 'search'
                        ? 'ЛИЧНАЯ КОЛЛЕКЦИЯ'
                        : query.trim()
                          ? 'ПОИСК ПО КАТАЛОГУ'
                          : 'В ЦЕНТРЕ ВНИМАНИЯ'}
                    </span>
                    <h2 id="catalog-title">
                      {tab === 'watched'
                        ? 'Просмотренное'
                        : tab === 'rated'
                          ? 'Мои оценки'
                          : query.trim()
                            ? `Результаты для «${query.trim()}»`
                            : year || minRating > 0
                              ? 'Фильмы по вашим условиям'
                              : 'Популярно на этой неделе'}
                      <span className="heading-dot">.</span>
                    </h2>
                  </div>
                </div>
                <div
                  className="filters"
                  aria-label="Фильтр жанров на текущей странице"
                >
                  {[
                    'Все жанры',
                    ...availableGenres.map((item) => item.name),
                  ].map((name) => (
                    <button
                      key={name}
                      aria-pressed={genre === name}
                      className={genre === name ? 'selected' : ''}
                      onClick={() => setGenre(name)}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div className="catalog-filters">
                  <label htmlFor="release-year">
                    Год выпуска
                    <select
                      id="release-year"
                      value={year}
                      onChange={(event) => {
                        setYear(event.target.value);
                        setPage(1);
                        setGenre('Все жанры');
                      }}
                    >
                      <option value="">Все годы</option>
                      {years.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label htmlFor="minimum-rating">
                    Рейтинг TMDB
                    <select
                      id="minimum-rating"
                      value={minRating}
                      onChange={(event) => {
                        setMinRating(Number(event.target.value));
                        setPage(1);
                        setGenre('Все жанры');
                      }}
                    >
                      <option value={0}>Любой рейтинг</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                        <option key={value} value={value}>
                          От {value} и выше
                        </option>
                      ))}
                    </select>
                  </label>
                  {hasFilters && (
                    <button className="reset-filters" onClick={resetFilters}>
                      Сбросить фильтры ×
                    </button>
                  )}
                  {tab === 'search' && query.trim() && minRating > 0 && (
                    <p className="filter-note">
                      Рейтинг применяется к текущей странице результатов поиска.
                    </p>
                  )}
                </div>
              </div>
              {(ratingError || watchedError) && (
                <Alert
                  type="warning"
                  showIcon
                  message={watchedError || ratingError}
                  className="notice"
                />
              )}
              {tab === 'search' && error ? (
                <div className="empty-state">
                  <span>↗</span>
                  <h3>Не удалось загрузить фильмы</h3>
                  <p>{error}</p>
                  <button onClick={() => setRetry((value) => value + 1)}>
                    Попробовать снова
                  </button>
                </div>
              ) : tab === 'search' && loading ? (
                <div
                  className="skeleton-grid"
                  aria-label="Загрузка фильмов"
                  role="status"
                >
                  {Array.from({ length: 10 }, (_, index) => (
                    <div className="skeleton" key={index} />
                  ))}
                </div>
              ) : visible.length ? (
                <MovieList movies={visible} />
              ) : (
                <div className="empty-state">
                  <span>✳</span>
                  <h3>
                    {hasFilters
                      ? 'Нет фильмов по выбранным условиям'
                      : tab === 'watched'
                        ? 'Здесь будет ваше просмотренное кино'
                        : tab === 'rated'
                          ? 'Ваша история кино начинается здесь'
                          : 'Таких фильмов не нашлось'}
                  </h3>
                  <p>
                    {hasFilters
                      ? 'Попробуйте другой год, снизьте рейтинг или сбросьте фильтры.'
                      : tab === 'watched'
                        ? 'Откройте страницу фильма и нажмите «Уже смотрела» — он появится здесь.'
                        : tab === 'rated'
                          ? 'Поставьте оценку на странице фильма — он появится в вашей коллекции.'
                          : 'Попробуйте другое название или выберите другой жанр.'}
                  </p>
                  <button
                    onClick={() => {
                      if (hasFilters) {
                        resetFilters();
                        return;
                      }
                      changeTab('search');
                      setQuery('');
                      setPage(1);
                    }}
                  >
                    {hasFilters
                      ? 'Сбросить фильтры'
                      : tab !== 'search'
                        ? 'Найти первый фильм'
                        : 'Вернуться к популярному'}
                  </button>
                </div>
              )}
              {tab === 'search' && !error && (
                <MyPagination
                  currentPage={page}
                  totalPages={pages}
                  loading={loading}
                  setCurrentPage={(value) => {
                    setPage(value);
                    setGenre('Все жанры');
                    document
                      .getElementById('catalog-title')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                />
              )}
            </section>
          </main>
          <footer className="page-container">
            <span>Жизнь слишком коротка для плохого кино.</span>
            <span>Данные предоставлены TMDB</span>
          </footer>
        </div>
      )}
    </ConfigProvider>
  );
}
export default App;
