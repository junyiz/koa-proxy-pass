var net = require("net");
var http = require("http");

const getHeaders = (rawHeaders) => {
  let headers = {};
  for (let i = 0; i < rawHeaders.length; i += 2) {
    // https://imququ.com/post/the-proxy-connection-header-in-http-request.html
    if (rawHeaders[i] === "Proxy-Connection") {
      headers.connection = rawHeaders[i + 1];
    } else {
      headers[rawHeaders[i]] = rawHeaders[i + 1];
    }
  }
  return headers;
};

// ECONNRESET https://zhuanlan.zhihu.com/p/86953757
process.on("uncaughtException", function (err) {
  console.log(err.stack);
});

const app = http.createServer();

app.on("request", (request, response) => {
  const url = new URL(request.url);

  const options = {
    hostname: request.headers.host,
    port: 80,
    path: url.pathname,
    method: request.method,
    headers: getHeaders(request.rawHeaders),
  };

  // 请求真实的服务器
  const client = http
    .request(options, (res) => {
      response.writeHead(res.statusCode, res.headers);
      res.pipe(response);
    })
    .on("error", () => {
      console.log("http error");
      response.end();
    })
    .on("close", () => {
      console.log("http close");
      response.end();
    });

  request.pipe(client);
});

app.on("connect", (request, socket) => {
  const [hostname, port] = request.url.split(":");

  const client = net
    .connect(port, hostname, () => {
      socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      client.pipe(socket);
    })
    .on("error", () => {
      console.log("https error");
      socket.end();
    })
    .on("close", () => {
      console.log("https close");
      socket.end();
    });

  socket.pipe(client);
});

app.listen(1080);
