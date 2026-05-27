const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000';

type ApiErrorShape = {
  error?: {
    code: string;
    message: string;
  };
};

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  let response: Response;

  try {
    // Get auth token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('cropwaygis_auth_token') : null;
    
    // Prepare headers with auth token if available
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }

    response = await fetch(url, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch (error) {
    if (error instanceof TypeError) {
      const proxyUrl = `/api/proxy${path}`;
      response = await fetch(proxyUrl, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers ?? {}),
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error(
          `Network request failed for ${url}, and proxy fallback ${proxyUrl} also failed. Verify backend availability and proxy target URL.`
        );
      }
      const proxyJson = (await response.json()) as T & ApiErrorShape;
      if ('error' in proxyJson && proxyJson.error?.message) {
        throw new Error(proxyJson.error.message);
      }
      return proxyJson;
    }
    throw error;
  }

  const json = (await response.json()) as T & ApiErrorShape;
  if (!response.ok) {
    throw new Error(json.error?.message ?? 'Request failed.');
  }

  return json;
}
