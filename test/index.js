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

describe('koa-proxy-pass', () => {
  let serve, next, proxy;
  before(() => {
    const serveApp = new Koa();
    serveApp.use(async (ctx, next) => {
      if (ctx.querystring && ctx.path) {
        ctx.body = ctx.path + '?' + ctx.querystring;
      } else {
        ctx.body = ctx.querystring || ctx.path;
      }
    });
    serve = serveApp.listen(8096);

    const nextApp = new Koa();
    nextApp.use(async (ctx, next) => {
      ctx.body = 'next app';
    });
    next = nextApp.listen(8097);

    const proxyApp = new Koa(); 
    proxyApp.use(proxyPass({
      host: 'http://localhost:8096',
      match: /^\/serve/
    }));
    proxyApp.use(proxyPass({
      host: 'http://localhost:8097',
      match: /^\/next/
    }));
    proxy = proxyApp.listen(8098);
  });
  after(() => {
    serve.close(); 
    next.close(); 
    proxy.close(); 
  });

  it('await next', (done) => {
    (async () => {
      get('http://localhost:8098/next', res => {
          let arr = [];
          res.on('data', chunk => {
            arr.push(chunk);
          });
          res.on('end', () => {
            assert.equal(arr.join(''), 'next app');
            done();
          });
      });
    })();
  });

  it('proxy path', (done) => {
    (async () => {
      get('http://localhost:8098/serve', res => {
        let arr = [];
        res.on('data', chunk => {
          arr.push(chunk);
        });
        res.on('end', () => {
          assert.equal(arr.join(''), '/serve');
          done();
        });
      });
    })();
  });

  it('proxy path and querystring', (done) => {
    (async () => {
      get('http://localhost:8098/serve?q=qs', res => {
        let arr = [];
        res.on('data', chunk => {
          arr.push(chunk);
        });
        res.on('end', () => {
          assert.equal(arr.join(''), '/serve?q=qs');
          done();
        });
      });
    })();
  });
});
