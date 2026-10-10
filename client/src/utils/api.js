const BASE = ''; // mismo origen (prod) o proxy de Vite en dev

// Handler global que AuthContext registra al montar.
// Se llama cuando una request devuelve 401 (sesión expirada o invalidada).
let onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export async function api(
  path,
  { method = 'GET', body, headers, allowUnauthorized = false, ...rest } = {}
) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body
      ? { 'Content-Type': 'application/json', ...(headers || {}) }
      : headers,
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin body (ej. 204)
  }

  // 401 global: avisamos al AuthContext, salvo que el caller lo espere.
  if (res.status === 401 && !allowUnauthorized && onUnauthorized) {
    onUnauthorized();
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Error ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}