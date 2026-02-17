const HABITICA_API_BASE = 'https://habitica.com/api/v3';
const REQUEST_TIMEOUT_MS = 15000;

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

function isAuthorised(request, expectedToken) {
  if (!expectedToken) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' && token === expectedToken;
}

function buildHabiticaHeaders(env, hasJsonBody) {
  const clientUserId = env.HABITICA_CLIENT_USER_ID || env.HABITICA_USER_ID;

  const headers = new Headers({
    'x-api-user': env.HABITICA_USER_ID,
    'x-api-key': env.HABITICA_API_TOKEN,
    'x-client': `${clientUserId}-${env.HABITICA_APP_NAME}`,
  });

  if (hasJsonBody) {
    headers.set('content-type', 'application/json');
  }

  return headers;
}

function resolveRoute(url, method) {
  const path = url.pathname.replace(/\/+$/, '') || '/';

  if (method === 'GET' && path === '/habitica/tasks/user') {
    const upstreamUrl = new URL(`${HABITICA_API_BASE}/tasks/user`);
    const type = url.searchParams.get('type');
    if (type) {
      upstreamUrl.searchParams.set('type', type);
    }
    return { upstreamUrl, hasBody: false };
  }

  if (method === 'POST' && path === '/habitica/tasks/user') {
    return {
      upstreamUrl: new URL(`${HABITICA_API_BASE}/tasks/user`),
      hasBody: true,
    };
  }

  const taskIdMatch = path.match(/^\/habitica\/tasks\/([^/]+)$/);
  if (taskIdMatch && ['GET', 'PUT', 'DELETE'].includes(method)) {
    return {
      upstreamUrl: new URL(`${HABITICA_API_BASE}/tasks/${encodeURIComponent(taskIdMatch[1])}`),
      hasBody: method === 'PUT',
    };
  }

  return null;
}

async function proxyToHabitica(request, env, route) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort('Upstream request timed out'), REQUEST_TIMEOUT_MS);

  try {
    const upstreamResponse = await fetch(route.upstreamUrl.toString(), {
      method: request.method,
      headers: buildHabiticaHeaders(env, route.hasBody),
      body: route.hasBody ? await request.text() : undefined,
      signal: controller.signal,
    });

    const responseText = await upstreamResponse.text();
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8';

    return new Response(responseText, {
      status: upstreamResponse.status,
      headers: { 'content-type': contentType },
    });
  } catch (error) {
    return jsonResponse(502, {
      error: 'bad_gateway',
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    clearTimeout(timeout);
  }
}

export default {
  async fetch(request, env) {
    const startTime = Date.now();
    const url = new URL(request.url);
    const queryKeys = [...url.searchParams.keys()];

    if (!isAuthorised(request, env.PROXY_BEARER_TOKEN)) {
      const response = jsonResponse(401, { error: 'unauthorised' });
      console.log(JSON.stringify({ method: request.method, path: url.pathname, status: response.status, durationMs: Date.now() - startTime, queryKeys }));
      return response;
    }

    const route = resolveRoute(url, request.method);
    if (!route) {
      const response = jsonResponse(404, { error: 'not_found' });
      console.log(JSON.stringify({ method: request.method, path: url.pathname, status: response.status, durationMs: Date.now() - startTime, queryKeys }));
      return response;
    }

    const response = await proxyToHabitica(request, env, route);

    console.log(JSON.stringify({
      method: request.method,
      path: url.pathname,
      status: response.status,
      durationMs: Date.now() - startTime,
      queryKeys,
      requestBodyBytes: request.headers.get('content-length') || null,
    }));

    return response;
  },
};
