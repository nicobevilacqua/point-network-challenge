jest.mock('axios');

import axios from 'axios';

const mockedAxios = axios as jest.Mocked<typeof axios>;

import { processUrls } from './challenge';

const URLS = ['url1', 'url2', 'url3', 'url4'];

const RESPONSES = ['response1', 'response2', 'response3', 'response4'];

const MAX_CONCURRENCY = 2;

describe('concurreny request challenge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`should process ${MAX_CONCURRENCY} concurrently and return the array of responses after all the urls are processed`, async () => {
    mockedAxios.get.mockImplementation((url) => {
      const response = RESPONSES[URLS.indexOf(url)];
      return Promise.resolve({
        data: response,
      });
    });

    const responses = await processUrls([...URLS], MAX_CONCURRENCY);

    expect(responses).toEqual(RESPONSES);
  });

  it('should wait until the first chunk is processed before the rest of the urls are being called', async () => {
    mockedAxios.get.mockImplementation((url) => {
      const response = RESPONSES[URLS.indexOf(url)];
      if (url === 'url1') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: response,
            });
          }, 3000);
        });
      }

      return Promise.resolve({
        data: response,
      });
    });

    const promise = processUrls([...URLS], MAX_CONCURRENCY);

    const mockCalls = mockedAxios.get.mock.calls;

    expect(mockCalls).toEqual([['url1'], ['url2']]);

    return promise.then((responses) => {
      expect(mockCalls).toEqual([['url1'], ['url2'], ['url3'], ['url4']]);
      expect(responses).toEqual(RESPONSES);
    });
  });
});
