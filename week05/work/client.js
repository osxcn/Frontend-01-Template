const net = require('net');
const utils = require('./util');
const isString = utils.isString;
const isObject = utils.isObject;

class HttpRequest {
  constructor(options) {
    // method, url = host + port + path
    // body: k/v
    // headers
    this.method =
      isString(options.method) &&
      ['GET', 'POST', 'PUT', 'DELETE', 'CONNECT', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method.toUpperCase())
        ? options.method
        : 'GET';
    this.host = isString(options.host) ? options.host : '';
    this.port = Number(options.port) || 80;
    this.path = isString(options.path) ? options.path : '/';
    this.body = options.body || {};
    this.headers = isObject(options.headers) ? options.headers : {};

    // 参数处理
    if (!this.headers['Content-Type']) {
      this.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    if (this.headers['Content-Type'] === 'application/json') {
      this.bodyText = JSON.stringify(this.body);
    } else if (this.headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&');
    } else if (this.headers['Content-Type'] === 'text/plain') {
      this.bodyText = String(this.body);
    }

    this.headers['Content-Length'] = this.bodyText.length;
  }

  toString() {
    return `
${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}`
  }

  send(connection) {
    const parser = new HttpResponseParser();
    if (connection) {
      connection.write(this.toString());
    } else {
      connection = net.createConnection({
        host: this.host,
        port: this.port
      }, () => {
        connection.write(this.toString());
      })
    }

    return new Promise((resolve, reject) => {
      connection.on('data', (data) => {
        parser.receive(data.toString());
        if (parser.isFinished) {
          resolve(parser.response);
        }
        // console.log(parser.statusLine);
        // console.log(parser.headers);
        connection.end();
      });

      connection.on('error', (err) => {
        reject(err);
        connection.end();
      })
    });
  }
}

class HttpResponse {}

const CARRIAGE_RETURN = '\r'; // 换行符
const NEW_LINE = '\n'; // 回车符
const COLON = ':'; // 冒号
const SPACE = ' '; // 空格

class HttpResponseParser {
  constructor() {
    this.WAITING_STATUS_LINE = 0; // 状态
    this.WAITING_STATUS_LINE_END = 1; // 状态行尾
    this.WAITING_HEADER_NAME = 2; // 读取header name
    this.WAITING_HEADER_SPACE = 3; // header的空格
    this.WAITING_HEADER_VALUE = 4; // header 值
    this.WAITING_HEADER_LINE_END = 5; // header行尾
    this.WAITING_HEDER_BLOCK_END = 6; // header空行
    this.WAITING_BODY = 7; // body
    this.WAITING_BODY_END = 8; // body 结束

    this.current = this.WAITING_STATUS_LINE;
    this.statusLine = '';
    this.headers = {};
    this.headerName = '';
    this.headerValue = '';

    this.bodyParser = null;
  }

  get isFinished() {
    return this.bodyParser && this.bodyParser.isFinished;
  }

  get response() {
    this.statusLine.match(/HTTP\/1\.1 ([0-9]+) ([\s\S]+)/);
    return {
      statusCode: RegExp.$1,
      statusTExt: RegExp.$2,
      headers: this.headers,
      body: this.bodyParser.content.join('')
    }
  }

  receive(string) {
    for (let i = 0; i < string.length; i++) {
      this.receiveChar(string.charAt(i));
    }
  }

