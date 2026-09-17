/* eslint-disable react/prop-types */
import s from './MovieList.module.css';
import Card from '../Card/Card';
import { useMovieContext } from '../../context/MovieContext';
function MovieList({ movies }) {
  const { genres } = useMovieContext();
  return (
    <div className={s.grid}>
      {movies.map((movie) => {
        const genre = (movie.genre_ids || [])
          .map((id) => genres.find((item) => item.id === id)?.name)
          .filter(Boolean)
          .slice(0, 2)
          .join(', ');
        return (
          <Card
            key={movie.id}
            movieId={movie.id}
            title={movie.title}
            date={movie.release_date?.slice(0, 4)}
            description={movie.overview}
            image={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null
            }
            genre={genre}
            rating={
              Number.isFinite(movie.vote_average) && movie.vote_average > 0
                ? movie.vote_average.toFixed(1)
                : '—'
            }
          />
        );
      })}
    </div>
  );
}
export default MovieList;
