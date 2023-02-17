# koa-proxy-pass [![build status](https://github.com/junyiz/koa-proxy-pass/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/junyiz/koa-proxy-pass/actions/workflows/ci.yml)

A light-weight, no-dependency Proxy middleware for koajs, it's similar to nginx's proxy_pass.

## Install

```
$ npm install @junyiz/koa-proxy-pass -S
```

## Usage

When you request http://localhost:8090, it will fetch https://github.com and return.

```js
const Koa = require('koa');
const proxyPass = require('./koa-proxy-pass');
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

## Options

#### host

Type: String

'host' is required

#### match

Type: RegExp

#### map

Type: Object or Function

Object is a path mapping of key-value, Function that handles paths

#### headers

Type: Object

This allows you to override request headers

## LICENSE

Copyright (c) 2018-2019 junyiz. Licensed under the MIT license.
