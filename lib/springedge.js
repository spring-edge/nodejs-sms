/**
 * SpringEdge API methods
 *
 * @module springedge
 * API URL: https://www.springedge.com
 */

var http = require('https');
var querystring = require('querystring');
var ospath = require('path');
var root = ospath.resolve('.');

/**
 * httpRequest does the API call
 * and process the response
 *
 * @param {String} method
 * @param {String} path
 * @param {Object} params
 * @param {Function} callback
 * @return {Void}
 */
function httpRequest(method, path, params, timeout, callback) {
  var options = {};
  var complete = false;
  var body = null;
  var request;

  if (typeof params === 'function') {
    callback = params;
    params = null;
  }

  /**
   * doCallback prevents multiple callback
   * calls emitted by node's http module
   *
   * @param {Error} err
   * @param {Mixed} res
   * @return {Void}
   */
  function doCallback(err, res) {
    if (!complete) {
      complete = true;
      callback(err, res || null);
    }
  }

  // build request
  options = {
    hostname: 'instantalerts.co',
    path: path,
    method: method,
    headers: {
      'User-Agent': ' Node.js/' + process.versions.node
    }
  };

  if (options.method === 'POST') {
    body = JSON.stringify(params);
    options.headers['Content-Type'] = 'application/json';
    options.headers['Content-Length'] = Buffer.byteLength(body, 'utf8');
  } else {
    options.path += params ? '?' + querystring.stringify(params) : '';
  }
  request = http.request(options);
  // set timeout
  request.on('socket', function (socket) {
    socket.setTimeout(parseInt(timeout, 10));
    socket.on('timeout', function () {
      request.abort();
    });
  });
  // process client error
  request.on('error', function (e) {
    var error = new Error('request failed');
    if (error.message === 'ECONNRESET') {
      error = new Error('request timeout');
    }
    error.error = e;
    doCallback(error);
  });
  // process response
  request.on('response', function (response) {
    var data = [];
    var size = 0;
    var error = null;
    response.on('data', function (ch) {
      data.push(ch);
      size += ch.length;
    });
    response.on('close', function () {
      doCallback(new Error('request closed'));
    });
    response.on('end', function () {
      data = Buffer.concat(data, size)
        .toString()
        .trim();

      try {
        data = JSON.parse(data);
        if (data.errors) {
          error = new Error('api error');
          error.statusCode = response.statusCode;
          error.errors = data.errors;
          data = null;
        }
      } catch (e) {
        error = new Error('response failed');
        error.statusCode = response.statusCode;
        error.error = e;
        data = null;
      }
      doCallback(error, data);
    });
  });
  // do request
  request.end(body);
}

// METHODS
module.exports = {
  messages: {
    /**
     * Send a text message
     *
     * @param {Object} params
     * @param {Function} callback
     * @return {void}
     */
    send: function (params, timeout, callback) {
      if (typeof timeout === "Function") callback = timeout
      timeout = 5000
      if (params.recipients instanceof Array) {
        params.recipients = params.recipients.join(',');
      }
      httpRequest('GET', '/api/web/send/', params, timeout, callback);
    }
  }
}

