import { authStore } from '../store/authStore';

const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

export async function callEdgeFunction<T = any>(
  functionName: string,
  body: any,
  requireAuth = true,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const token = await authStore.getFirebaseIdToken();
  if (requireAuth && !token) throw new Error('Not authenticated');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${FUNCTIONS_BASE}/${functionName}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${response.status}`);
  }

  return response.json();
}
