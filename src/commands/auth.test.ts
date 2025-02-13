import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ensureAuth } from './auth';
import { apiKeyExists, retrieveApiKey, storeApiKey } from '../keyStorage';
import { auth } from '../auth';

vi.mock('../keyStorage');
vi.mock('../auth');

describe('ensureAuth', () => {
  const mockProps = {
    _: [],
    configDir: '/mock/config',
    oauthHost: 'https://mock.oauth.com',
    clientId: 'mock-client-id',
    forceAuth: false,
    apiKey: '',
    apiHost: 'https://mock.api.com',
    help: false,
    apiClient: {} as any,
    output: 'json' as const,
    contextFile: '/mock/context.json',
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return existing API key if it exists', async () => {
    vi.mocked(apiKeyExists).mockReturnValue(true);
    vi.mocked(retrieveApiKey).mockReturnValue('existing-api-key');

    const result = await ensureAuth(mockProps);

    expect(result).toBe('existing-api-key');
    expect(apiKeyExists).toHaveBeenCalled();
    expect(retrieveApiKey).toHaveBeenCalled();
    expect(auth).not.toHaveBeenCalled();
  });

  it('should perform authentication if API key does not exist', async () => {
    vi.mocked(apiKeyExists).mockReturnValue(false);
    vi.mocked(auth).mockResolvedValue({ access_token: 'new-api-key' } as any);

    const result = await ensureAuth(mockProps);

    expect(result).toBe('new-api-key');
    expect(apiKeyExists).toHaveBeenCalled();
    expect(auth).toHaveBeenCalledWith({
      oauthHost: mockProps.oauthHost,
      clientId: mockProps.clientId,
    });
    expect(storeApiKey).toHaveBeenCalledWith('new-api-key');
  });

  it('should throw an error if authentication fails', async () => {
    vi.mocked(apiKeyExists).mockReturnValue(false);
    vi.mocked(auth).mockRejectedValue(new Error('Authentication failed'));

    await expect(ensureAuth(mockProps)).rejects.toThrow(
      'Authentication failed',
    );
  });

  it('should force authentication if forceAuth is true', async () => {
    const forceAuthProps = { ...mockProps, forceAuth: true };
    vi.mocked(auth).mockResolvedValue({
      access_token: 'forced-new-api-key',
    } as any);

    const result = await ensureAuth(forceAuthProps);

    expect(result).toBe('forced-new-api-key');
    expect(apiKeyExists).not.toHaveBeenCalled();
    expect(auth).toHaveBeenCalledWith({
      oauthHost: forceAuthProps.oauthHost,
      clientId: forceAuthProps.clientId,
    });
    expect(storeApiKey).toHaveBeenCalledWith('forced-new-api-key');
  });
});
