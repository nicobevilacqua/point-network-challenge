import axios, { AxiosResponse } from 'axios';

type UrlsArray = Array<string>;
type ResponsesArray = Array<AxiosResponse>;

export async function processUrls(
  urls: UrlsArray,
  maxConcurrency: number
): Promise<ResponsesArray> {
  let responses: ResponsesArray = [];

  let chunk = urls.splice(0, maxConcurrency);
  let chunkResponses: AxiosResponse[];
  while (chunk && chunk.length) {
    chunkResponses = await Promise.all(chunk.map((url) => axios.get(url)));
    responses = responses.concat(chunkResponses.map(({ data }) => data));
    chunk = urls.splice(0, maxConcurrency);
  }

  return responses;
}
