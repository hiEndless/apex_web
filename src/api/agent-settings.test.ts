import { describe, expect, test, vi } from 'vitest';

function okJson(data: unknown) {
  return new Response(JSON.stringify({ code: 0, message: 'ok', data }), { status: 200 });
}

function errJson(status: number, detail: string) {
  return new Response(JSON.stringify({ detail }), { status });
}

describe('agentSettingsApi', () => {
  test('listModelProviders 正常请求', async () => {
    vi.resetModules();
    const fetchMock = vi.fn(async () => {
      return okJson([
        {
          id: 'p1',
          provider: 'openai',
          base_url: 'https://api.openai.com',
          is_active: true,
          availability_status: 'unknown',
          has_api_key: true,
          created_at: '2020-01-01',
          updated_at: '2020-01-01',
        },
      ]);
    });
    vi.stubGlobal('fetch', fetchMock as any);
    vi.stubGlobal('localStorage', { getItem: () => null } as any);

    const { agentSettingsApi } = await import('./agent-settings');
    const res = await agentSettingsApi.listModelProviders({ retries: 1, timeoutMs: 2000 });
    expect(res.length).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('网络错误会重试（最多次数内）', async () => {
    vi.resetModules();
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network'))
      .mockResolvedValueOnce(okJson([]));
    vi.stubGlobal('fetch', fetchMock as any);
    vi.stubGlobal('localStorage', { getItem: () => null } as any);

    const { agentSettingsApi } = await import('./agent-settings');
    const res = await agentSettingsApi.listAgentModelConfigs({ retries: 2, timeoutMs: 2000 });
    expect(res).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

