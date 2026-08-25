const TOKEN_KEY = 'eps.auth.token';
const EXPIRES_KEY = 'eps.auth.expiresAt';

let expiredCallback = null;

export function setToken(token, expiresAt) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_KEY, String(expiresAt));
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_KEY);
}

// Self-clears (and returns null) once the token's expiry has passed, so
// nothing else has to remember to check the clock separately.
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const expiresAt = Number(localStorage.getItem(EXPIRES_KEY) || 0);
  if (expiresAt && Date.now() > expiresAt) {
    clearToken();
    return null;
  }
  return token;
}

export function getExpiresAt() {
  return Number(localStorage.getItem(EXPIRES_KEY) || 0);
}

// AuthContext registers a callback here so the API client (which doesn't
// know about React) can trigger a logout when a 401 comes back or the
// stored token has expired.
export function onTokenExpired(callback) {
  expiredCallback = callback;
}

export function notifyExpired() {
  clearToken();
  if (expiredCallback) expiredCallback();
}
