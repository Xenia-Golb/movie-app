import { backendRequest } from './client';

export const fetchGenres = () =>
  backendRequest('/movies/genres');