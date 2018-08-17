# koa-proxy-pass 

A light-weight, no-dependency Proxy middleware for koajs, it's similar to nginx's proxy_pass.  
[![Build Status](https://travis-ci.org/junyiz/koa-proxy-pass.svg?branch=master)](https://travis-ci.org/junyiz/koa-proxy-pass)
---

## Install

```
$ npm install @junyiz/koa-proxy-pass -S
```

## Usage

When you request http://localhost:8090, it will fetch https://github.com and return.

```js
const Koa = require('koa');
const proxyPass = require('koa-proxy-pass');
const app = new Koa();
app.use(proxyPass({
  host: 'https://github.com'
}));
app.listen(8090);
```

You can proxy a specified path, use RegExp.

```js
const Koa = require('koa');
const proxyPass = require('./koa-proxy-pass');
const app = new Koa();
app.use(proxyPass({
  host: 'https://github.com',
  match: /^\/junyiz/
}));
app.listen(8090);
```

You can proxy a specified path, use koa-router.

```js
const Koa = require('koa');
const Router = require('koa-router');
const proxyPass = require('./koa-proxy-pass');
const app = new Koa();
const router = new Router();
router.get('/junyiz', proxyPass({
  host: 'https://github.com'
}));
app.use(router.routes())
app.use(router.allowedMethods());
app.listen(8090);
```

You can specify a key/value object that can map your request's path to the other.

```js
const Koa = require('koa');
const proxyPass = require('./koa-proxy-pass');
const app = new Koa();
app.use(proxyPass({
  host: 'https://github.com',
  map: {
    '/hint.svg': '/images/search-shortcut-hint.svg'
  }
}));
app.listen(8090);
```

## LICENSE

Copyright (c) 2018 junyiz. Licensed under the MIT license.
