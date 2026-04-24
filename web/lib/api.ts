const DEFAULT_API_BASE_URL = "http://localhost:3001";

export type QueryValue = string | number | boolean | null | undefined;
export type QueryParams = Record<string, QueryValue>;

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  timestamp: string;
};

type ApiErrorResponse = {
  success: false;
  message?: string | string[];
  timestamp?: string;
};

type ApiRequestOptions<TBody = unknown, TQuery extends QueryParams = QueryParams> = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: TBody;
  headers?: HeadersInit;
  query?: TQuery;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;

  payload?: ApiErrorResponse | null;

  constructor(message: string, status: number, payload?: ApiErrorResponse | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export function getApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (typeof window !== "undefined") {
    if (
      configuredBaseUrl &&
      !configuredBaseUrl.includes("localhost") &&
      !configuredBaseUrl.includes("127.0.0.1")
    ) {
      return configuredBaseUrl;
    }

    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }

  return configuredBaseUrl ?? DEFAULT_API_BASE_URL;
}

export function buildApiUrl(path: string) {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return `${getApiBaseUrl()}${path}`;
}

function buildQueryString(query?: QueryParams) {
  if (!query) {
    return "";
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const result = searchParams.toString();
  return result ? `?${result}` : "";
}

function getErrorMessage(payload: ApiErrorResponse | null, fallbackStatus: number) {
  const rawMessage = payload?.message;

  if (Array.isArray(rawMessage)) {
    return rawMessage.join("，");
  }

  if (typeof rawMessage === "string" && rawMessage.trim()) {
    return rawMessage;
  }

  if (fallbackStatus >= 500) {
    return "服务暂时不可用，请稍后重试";
  }

  return "请求失败";
}

export async function apiRequest<TResponse, TBody = unknown, TQuery extends QueryParams = QueryParams>(
  path: string,
  options: ApiRequestOptions<TBody, TQuery> = {},
) {
  const {
    method = "GET",
    body,
    headers,
    query,
    signal,
  } = options;

  const response = await fetch(buildApiUrl(`${path}${buildQueryString(query)}`), {
    method,
    credentials: "include",
    headers: {
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccessResponse<TResponse>
    | ApiErrorResponse
    | null;

  if (!response.ok || !payload || payload.success === false) {
    throw new ApiError(getErrorMessage((payload as ApiErrorResponse | null) ?? null, response.status), response.status, payload as ApiErrorResponse | null);
  }

  return payload.data;
}
