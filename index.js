const http = require('http');
const https = require('https');
const { URL } = require('url');
const { normalize } = require('path');

const getHeaders = (rawHeaders, host) => {
  const headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    if (rawHeaders[i].toLowerCase() === 'host') {
      headers[rawHeaders[i]] = host;
    } else {
      headers[rawHeaders[i]] = rawHeaders[i + 1];
    }
  }
  return headers;
};

const getPath = (ctx, map) => {
  let path = '';
  if (typeof map === 'function') {
    path = map(ctx.path);
  } else if (typeof map === 'object' && map && map[ctx.path]) {
    path = map[ctx.path];
  } else {
    path = ctx.path;
  }
  if (ctx.querystring) {
    path += '?' + ctx.querystring;
  }
  return path;
};

module.exports = (options = {}) => {
  if (!options.host) {
    throw new Error('miss option host');
  }
  if (!options.match) {
    throw new Error('miss option match');
  }
  const { protocol, host, hostname, port, pathname } = new URL(options.host);
  const request = protocol === 'http:' ? http.request : https.request;
  return async (ctx, next) => {
    if (options.match && ctx.path.match(options.match)) {
      const opt = {
        hostname,
        port: port || (protocol === 'http:' ? 80 : 443),
        path: normalize(pathname + getPath(ctx, options.map)),
        method: ctx.method,
        headers: Object.assign(
          getHeaders(ctx.req.rawHeaders, host),
          options.headers || {}
        ),
      };
      ctx.body = await new Promise((resolve, reject) => {
        const req = request(opt, res => {
          ctx.status = res.statusCode;
          for (const name in res.headers) {
            if (name === 'transfer-encoding') {
              continue;
            }
            ctx.set(name, res.headers[name]);
          }
          resolve(res);
        });
        req.on('error', reject);
        ctx.req.pipe(req);
        ctx.req.on('end', () => req.end());
      });
    } else {
      await next();
    }
  };
};
