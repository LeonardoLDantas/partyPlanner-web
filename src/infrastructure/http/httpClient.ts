import { environment } from '@/shared/config/environment';

export class HttpClient {
  constructor(private readonly getAccessToken: () => string) {}

  async request<T>(path: string, init?: RequestInit) {
    const accessToken = this.getAccessToken();
    const response = await fetch(`${environment.apiBaseUrl}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(init?.headers ?? {})
      }
    });

    if (!response.ok) {
      const rawBody = await response.text().catch(() => '');
      const message = this.extractMessage(rawBody) ?? 'Falha ao comunicar com a API.';
      throw new Error(message);
    }

    if (response.status === 204) {
      return null as T;
    }

    return (await response.json()) as T;
  }

  private extractMessage(rawBody: string) {
    if (!rawBody) {
      return null;
    }

    try {
      const parsed = JSON.parse(rawBody) as { message?: string };
      return parsed.message ?? rawBody;
    } catch {
      return rawBody;
    }
  }
}
