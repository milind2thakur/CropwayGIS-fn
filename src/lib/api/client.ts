const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

type ApiErrorShape = {
  error?: {
    code: string;
    message: string;
  };
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const json = (await response.json()) as T & ApiErrorShape;
  if (!response.ok) {
    throw new Error(json.error?.message ?? 'Request failed.');
  }

  return json;
}

