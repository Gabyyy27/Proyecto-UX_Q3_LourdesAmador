import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3001",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryRequestConfig
  extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/*
 * Si varias peticiones reciben 401
 * al mismo tiempo, solamente hacemos
 * un refresh.
 */
let refreshPromise:
  Promise<void> | null = null;

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | RetryRequestConfig
        | undefined;

    /*
     * Si no es un 401,
     * devolvemos el error normalmente.
     */
    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }

    const requestUrl =
      originalRequest.url ?? "";

    /*
     * MUY IMPORTANTE:
     *
     * Si el propio /auth/refresh falla
     * con 401, NO intentamos refrescar
     * otra vez.
     *
     * Lo mismo para login.
     */
    if (
      requestUrl.includes(
        "/auth/refresh"
      ) ||
      requestUrl.includes(
        "/auth/login"
      )
    ) {
      return Promise.reject(error);
    }

    /*
     * Evitamos repetir infinitamente
     * la misma petición.
     */
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      /*
       * Si todavía no existe un refresh
       * en proceso, lo iniciamos.
       */
      if (!refreshPromise) {
        refreshPromise = api
          .post("/auth/refresh")
          .then(() => undefined)
          .finally(() => {
            refreshPromise = null;
          });
      }

      /*
       * Esperamos a que finalice
       * la renovación.
       */
      await refreshPromise;

      /*
       * Si funcionó, repetimos
       * la petición original.
       */
      return api(originalRequest);
    } catch (refreshError) {
      /*
       * Si tampoco existe una sesión
       * renovable, dejamos que el error
       * llegue al AuthContext.
       *
       * Allí:
       * setUser(null)
       *
       * y ProtectedRoute podrá
       * redirigir a /login.
       */
      return Promise.reject(
        refreshError
      );
    }
  }
);

export default api;