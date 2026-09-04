const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001";

type ApiOptions = RequestInit & {
  authenticated?: boolean;
};

type ApiErrorResponse = {
  message?: string | string[];
};

export async function apiFetch<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const {
    authenticated = false,
    headers,
    ...requestOptions
  } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set(
    "Content-Type",
    "application/json",
  );

  if (
    authenticated &&
    typeof window !== "undefined"
  ) {
    const token =
      localStorage.getItem("accessToken");

    if (token) {
      requestHeaders.set(
        "Authorization",
        `Bearer ${token}`,
      );
    }
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...requestOptions,
      headers: requestHeaders,
    },
  );

  if (!response.ok) {
    const errorData =
      (await response
        .json()
        .catch(() => null)) as
        | ApiErrorResponse
        | null;

    const message =
      Array.isArray(errorData?.message)
        ? errorData.message.join(", ")
        : errorData?.message ??
          "Ocurrió un error inesperado";

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}