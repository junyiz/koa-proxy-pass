const http = require('http');
const https = require('https');
const { normalize } = require('path');

const getHeaders = (rawHeaders, host) => {
  let headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    if (rawHeaders[i] === 'Host') { 
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
  const { protocol, host, hostname, port, pathname } = new URL(options.host);
  const request = protocol === 'http:' ? http.request : https.request;

  return async (ctx, next) => {
    if (options.match && !ctx.path.match(options.match)) {
      await next();
    } else {
      const opt = {
        hostname,
        port: port || (protocol === 'http:' ? 80 : 443),
        path: normalize(pathname + getPath(ctx, options.map)),
        method: ctx.method,
        headers: Object.assign(getHeaders(ctx.req.rawHeaders, host), options.headers || {})
      };
      ctx.body = await new Promise((resolve, reject) => {
        const req = request(opt, res => {
          ctx.status = res.statusCode;
          for (let name in res.headers) {
            if (name === 'transfer-encoding') { continue; }
            ctx.set(name, res.headers[name]);
          }
          resolve(res); // res is Stream，so res.pipe(ctx.res)，see: https://github.com/koajs/koa/blob/eb51cf5fb35b39592a050b25fd261a574f547cfa/lib/application.js#L276
        });
        req.on('error', reject);
        ctx.req.pipe(req); // 通过管道(pipe)将 koa 接收的请求信息(ctx.req)发送到真实的服务器
        ctx.req.on('end', () => req.end());
      });
    }
  };
};

