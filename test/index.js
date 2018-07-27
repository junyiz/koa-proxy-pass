const { get } = require('http');
const assert = require('assert');
const Koa = require('koa');
const proxyPass = require('../');

describe('koa-proxy-pass', () => {
  let serve, proxy;
  before(() => {
    const serveApp = new Koa();
    serveApp.use(async (ctx, next) => {
      ctx.set('x-token', 'this-is-a-token');
      ctx.status = 204;
    });
    serve = serveApp.listen(8096);

    const proxyApp = new Koa(); 
    proxyApp.use(proxyPass({
      host: 'http://localhost:8096'
    }));
    proxy = proxyApp.listen(8098);
  });
  after(() => {
    serve.close(); 
    proxy.close(); 
  });

  it('should have statusCode 204', (done) => {
    (async () => {
      get('http://localhost:8098', res => {
        assert.equal(res.statusCode, 204);
        done();
      });
    })();
  });

  it('should have header x-token', (done) => {
    (async () => {
      get('http://localhost:8098', res => {
        assert.equal(res.headers['x-token'], 'this-is-a-token');
        done();
      });
    })();
  });

});
