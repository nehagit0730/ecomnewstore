type FetchOptions = RequestInit & {
  params?: Record<string, string | string[]>;
};

function toQueryString(params: Record<string, string | string[]>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => qs.append(key, v));
    } else {
      qs.set(key, value);
    }
  }
  return qs.toString();
}

export async function apiClient<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...init } = options;
  const base = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_APP_URL ?? "";
  let url = `${base}/api${path}`;
  if (params) {
    url += `?${toQueryString(params)}`;
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
    credentials: "include",
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Request failed");
  }

  return res.json() as Promise<T>;
}
