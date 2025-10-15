import axios, { type AxiosError } from 'axios';

// # 1. Crear una instancia de Axios pre-configurada.
// Esto nos permite centralizar la configuración base de la API (URL, headers, etc.)
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// # 2. (Opcional pero recomendado) Interceptor para añadir el token de autenticación a las peticiones.
// Si el usuario está logueado, se adjuntará su token en cada llamada a la API.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// # 3. Interceptor de respuestas para manejar errores globalmente.
// Este es el núcleo del manejo automático de errores.
apiClient.interceptors.response.use(
  // La función para respuestas exitosas (código 2xx) no hace nada y solo devuelve la respuesta.
  (response) => response,

  // La función para respuestas con error se activa para cualquier código que no sea 2xx.
  (error: AxiosError) => {
    // Es importante devolver `Promise.reject(error)`.
    // Esto asegura que la promesa de la llamada a la API (ej: apiClient.post(...))
    // realmente falle, permitiendo que el bloque `.catch()` o el `try-catch` en el componente se active.
    // Sin esto, el error sería "silenciado" aquí y nunca llegaría al componente.
    return Promise.reject(error);
  }
);

export default apiClient;
