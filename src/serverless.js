import { App } from '../app.js';
import { manifest } from '../manifest.js';

export async function handler(event) {
  console.log(event)
  const app = new App(manifest);
  const { path, headers, multiValueQueryStringParameters, body, httpMethod, requestContext, isBase64Encoded } = event;

  const encoding = isBase64Encoded ? 'base64' : headers['content-encoding'] || 'utf-8';
  const rawBody = typeof body === 'string' ? Buffer.from(body, encoding) : body;

  let rawURL = `https://${requestContext.domainName}${path}${parseQuery(multiValueQueryStringParameters)}`

  console.log(rawURL)

  const rendered = await app.render(new Request(rawURL, {
    method: httpMethod,
    headers: new Headers(headers),
    body: rawBody,
  }));

  if (rendered) {
    const resp = {
      headers: {},
      multiValueHeaders: {},
      body: await rendered.text(),
      statusCode: rendered.status
    }
    for (let k of rendered.headers.keys()){
      console.log(k)
      const v = rendered.headers.get(k)
      if (v instanceof Array) {
        resp.multiValueHeaders[k] = v
      } else {
        resp.headers[k] = v
      }
    }
    return resp
  }
  return {
    statusCode: 404,
    body: 'Not found.'
  }
}


function parseQuery(queryParams) {
  if (!queryParams) {
    return '';
  }
  let queryString = '?'

  for (let queryParamKey in queryParams) {
    for (let queryParamValue of queryParams[queryParamKey]) {
      if (queryString != '?') {
        queryString += '&'
      }
      queryString += `${queryParamKey}=${queryParamValue}`
    }
  }
  return queryString;
}
