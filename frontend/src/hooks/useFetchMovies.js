import { useState, useCallback } from 'react';
import { fetchMovies } from '../service/index';

const useFetchMovies = () => {
  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (query, page = 1) => {
    if (!query) {
      setMovies([]);
      setTotalPages(1);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMovies(query, page);
      if (data?.results) {
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } else {
        throw new Error('No results found');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    movies,
    totalPages,
    loading,
    error,
    fetchData,
  };
};

export default useFetchMovies;
