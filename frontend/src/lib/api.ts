/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiOptions {
  method?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  token?: string;
  isFormData?: boolean;
}

export async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, isFormData = false } = options;

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!isFormData && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Unable to connect. Check your internet connection.');
  }

  if (!response.ok) {
    const status = response.status;
    const error = await response.json().catch(() => ({ message: '' }));
    const serverMsg = error.message || '';

    if (status === 401) throw new Error(serverMsg || 'Session expired. Please log in again.');
    if (status === 404) throw new Error(serverMsg || 'Resource not found.');
    if (status === 429) throw new Error(serverMsg || 'Too many requests. Wait a moment and try again.');
    if (status === 502) throw new Error(serverMsg || 'Service temporarily unavailable. Try again in a few seconds.');
    if (status >= 500) throw new Error(serverMsg || 'Something went wrong. Please try again.');
    throw new Error(serverMsg || `API error: ${status}`);
  }

  return response.json();
}

export const api = {
  // Health
  health: () => apiCall<{ status: string }>('/health'),

  // Auth
  verifyAuth: (token: string) =>
    apiCall<{ authenticated: boolean; userId: string }>('/auth/verify', {
      method: 'POST',
      token,
    }),

  // Scans
  createScan: (token: string, formData: FormData) =>
    apiCall<any>('/scan', {
      method: 'POST',
      token,
      body: formData,
      isFormData: true,
    }),

  getScans: (token: string, limit = 20, offset = 0) =>
    apiCall<{ scans: any[]; total: number }>(`/scans?limit=${limit}&offset=${offset}`, {
      token,
    }),

  getScan: (token: string, scanId: string) =>
    apiCall<any>(`/scans/${scanId}`, {
      token,
    }),

  // Chat (Phase 4)
  sendMessage: (token: string, data: { session_id?: string; scan_id?: string; message: string }) =>
    apiCall<{ session_id: string; reply: string }>('/chat', {
      method: 'POST',
      token,
      body: data,
    }),

  getChatSessions: (token: string) =>
    apiCall<{ sessions: any[] }>('/chat/sessions', {
      token,
    }),

  getMessages: (token: string, sessionId: string) =>
    apiCall<{ messages: any[] }>(`/chat/sessions/${sessionId}/messages`, {
      token,
    }),

  // Generate (Phase 4)
  generateBullet: (token: string, data: { project_description: string; tech_stack: string[] }) =>
    apiCall<{ bullet: string }>('/generate-bullet', {
      method: 'POST',
      token,
      body: data,
    }),
};