  receiveChar(char) {
    switch (this.current) {
      // 读取状态
      case this.WAITING_STATUS_LINE: {
        if (char === CARRIAGE_RETURN) {
          this.current = this.WAITING_STATUS_LINE_END;
        } else if (char === NEW_LINE) {
          this.current = this.WAITING_HEADER_NAME;
        } else {
          this.statusLine += char;
        }
        break;
      }
      case this.WAITING_STATUS_LINE_END: {
        if (char === NEW_LINE) {
          this.current = this.WAITING_HEADER_NAME;
        }
        break;
      }
      // 读取header
      case this.WAITING_HEADER_NAME: {
        if (char === COLON) {
          this.current = this.WAITING_HEADER_SPACE;
        } else if (char === CARRIAGE_RETURN) {
          this.current = this.WAITING_HEDER_BLOCK_END;
          if (this.headers['Transfer-Encoding'] === 'chunked') {
            this.bodyParser = new TrunkedBodyParser();
          }
        } else {
          this.headerName += char;
        }
        break;
      }
      case this.WAITING_HEADER_SPACE: {
        if (char === SPACE) {
          this.current = this.WAITING_HEADER_VALUE;
        }
        break;
      }
      case this.WAITING_HEADER_VALUE: {
        if (char === CARRIAGE_RETURN) {
          this.current = this.WAITING_HEADER_LINE_END;
          // 将header内容放到headers中，并清除header
          this.headers[this.headerName] = this.headerValue;
          this.headerName = '';
          this.headerValue = '';
        } else {
          this.headerValue += char;
        }
        break;
      }
      case this.WAITING_HEADER_LINE_END: {
        if (char === NEW_LINE) {
          this.current = this.WAITING_HEADER_NAME;
        }
        break;
      }
      case this.WAITING_HEDER_BLOCK_END: {
        if (char === NEW_LINE) {
          this.current = this.WAITING_BODY;
        }
        break;
      }
      // 读取正文
      case this.WAITING_BODY: {
        if (this.bodyParser.isFinished) {
          this.current = this.WAITING_BODY_END;
        }
        this.bodyParser.receiveChar(char);
        break;
      }
    }
  }
}

class TrunkedBodyParser {
  constructor() {
    /*
    2 下一行字符数
    ok 正文字符串
    0 下一行字符数

     */
    this.WAITING_LENGTH = 0; // 行字符数
    this.WAITING_LENGTH_LINE_END = 1; // 行字符数行尾
    this.READING_TRUNK = 2; // 正文
    this.WAITING_NEW_LINE = 3; // 新的一行
    this.WAITING_NEW_LINE_END = 4; // 新一行行尾

    this.length = 0;
    this.content = []; // 正文内容
    this.isFinished = false; // 是否读取完毕

    this.current = this.WAITING_LENGTH;
  }

  receiveChar(char) {
    switch (this.current) {
      case this.WAITING_LENGTH: {
        if (char === CARRIAGE_RETURN) {
          if (this.length === 0) { // 当下一行字符数等于0时表示已读取完body内容
            this.isFinished = true;
          }
          this.current = this.WAITING_LENGTH_LINE_END;
        } else {
          this.length *= 10;
          this.length += char.charCodeAt(0) - '0'.charCodeAt(0);
        }
        break;
      }
      case this.WAITING_LENGTH_LINE_END: {
        if (char === NEW_LINE) {
          this.current = this.READING_TRUNK;
        }
        break;
      }
      case this.READING_TRUNK: {
        this.content.push(char);
        this.length--;
        if (this.length === 0) {
          this.current = this.WAITING_NEW_LINE;
        }
        break;
      }
      case this.WAITING_NEW_LINE: {
        if (char === CARRIAGE_RETURN) {
          this.current = this.WAITING_NEW_LINE_END;
        }
        break;
      }
      case this.WAITING_NEW_LINE_END: {
        if (char === NEW_LINE) {
          this.current = this.WAITING_LENGTH;
        }
        break;
      }
    }
  }
}

void (async function () {
  const request = new HttpRequest({
    host: '127.0.0.1',
    port: 8088,
    method: 'POST',
    path: '/login',
    headers: {
      token: 'ee977806d7286510da8b9a7492ba58e2484c0ecc'
    },
    body: {
      userName: 'admin',
      password: 'e10adc3949ba59abbe56e057f20f883e'
    }
  });

  const response = await request.send();
  console.log(response);
})();
