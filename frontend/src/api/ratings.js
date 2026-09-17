import { backendRequest } from './client';

export const createSession = async () => {
  const data = await backendRequest(
    '/movies/guest-session',
    {
      method: 'POST',
    },
  );

  return data.guest_session_id;
};

export const rateMovie = (
  movie,
  value,
  sessionId,
) => {
  const params = new URLSearchParams({
    guest_session_id: sessionId,
  });

  return backendRequest(
    `/movies/tmdb/${movie.id}/rating?${params.toString()}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        value: value ?? null,
      }),
    },
  );
};