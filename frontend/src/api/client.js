const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL;

export const backendRequest = async (path, options = {}) => {
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