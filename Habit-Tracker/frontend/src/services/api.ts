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

type ApiErrorResponse = {
  statusCode?: number;

  message?:
    | string
    | string[];

  error?: string;
};

/*
 * Extrae el mensaje que NestJS devuelve
 * dentro de response.data.
 *
 * Ejemplos:
 *
 * {
 *   statusCode: 400,
 *   message:
 *     "Este hábito no está programado para hoy",
 *   error: "Bad Request"
 * }
 *
 * o validaciones:
 *
 * {
 *   message: [
 *     "El nombre es obligatorio",
 *     "La cantidad debe ser mayor que 0"
 *   ]
 * }
 */
function getApiErrorMessage(
  error: AxiosError
): string | null {
  const data =
    error.response?.data as
      | ApiErrorResponse
      | undefined;

  if (!data) {
    return null;
  }

  if (
    Array.isArray(
      data.message
    )
  ) {
    const messages =
      data.message.filter(
        (message) =>
          typeof message ===
            "string" &&
          message.trim() !== ""
      );

    if (
      messages.length >
      0
    ) {
      return messages.join(
        " · "
      );
    }
  }

  if (
    typeof data.message ===
      "string" &&
    data.message.trim() !== ""
  ) {
    return data.message;
  }

  if (
    typeof data.error ===
      "string" &&
    data.error.trim() !== ""
  ) {
    return data.error;
  }

  return null;
}

/*
 * Conservamos el AxiosError completo
 * para no perder:
 *
 * - response
 * - status
 * - config
 * - request
 *
 * Únicamente sustituimos message por
 * el mensaje útil enviado por NestJS.
 */
function normalizeAxiosError(
  error: AxiosError
) {
  const apiMessage =
    getApiErrorMessage(
      error
    );

  if (apiMessage) {
    error.message =
      apiMessage;
  }

  return error;
}

/*
 * Normaliza cualquier error antes de
 * enviarlo nuevamente a los componentes.
 */
function normalizeError(
  error: unknown
) {
  if (
    axios.isAxiosError(
      error
    )
  ) {
    return normalizeAxiosError(
      error
    );
  }

  return error;
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

  async (
    error: AxiosError
  ) => {
    const originalRequest =
      error.config as
        | RetryRequestConfig
        | undefined;

    /*
     * Si NO es un 401, no necesitamos
     * renovar la sesión.
     *
     * Antes de rechazarlo sustituimos
     * error.message por el mensaje real
     * enviado por NestJS.
     */
    if (
      error.response?.status !==
        401 ||
      !originalRequest
    ) {
      return Promise.reject(
        normalizeAxiosError(
          error
        )
      );
    }

    const requestUrl =
      originalRequest.url ??
      "";

    /*
     * MUY IMPORTANTE:
     *
     * Si el propio /auth/refresh falla
     * con 401, NO intentamos refrescar
     * otra vez.
     *
     * Lo mismo para login.
     *
     * También normalizamos estos errores
     * para que Login pueda mostrar el
     * mensaje real del backend.
     */
    if (
      requestUrl.includes(
        "/auth/refresh"
      ) ||
      requestUrl.includes(
        "/auth/login"
      )
    ) {
      return Promise.reject(
        normalizeAxiosError(
          error
        )
      );
    }

    /*
     * Evitamos repetir infinitamente
     * la misma petición.
     */
    if (
      originalRequest._retry
    ) {
      return Promise.reject(
        normalizeAxiosError(
          error
        )
      );
    }

    originalRequest._retry =
      true;

    try {
      /*
       * Si todavía no existe un refresh
       * en proceso, lo iniciamos.
       */
      if (!refreshPromise) {
        refreshPromise =
          api
            .post(
              "/auth/refresh"
            )
            .then(
              () =>
                undefined
            )
            .finally(
              () => {
                refreshPromise =
                  null;
              }
            );
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
      return api(
        originalRequest
      );
    } catch (
      refreshError
    ) {
      /*
       * Si tampoco existe una sesión
       * renovable, dejamos que el error
       * llegue al AuthContext.
       *
       * Allí:
       *
       * setUser(null)
       *
       * y ProtectedRoute podrá
       * redirigir a /login.
       *
       * También normalizamos el mensaje
       * antes de propagarlo.
       */
      return Promise.reject(
        normalizeError(
          refreshError
        )
      );
    }
  }
);

export default api;