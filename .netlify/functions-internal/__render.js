var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __require = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require3() {
  return mod || (0, cb[Object.keys(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// node_modules/@sveltejs/kit/dist/install-fetch.js
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
  }
  uri = uri.replace(/\r?\n/g, "");
  const firstComma = uri.indexOf(",");
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError("malformed data: URI");
  }
  const meta = uri.substring(5, firstComma).split(";");
  let charset = "";
  let base64 = false;
  const type = meta[0] || "text/plain";
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === "base64") {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf("charset=") === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  if (!meta[0] && !charset.length) {
    typeFull += ";charset=US-ASCII";
    charset = "US-ASCII";
  }
  const encoding = base64 ? "base64" : "ascii";
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  buffer.type = type;
  buffer.typeFull = typeFull;
  buffer.charset = charset;
  return buffer;
}
async function* read(parts) {
  for (const part of parts) {
    if ("stream" in part) {
      yield* part.stream();
    } else {
      yield part;
    }
  }
}
function isFormData(object) {
  return typeof object === "object" && typeof object.append === "function" && typeof object.set === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.delete === "function" && typeof object.keys === "function" && typeof object.values === "function" && typeof object.entries === "function" && typeof object.constructor === "function" && object[NAME] === "FormData";
}
function getHeader(boundary, name, field) {
  let header = "";
  header += `${dashes}${boundary}${carriage}`;
  header += `Content-Disposition: form-data; name="${name}"`;
  if (isBlob(field)) {
    header += `; filename="${field.name}"${carriage}`;
    header += `Content-Type: ${field.type || "application/octet-stream"}`;
  }
  return `${header}${carriage.repeat(2)}`;
}
async function* formDataIterator(form, boundary) {
  for (const [name, value] of form) {
    yield getHeader(boundary, name, value);
    if (isBlob(value)) {
      yield* value.stream();
    } else {
      yield value;
    }
    yield carriage;
  }
  yield getFooter(boundary);
}
function getFormDataLength(form, boundary) {
  let length = 0;
  for (const [name, value] of form) {
    length += Buffer.byteLength(getHeader(boundary, name, value));
    if (isBlob(value)) {
      length += value.size;
    } else {
      length += Buffer.byteLength(String(value));
    }
    length += carriageLength;
  }
  length += Buffer.byteLength(getFooter(boundary));
  return length;
}
async function consumeBody(data) {
  if (data[INTERNALS$2].disturbed) {
    throw new TypeError(`body used already for: ${data.url}`);
  }
  data[INTERNALS$2].disturbed = true;
  if (data[INTERNALS$2].error) {
    throw data[INTERNALS$2].error;
  }
  let { body } = data;
  if (body === null) {
    return Buffer.alloc(0);
  }
  if (isBlob(body)) {
    body = body.stream();
  }
  if (Buffer.isBuffer(body)) {
    return body;
  }
  if (!(body instanceof import_stream.default)) {
    return Buffer.alloc(0);
  }
  const accum = [];
  let accumBytes = 0;
  try {
    for await (const chunk of body) {
      if (data.size > 0 && accumBytes + chunk.length > data.size) {
        const err = new FetchError(`content size at ${data.url} over limit: ${data.size}`, "max-size");
        body.destroy(err);
        throw err;
      }
      accumBytes += chunk.length;
      accum.push(chunk);
    }
  } catch (error2) {
    if (error2 instanceof FetchBaseError) {
      throw error2;
    } else {
      throw new FetchError(`Invalid response body while trying to fetch ${data.url}: ${error2.message}`, "system", error2);
    }
  }
  if (body.readableEnded === true || body._readableState.ended === true) {
    try {
      if (accum.every((c) => typeof c === "string")) {
        return Buffer.from(accum.join(""));
      }
      return Buffer.concat(accum, accumBytes);
    } catch (error2) {
      throw new FetchError(`Could not create Buffer from response body for ${data.url}: ${error2.message}`, "system", error2);
    }
  } else {
    throw new FetchError(`Premature close of server response while trying to fetch ${data.url}`);
  }
}
function fromRawHeaders(headers = []) {
  return new Headers(headers.reduce((result, value, index2, array) => {
    if (index2 % 2 === 0) {
      result.push(array.slice(index2, index2 + 2));
    }
    return result;
  }, []).filter(([name, value]) => {
    try {
      validateHeaderName(name);
      validateHeaderValue(name, String(value));
      return true;
    } catch {
      return false;
    }
  }));
}
async function fetch(url, options_) {
  return new Promise((resolve2, reject) => {
    const request = new Request(url, options_);
    const options2 = getNodeRequestOptions(request);
    if (!supportedSchemas.has(options2.protocol)) {
      throw new TypeError(`node-fetch cannot load ${url}. URL scheme "${options2.protocol.replace(/:$/, "")}" is not supported.`);
    }
    if (options2.protocol === "data:") {
      const data = dataUriToBuffer$1(request.url);
      const response2 = new Response(data, { headers: { "Content-Type": data.typeFull } });
      resolve2(response2);
      return;
    }
    const send = (options2.protocol === "https:" ? import_https.default : import_http.default).request;
    const { signal } = request;
    let response = null;
    const abort = () => {
      const error2 = new AbortError("The operation was aborted.");
      reject(error2);
      if (request.body && request.body instanceof import_stream.default.Readable) {
        request.body.destroy(error2);
      }
      if (!response || !response.body) {
        return;
      }
      response.body.emit("error", error2);
    };
    if (signal && signal.aborted) {
      abort();
      return;
    }
    const abortAndFinalize = () => {
      abort();
      finalize();
    };
    const request_ = send(options2);
    if (signal) {
      signal.addEventListener("abort", abortAndFinalize);
    }
    const finalize = () => {
      request_.abort();
      if (signal) {
        signal.removeEventListener("abort", abortAndFinalize);
      }
    };
    request_.on("error", (err) => {
      reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, "system", err));
      finalize();
    });
    request_.on("response", (response_) => {
      request_.setTimeout(0);
      const headers = fromRawHeaders(response_.rawHeaders);
      if (isRedirect(response_.statusCode)) {
        const location = headers.get("Location");
        const locationURL = location === null ? null : new URL(location, request.url);
        switch (request.redirect) {
          case "error":
            reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, "no-redirect"));
            finalize();
            return;
          case "manual":
            if (locationURL !== null) {
              try {
                headers.set("Location", locationURL);
              } catch (error2) {
                reject(error2);
              }
            }
            break;
          case "follow": {
            if (locationURL === null) {
              break;
            }
            if (request.counter >= request.follow) {
              reject(new FetchError(`maximum redirect reached at: ${request.url}`, "max-redirect"));
              finalize();
              return;
            }
            const requestOptions = {
              headers: new Headers(request.headers),
              follow: request.follow,
              counter: request.counter + 1,
              agent: request.agent,
              compress: request.compress,
              method: request.method,
              body: request.body,
              signal: request.signal,
              size: request.size
            };
            if (response_.statusCode !== 303 && request.body && options_.body instanceof import_stream.default.Readable) {
              reject(new FetchError("Cannot follow redirect with body being a readable stream", "unsupported-redirect"));
              finalize();
              return;
            }
            if (response_.statusCode === 303 || (response_.statusCode === 301 || response_.statusCode === 302) && request.method === "POST") {
              requestOptions.method = "GET";
              requestOptions.body = void 0;
              requestOptions.headers.delete("content-length");
            }
            resolve2(fetch(new Request(locationURL, requestOptions)));
            finalize();
            return;
          }
        }
      }
      response_.once("end", () => {
        if (signal) {
          signal.removeEventListener("abort", abortAndFinalize);
        }
      });
      let body = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
        reject(error2);
      });
      if (process.version < "v12.10") {
        response_.on("aborted", abortAndFinalize);
      }
      const responseOptions = {
        url: request.url,
        status: response_.statusCode,
        statusText: response_.statusMessage,
        headers,
        size: request.size,
        counter: request.counter,
        highWaterMark: request.highWaterMark
      };
      const codings = headers.get("Content-Encoding");
      if (!request.compress || request.method === "HEAD" || codings === null || response_.statusCode === 204 || response_.statusCode === 304) {
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      const zlibOptions = {
        flush: import_zlib.default.Z_SYNC_FLUSH,
        finishFlush: import_zlib.default.Z_SYNC_FLUSH
      };
      if (codings === "gzip" || codings === "x-gzip") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createGunzip(zlibOptions), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      if (codings === "deflate" || codings === "x-deflate") {
        const raw = (0, import_stream.pipeline)(response_, new import_stream.PassThrough(), (error2) => {
          reject(error2);
        });
        raw.once("data", (chunk) => {
          if ((chunk[0] & 15) === 8) {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflate(), (error2) => {
              reject(error2);
            });
          } else {
            body = (0, import_stream.pipeline)(body, import_zlib.default.createInflateRaw(), (error2) => {
              reject(error2);
            });
          }
          response = new Response(body, responseOptions);
          resolve2(response);
        });
        return;
      }
      if (codings === "br") {
        body = (0, import_stream.pipeline)(body, import_zlib.default.createBrotliDecompress(), (error2) => {
          reject(error2);
        });
        response = new Response(body, responseOptions);
        resolve2(response);
        return;
      }
      response = new Response(body, responseOptions);
      resolve2(response);
    });
    writeToStream(request_, request);
  });
}
var import_http, import_https, import_zlib, import_stream, import_util, import_crypto, import_url, src, dataUriToBuffer$1, Readable, wm, Blob, fetchBlob, Blob$1, FetchBaseError, FetchError, NAME, isURLSearchParameters, isBlob, isAbortSignal, carriage, dashes, carriageLength, getFooter, getBoundary, INTERNALS$2, Body, clone, extractContentType, getTotalBytes, writeToStream, validateHeaderName, validateHeaderValue, Headers, redirectStatus, isRedirect, INTERNALS$1, Response, getSearch, INTERNALS, isRequest, Request, getNodeRequestOptions, AbortError, supportedSchemas;
var init_install_fetch = __esm({
  "node_modules/@sveltejs/kit/dist/install-fetch.js"() {
    init_shims();
    import_http = __toModule(require("http"));
    import_https = __toModule(require("https"));
    import_zlib = __toModule(require("zlib"));
    import_stream = __toModule(require("stream"));
    import_util = __toModule(require("util"));
    import_crypto = __toModule(require("crypto"));
    import_url = __toModule(require("url"));
    src = dataUriToBuffer;
    dataUriToBuffer$1 = src;
    ({ Readable } = import_stream.default);
    wm = new WeakMap();
    Blob = class {
      constructor(blobParts = [], options2 = {}) {
        let size = 0;
        const parts = blobParts.map((element) => {
          let buffer;
          if (element instanceof Buffer) {
            buffer = element;
          } else if (ArrayBuffer.isView(element)) {
            buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
          } else if (element instanceof ArrayBuffer) {
            buffer = Buffer.from(element);
          } else if (element instanceof Blob) {
            buffer = element;
          } else {
            buffer = Buffer.from(typeof element === "string" ? element : String(element));
          }
          size += buffer.length || buffer.size || 0;
          return buffer;
        });
        const type = options2.type === void 0 ? "" : String(options2.type).toLowerCase();
        wm.set(this, {
          type: /[^\u0020-\u007E]/.test(type) ? "" : type,
          size,
          parts
        });
      }
      get size() {
        return wm.get(this).size;
      }
      get type() {
        return wm.get(this).type;
      }
      async text() {
        return Buffer.from(await this.arrayBuffer()).toString();
      }
      async arrayBuffer() {
        const data = new Uint8Array(this.size);
        let offset = 0;
        for await (const chunk of this.stream()) {
          data.set(chunk, offset);
          offset += chunk.length;
        }
        return data.buffer;
      }
      stream() {
        return Readable.from(read(wm.get(this).parts));
      }
      slice(start = 0, end = this.size, type = "") {
        const { size } = this;
        let relativeStart = start < 0 ? Math.max(size + start, 0) : Math.min(start, size);
        let relativeEnd = end < 0 ? Math.max(size + end, 0) : Math.min(end, size);
        const span = Math.max(relativeEnd - relativeStart, 0);
        const parts = wm.get(this).parts.values();
        const blobParts = [];
        let added = 0;
        for (const part of parts) {
          const size2 = ArrayBuffer.isView(part) ? part.byteLength : part.size;
          if (relativeStart && size2 <= relativeStart) {
            relativeStart -= size2;
            relativeEnd -= size2;
          } else {
            const chunk = part.slice(relativeStart, Math.min(size2, relativeEnd));
            blobParts.push(chunk);
            added += ArrayBuffer.isView(chunk) ? chunk.byteLength : chunk.size;
            relativeStart = 0;
            if (added >= span) {
              break;
            }
          }
        }
        const blob = new Blob([], { type: String(type).toLowerCase() });
        Object.assign(wm.get(blob), { size: span, parts: blobParts });
        return blob;
      }
      get [Symbol.toStringTag]() {
        return "Blob";
      }
      static [Symbol.hasInstance](object) {
        return object && typeof object === "object" && typeof object.stream === "function" && object.stream.length === 0 && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[Symbol.toStringTag]);
      }
    };
    Object.defineProperties(Blob.prototype, {
      size: { enumerable: true },
      type: { enumerable: true },
      slice: { enumerable: true }
    });
    fetchBlob = Blob;
    Blob$1 = fetchBlob;
    FetchBaseError = class extends Error {
      constructor(message, type) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.type = type;
      }
      get name() {
        return this.constructor.name;
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
    };
    FetchError = class extends FetchBaseError {
      constructor(message, type, systemError) {
        super(message, type);
        if (systemError) {
          this.code = this.errno = systemError.code;
          this.erroredSysCall = systemError.syscall;
        }
      }
    };
    NAME = Symbol.toStringTag;
    isURLSearchParameters = (object) => {
      return typeof object === "object" && typeof object.append === "function" && typeof object.delete === "function" && typeof object.get === "function" && typeof object.getAll === "function" && typeof object.has === "function" && typeof object.set === "function" && typeof object.sort === "function" && object[NAME] === "URLSearchParams";
    };
    isBlob = (object) => {
      return typeof object === "object" && typeof object.arrayBuffer === "function" && typeof object.type === "string" && typeof object.stream === "function" && typeof object.constructor === "function" && /^(Blob|File)$/.test(object[NAME]);
    };
    isAbortSignal = (object) => {
      return typeof object === "object" && object[NAME] === "AbortSignal";
    };
    carriage = "\r\n";
    dashes = "-".repeat(2);
    carriageLength = Buffer.byteLength(carriage);
    getFooter = (boundary) => `${dashes}${boundary}${dashes}${carriage.repeat(2)}`;
    getBoundary = () => (0, import_crypto.randomBytes)(8).toString("hex");
    INTERNALS$2 = Symbol("Body internals");
    Body = class {
      constructor(body, {
        size = 0
      } = {}) {
        let boundary = null;
        if (body === null) {
          body = null;
        } else if (isURLSearchParameters(body)) {
          body = Buffer.from(body.toString());
        } else if (isBlob(body))
          ;
        else if (Buffer.isBuffer(body))
          ;
        else if (import_util.types.isAnyArrayBuffer(body)) {
          body = Buffer.from(body);
        } else if (ArrayBuffer.isView(body)) {
          body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
        } else if (body instanceof import_stream.default)
          ;
        else if (isFormData(body)) {
          boundary = `NodeFetchFormDataBoundary${getBoundary()}`;
          body = import_stream.default.Readable.from(formDataIterator(body, boundary));
        } else {
          body = Buffer.from(String(body));
        }
        this[INTERNALS$2] = {
          body,
          boundary,
          disturbed: false,
          error: null
        };
        this.size = size;
        if (body instanceof import_stream.default) {
          body.on("error", (err) => {
            const error2 = err instanceof FetchBaseError ? err : new FetchError(`Invalid response body while trying to fetch ${this.url}: ${err.message}`, "system", err);
            this[INTERNALS$2].error = error2;
          });
        }
      }
      get body() {
        return this[INTERNALS$2].body;
      }
      get bodyUsed() {
        return this[INTERNALS$2].disturbed;
      }
      async arrayBuffer() {
        const { buffer, byteOffset, byteLength } = await consumeBody(this);
        return buffer.slice(byteOffset, byteOffset + byteLength);
      }
      async blob() {
        const ct = this.headers && this.headers.get("content-type") || this[INTERNALS$2].body && this[INTERNALS$2].body.type || "";
        const buf = await this.buffer();
        return new Blob$1([buf], {
          type: ct
        });
      }
      async json() {
        const buffer = await consumeBody(this);
        return JSON.parse(buffer.toString());
      }
      async text() {
        const buffer = await consumeBody(this);
        return buffer.toString();
      }
      buffer() {
        return consumeBody(this);
      }
    };
    Object.defineProperties(Body.prototype, {
      body: { enumerable: true },
      bodyUsed: { enumerable: true },
      arrayBuffer: { enumerable: true },
      blob: { enumerable: true },
      json: { enumerable: true },
      text: { enumerable: true }
    });
    clone = (instance, highWaterMark) => {
      let p1;
      let p2;
      let { body } = instance;
      if (instance.bodyUsed) {
        throw new Error("cannot clone body after it is used");
      }
      if (body instanceof import_stream.default && typeof body.getBoundary !== "function") {
        p1 = new import_stream.PassThrough({ highWaterMark });
        p2 = new import_stream.PassThrough({ highWaterMark });
        body.pipe(p1);
        body.pipe(p2);
        instance[INTERNALS$2].body = p1;
        body = p2;
      }
      return body;
    };
    extractContentType = (body, request) => {
      if (body === null) {
        return null;
      }
      if (typeof body === "string") {
        return "text/plain;charset=UTF-8";
      }
      if (isURLSearchParameters(body)) {
        return "application/x-www-form-urlencoded;charset=UTF-8";
      }
      if (isBlob(body)) {
        return body.type || null;
      }
      if (Buffer.isBuffer(body) || import_util.types.isAnyArrayBuffer(body) || ArrayBuffer.isView(body)) {
        return null;
      }
      if (body && typeof body.getBoundary === "function") {
        return `multipart/form-data;boundary=${body.getBoundary()}`;
      }
      if (isFormData(body)) {
        return `multipart/form-data; boundary=${request[INTERNALS$2].boundary}`;
      }
      if (body instanceof import_stream.default) {
        return null;
      }
      return "text/plain;charset=UTF-8";
    };
    getTotalBytes = (request) => {
      const { body } = request;
      if (body === null) {
        return 0;
      }
      if (isBlob(body)) {
        return body.size;
      }
      if (Buffer.isBuffer(body)) {
        return body.length;
      }
      if (body && typeof body.getLengthSync === "function") {
        return body.hasKnownLength && body.hasKnownLength() ? body.getLengthSync() : null;
      }
      if (isFormData(body)) {
        return getFormDataLength(request[INTERNALS$2].boundary);
      }
      return null;
    };
    writeToStream = (dest, { body }) => {
      if (body === null) {
        dest.end();
      } else if (isBlob(body)) {
        body.stream().pipe(dest);
      } else if (Buffer.isBuffer(body)) {
        dest.write(body);
        dest.end();
      } else {
        body.pipe(dest);
      }
    };
    validateHeaderName = typeof import_http.default.validateHeaderName === "function" ? import_http.default.validateHeaderName : (name) => {
      if (!/^[\^`\-\w!#$%&'*+.|~]+$/.test(name)) {
        const err = new TypeError(`Header name must be a valid HTTP token [${name}]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_HTTP_TOKEN" });
        throw err;
      }
    };
    validateHeaderValue = typeof import_http.default.validateHeaderValue === "function" ? import_http.default.validateHeaderValue : (name, value) => {
      if (/[^\t\u0020-\u007E\u0080-\u00FF]/.test(value)) {
        const err = new TypeError(`Invalid character in header content ["${name}"]`);
        Object.defineProperty(err, "code", { value: "ERR_INVALID_CHAR" });
        throw err;
      }
    };
    Headers = class extends URLSearchParams {
      constructor(init2) {
        let result = [];
        if (init2 instanceof Headers) {
          const raw = init2.raw();
          for (const [name, values] of Object.entries(raw)) {
            result.push(...values.map((value) => [name, value]));
          }
        } else if (init2 == null)
          ;
        else if (typeof init2 === "object" && !import_util.types.isBoxedPrimitive(init2)) {
          const method = init2[Symbol.iterator];
          if (method == null) {
            result.push(...Object.entries(init2));
          } else {
            if (typeof method !== "function") {
              throw new TypeError("Header pairs must be iterable");
            }
            result = [...init2].map((pair) => {
              if (typeof pair !== "object" || import_util.types.isBoxedPrimitive(pair)) {
                throw new TypeError("Each header pair must be an iterable object");
              }
              return [...pair];
            }).map((pair) => {
              if (pair.length !== 2) {
                throw new TypeError("Each header pair must be a name/value tuple");
              }
              return [...pair];
            });
          }
        } else {
          throw new TypeError("Failed to construct 'Headers': The provided value is not of type '(sequence<sequence<ByteString>> or record<ByteString, ByteString>)");
        }
        result = result.length > 0 ? result.map(([name, value]) => {
          validateHeaderName(name);
          validateHeaderValue(name, String(value));
          return [String(name).toLowerCase(), String(value)];
        }) : void 0;
        super(result);
        return new Proxy(this, {
          get(target, p, receiver) {
            switch (p) {
              case "append":
              case "set":
                return (name, value) => {
                  validateHeaderName(name);
                  validateHeaderValue(name, String(value));
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase(), String(value));
                };
              case "delete":
              case "has":
              case "getAll":
                return (name) => {
                  validateHeaderName(name);
                  return URLSearchParams.prototype[p].call(receiver, String(name).toLowerCase());
                };
              case "keys":
                return () => {
                  target.sort();
                  return new Set(URLSearchParams.prototype.keys.call(target)).keys();
                };
              default:
                return Reflect.get(target, p, receiver);
            }
          }
        });
      }
      get [Symbol.toStringTag]() {
        return this.constructor.name;
      }
      toString() {
        return Object.prototype.toString.call(this);
      }
      get(name) {
        const values = this.getAll(name);
        if (values.length === 0) {
          return null;
        }
        let value = values.join(", ");
        if (/^content-encoding$/i.test(name)) {
          value = value.toLowerCase();
        }
        return value;
      }
      forEach(callback) {
        for (const name of this.keys()) {
          callback(this.get(name), name);
        }
      }
      *values() {
        for (const name of this.keys()) {
          yield this.get(name);
        }
      }
      *entries() {
        for (const name of this.keys()) {
          yield [name, this.get(name)];
        }
      }
      [Symbol.iterator]() {
        return this.entries();
      }
      raw() {
        return [...this.keys()].reduce((result, key) => {
          result[key] = this.getAll(key);
          return result;
        }, {});
      }
      [Symbol.for("nodejs.util.inspect.custom")]() {
        return [...this.keys()].reduce((result, key) => {
          const values = this.getAll(key);
          if (key === "host") {
            result[key] = values[0];
          } else {
            result[key] = values.length > 1 ? values : values[0];
          }
          return result;
        }, {});
      }
    };
    Object.defineProperties(Headers.prototype, ["get", "entries", "forEach", "values"].reduce((result, property) => {
      result[property] = { enumerable: true };
      return result;
    }, {}));
    redirectStatus = new Set([301, 302, 303, 307, 308]);
    isRedirect = (code) => {
      return redirectStatus.has(code);
    };
    INTERNALS$1 = Symbol("Response internals");
    Response = class extends Body {
      constructor(body = null, options2 = {}) {
        super(body, options2);
        const status = options2.status || 200;
        const headers = new Headers(options2.headers);
        if (body !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(body);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        this[INTERNALS$1] = {
          url: options2.url,
          status,
          statusText: options2.statusText || "",
          headers,
          counter: options2.counter,
          highWaterMark: options2.highWaterMark
        };
      }
      get url() {
        return this[INTERNALS$1].url || "";
      }
      get status() {
        return this[INTERNALS$1].status;
      }
      get ok() {
        return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
      }
      get redirected() {
        return this[INTERNALS$1].counter > 0;
      }
      get statusText() {
        return this[INTERNALS$1].statusText;
      }
      get headers() {
        return this[INTERNALS$1].headers;
      }
      get highWaterMark() {
        return this[INTERNALS$1].highWaterMark;
      }
      clone() {
        return new Response(clone(this, this.highWaterMark), {
          url: this.url,
          status: this.status,
          statusText: this.statusText,
          headers: this.headers,
          ok: this.ok,
          redirected: this.redirected,
          size: this.size
        });
      }
      static redirect(url, status = 302) {
        if (!isRedirect(status)) {
          throw new RangeError('Failed to execute "redirect" on "response": Invalid status code');
        }
        return new Response(null, {
          headers: {
            location: new URL(url).toString()
          },
          status
        });
      }
      get [Symbol.toStringTag]() {
        return "Response";
      }
    };
    Object.defineProperties(Response.prototype, {
      url: { enumerable: true },
      status: { enumerable: true },
      ok: { enumerable: true },
      redirected: { enumerable: true },
      statusText: { enumerable: true },
      headers: { enumerable: true },
      clone: { enumerable: true }
    });
    getSearch = (parsedURL) => {
      if (parsedURL.search) {
        return parsedURL.search;
      }
      const lastOffset = parsedURL.href.length - 1;
      const hash2 = parsedURL.hash || (parsedURL.href[lastOffset] === "#" ? "#" : "");
      return parsedURL.href[lastOffset - hash2.length] === "?" ? "?" : "";
    };
    INTERNALS = Symbol("Request internals");
    isRequest = (object) => {
      return typeof object === "object" && typeof object[INTERNALS] === "object";
    };
    Request = class extends Body {
      constructor(input, init2 = {}) {
        let parsedURL;
        if (isRequest(input)) {
          parsedURL = new URL(input.url);
        } else {
          parsedURL = new URL(input);
          input = {};
        }
        let method = init2.method || input.method || "GET";
        method = method.toUpperCase();
        if ((init2.body != null || isRequest(input)) && input.body !== null && (method === "GET" || method === "HEAD")) {
          throw new TypeError("Request with GET/HEAD method cannot have body");
        }
        const inputBody = init2.body ? init2.body : isRequest(input) && input.body !== null ? clone(input) : null;
        super(inputBody, {
          size: init2.size || input.size || 0
        });
        const headers = new Headers(init2.headers || input.headers || {});
        if (inputBody !== null && !headers.has("Content-Type")) {
          const contentType = extractContentType(inputBody, this);
          if (contentType) {
            headers.append("Content-Type", contentType);
          }
        }
        let signal = isRequest(input) ? input.signal : null;
        if ("signal" in init2) {
          signal = init2.signal;
        }
        if (signal !== null && !isAbortSignal(signal)) {
          throw new TypeError("Expected signal to be an instanceof AbortSignal");
        }
        this[INTERNALS] = {
          method,
          redirect: init2.redirect || input.redirect || "follow",
          headers,
          parsedURL,
          signal
        };
        this.follow = init2.follow === void 0 ? input.follow === void 0 ? 20 : input.follow : init2.follow;
        this.compress = init2.compress === void 0 ? input.compress === void 0 ? true : input.compress : init2.compress;
        this.counter = init2.counter || input.counter || 0;
        this.agent = init2.agent || input.agent;
        this.highWaterMark = init2.highWaterMark || input.highWaterMark || 16384;
        this.insecureHTTPParser = init2.insecureHTTPParser || input.insecureHTTPParser || false;
      }
      get method() {
        return this[INTERNALS].method;
      }
      get url() {
        return (0, import_url.format)(this[INTERNALS].parsedURL);
      }
      get headers() {
        return this[INTERNALS].headers;
      }
      get redirect() {
        return this[INTERNALS].redirect;
      }
      get signal() {
        return this[INTERNALS].signal;
      }
      clone() {
        return new Request(this);
      }
      get [Symbol.toStringTag]() {
        return "Request";
      }
    };
    Object.defineProperties(Request.prototype, {
      method: { enumerable: true },
      url: { enumerable: true },
      headers: { enumerable: true },
      redirect: { enumerable: true },
      clone: { enumerable: true },
      signal: { enumerable: true }
    });
    getNodeRequestOptions = (request) => {
      const { parsedURL } = request[INTERNALS];
      const headers = new Headers(request[INTERNALS].headers);
      if (!headers.has("Accept")) {
        headers.set("Accept", "*/*");
      }
      let contentLengthValue = null;
      if (request.body === null && /^(post|put)$/i.test(request.method)) {
        contentLengthValue = "0";
      }
      if (request.body !== null) {
        const totalBytes = getTotalBytes(request);
        if (typeof totalBytes === "number" && !Number.isNaN(totalBytes)) {
          contentLengthValue = String(totalBytes);
        }
      }
      if (contentLengthValue) {
        headers.set("Content-Length", contentLengthValue);
      }
      if (!headers.has("User-Agent")) {
        headers.set("User-Agent", "node-fetch");
      }
      if (request.compress && !headers.has("Accept-Encoding")) {
        headers.set("Accept-Encoding", "gzip,deflate,br");
      }
      let { agent } = request;
      if (typeof agent === "function") {
        agent = agent(parsedURL);
      }
      if (!headers.has("Connection") && !agent) {
        headers.set("Connection", "close");
      }
      const search = getSearch(parsedURL);
      const requestOptions = {
        path: parsedURL.pathname + search,
        pathname: parsedURL.pathname,
        hostname: parsedURL.hostname,
        protocol: parsedURL.protocol,
        port: parsedURL.port,
        hash: parsedURL.hash,
        search: parsedURL.search,
        query: parsedURL.query,
        href: parsedURL.href,
        method: request.method,
        headers: headers[Symbol.for("nodejs.util.inspect.custom")](),
        insecureHTTPParser: request.insecureHTTPParser,
        agent
      };
      return requestOptions;
    };
    AbortError = class extends FetchBaseError {
      constructor(message, type = "aborted") {
        super(message, type);
      }
    };
    supportedSchemas = new Set(["data:", "http:", "https:"]);
  }
});

// node_modules/@sveltejs/adapter-netlify/files/shims.js
var init_shims = __esm({
  "node_modules/@sveltejs/adapter-netlify/files/shims.js"() {
    init_install_fetch();
  }
});

// node_modules/cookie/index.js
var require_cookie = __commonJS({
  "node_modules/cookie/index.js"(exports) {
    init_shims();
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options2) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options2 || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if (val[0] == '"') {
          val = val.slice(1, -1);
        }
        if (obj[key] == void 0) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options2) {
      var opt = options2 || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (opt.maxAge != null) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// node_modules/datocms-structured-text-utils/dist/cjs/definitions.js
var require_definitions = __commonJS({
  "node_modules/datocms-structured-text-utils/dist/cjs/definitions.js"(exports) {
    init_shims();
    "use strict";
    var _a;
    var _b;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.allowedMarks = exports.allowedAttributes = exports.inlineNodeTypes = exports.allowedChildren = exports.allowedNodeTypes = exports.thematicBreakNodeType = exports.spanNodeType = exports.rootNodeType = exports.paragraphNodeType = exports.listNodeType = exports.listItemNodeType = exports.linkNodeType = exports.itemLinkNodeType = exports.inlineItemNodeType = exports.headingNodeType = exports.codeNodeType = exports.blockNodeType = exports.blockquoteNodeType = void 0;
    exports.blockquoteNodeType = "blockquote";
    exports.blockNodeType = "block";
    exports.codeNodeType = "code";
    exports.headingNodeType = "heading";
    exports.inlineItemNodeType = "inlineItem";
    exports.itemLinkNodeType = "itemLink";
    exports.linkNodeType = "link";
    exports.listItemNodeType = "listItem";
    exports.listNodeType = "list";
    exports.paragraphNodeType = "paragraph";
    exports.rootNodeType = "root";
    exports.spanNodeType = "span";
    exports.thematicBreakNodeType = "thematicBreak";
    exports.allowedNodeTypes = [
      exports.blockquoteNodeType,
      exports.blockNodeType,
      exports.codeNodeType,
      exports.headingNodeType,
      exports.inlineItemNodeType,
      exports.itemLinkNodeType,
      exports.linkNodeType,
      exports.listItemNodeType,
      exports.listNodeType,
      exports.paragraphNodeType,
      exports.rootNodeType,
      exports.spanNodeType,
      exports.thematicBreakNodeType
    ];
    exports.allowedChildren = (_a = {}, _a[exports.blockquoteNodeType] = [exports.paragraphNodeType], _a[exports.blockNodeType] = [], _a[exports.codeNodeType] = [], _a[exports.headingNodeType] = "inlineNodes", _a[exports.inlineItemNodeType] = [], _a[exports.itemLinkNodeType] = "inlineNodes", _a[exports.linkNodeType] = "inlineNodes", _a[exports.listItemNodeType] = [exports.paragraphNodeType, exports.listNodeType], _a[exports.listNodeType] = [exports.listItemNodeType], _a[exports.paragraphNodeType] = "inlineNodes", _a[exports.rootNodeType] = [
      exports.blockquoteNodeType,
      exports.codeNodeType,
      exports.listNodeType,
      exports.paragraphNodeType,
      exports.headingNodeType,
      exports.blockNodeType,
      exports.thematicBreakNodeType
    ], _a[exports.spanNodeType] = [], _a[exports.thematicBreakNodeType] = [], _a);
    exports.inlineNodeTypes = [
      exports.spanNodeType,
      exports.linkNodeType,
      exports.itemLinkNodeType,
      exports.inlineItemNodeType
    ];
    exports.allowedAttributes = (_b = {}, _b[exports.blockquoteNodeType] = ["children", "attribution"], _b[exports.blockNodeType] = ["item"], _b[exports.codeNodeType] = ["language", "highlight", "code"], _b[exports.headingNodeType] = ["level", "children"], _b[exports.inlineItemNodeType] = ["item"], _b[exports.itemLinkNodeType] = ["item", "children", "meta"], _b[exports.linkNodeType] = ["url", "children", "meta"], _b[exports.listItemNodeType] = ["children"], _b[exports.listNodeType] = ["style", "children"], _b[exports.paragraphNodeType] = ["children"], _b[exports.rootNodeType] = ["children"], _b[exports.spanNodeType] = ["value", "marks"], _b[exports.thematicBreakNodeType] = [], _b);
    exports.allowedMarks = [
      "strong",
      "code",
      "emphasis",
      "underline",
      "strikethrough",
      "highlight"
    ];
  }
});

// node_modules/datocms-structured-text-utils/dist/cjs/guards.js
var require_guards = __commonJS({
  "node_modules/datocms-structured-text-utils/dist/cjs/guards.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.isDocument = exports.isStructuredText = exports.isThematicBreak = exports.isInlineItem = exports.isItemLink = exports.isLink = exports.isCode = exports.isBlock = exports.isBlockquote = exports.isListItem = exports.isList = exports.isParagraph = exports.isRoot = exports.isSpan = exports.isHeading = exports.isInlineNode = exports.hasChildren = void 0;
    var definitions_1 = require_definitions();
    function hasChildren(node) {
      return "children" in node;
    }
    exports.hasChildren = hasChildren;
    function isInlineNode(node) {
      return definitions_1.inlineNodeTypes.includes(node.type);
    }
    exports.isInlineNode = isInlineNode;
    function isHeading2(node) {
      return node.type === definitions_1.headingNodeType;
    }
    exports.isHeading = isHeading2;
    function isSpan(node) {
      return node.type === definitions_1.spanNodeType;
    }
    exports.isSpan = isSpan;
    function isRoot(node) {
      return node.type === definitions_1.rootNodeType;
    }
    exports.isRoot = isRoot;
    function isParagraph(node) {
      return node.type === definitions_1.paragraphNodeType;
    }
    exports.isParagraph = isParagraph;
    function isList(node) {
      return node.type === definitions_1.listNodeType;
    }
    exports.isList = isList;
    function isListItem(node) {
      return node.type === definitions_1.listItemNodeType;
    }
    exports.isListItem = isListItem;
    function isBlockquote(node) {
      return node.type === definitions_1.blockquoteNodeType;
    }
    exports.isBlockquote = isBlockquote;
    function isBlock(node) {
      return node.type === definitions_1.blockNodeType;
    }
    exports.isBlock = isBlock;
    function isCode(node) {
      return node.type === definitions_1.codeNodeType;
    }
    exports.isCode = isCode;
    function isLink(node) {
      return node.type === definitions_1.linkNodeType;
    }
    exports.isLink = isLink;
    function isItemLink(node) {
      return node.type === definitions_1.itemLinkNodeType;
    }
    exports.isItemLink = isItemLink;
    function isInlineItem(node) {
      return node.type === definitions_1.inlineItemNodeType;
    }
    exports.isInlineItem = isInlineItem;
    function isThematicBreak(node) {
      return node.type === definitions_1.thematicBreakNodeType;
    }
    exports.isThematicBreak = isThematicBreak;
    function isStructuredText(obj) {
      return obj && "value" in obj && isDocument(obj.value);
    }
    exports.isStructuredText = isStructuredText;
    function isDocument(obj) {
      return obj && "schema" in obj && "document" in obj;
    }
    exports.isDocument = isDocument;
  }
});

// node_modules/array-flatten/dist/index.js
var require_dist = __commonJS({
  "node_modules/array-flatten/dist/index.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function flatten(array) {
      var result = [];
      $flatten(array, result);
      return result;
    }
    exports.flatten = flatten;
    function $flatten(array, result) {
      for (var i = 0; i < array.length; i++) {
        var value = array[i];
        if (Array.isArray(value)) {
          $flatten(value, result);
        } else {
          result.push(value);
        }
      }
    }
  }
});

// node_modules/datocms-structured-text-utils/dist/cjs/render.js
var require_render = __commonJS({
  "node_modules/datocms-structured-text-utils/dist/cjs/render.js"(exports) {
    init_shims();
    "use strict";
    var __extends = exports && exports.__extends || function() {
      var extendStatics = function(d2, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d3, b2) {
          d3.__proto__ = b2;
        } || function(d3, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d3[p] = b2[p];
        };
        return extendStatics(d2, b);
      };
      return function(d2, b) {
        extendStatics(d2, b);
        function __() {
          this.constructor = d2;
        }
        d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    var __spreadArrays = exports && exports.__spreadArrays || function() {
      for (var s2 = 0, i = 0, il = arguments.length; i < il; i++)
        s2 += arguments[i].length;
      for (var r = Array(s2), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.render = exports.transformNode = exports.renderRule = exports.RenderError = void 0;
    var guards_1 = require_guards();
    var array_flatten_1 = require_dist();
    var RenderError = function(_super) {
      __extends(RenderError2, _super);
      function RenderError2(message, node) {
        var _this = _super.call(this, message) || this;
        _this.node = node;
        Object.setPrototypeOf(_this, RenderError2.prototype);
        return _this;
      }
      return RenderError2;
    }(Error);
    exports.RenderError = RenderError;
    var renderRule2 = function(guard, transform) {
      return {
        appliable: guard,
        apply: function(ctx) {
          return transform(ctx);
        }
      };
    };
    exports.renderRule = renderRule2;
    function transformNode(adapter, node, key, ancestors, renderRules) {
      var children = guards_1.hasChildren(node) ? array_flatten_1.flatten(node.children.map(function(innerNode, index2) {
        return transformNode(adapter, innerNode, "t-" + index2, __spreadArrays([node], ancestors), renderRules);
      }).filter(function(x) {
        return !!x;
      })) : void 0;
      var matchingTransform = renderRules.find(function(transform) {
        return transform.appliable(node);
      });
      if (matchingTransform) {
        return matchingTransform.apply({ adapter, node, children, key, ancestors });
      } else {
        throw new RenderError(`Don't know how to render a node with type "` + node.type + '". Please specify a custom renderRule for it!', node);
      }
    }
    exports.transformNode = transformNode;
    function render2(adapter, structuredTextOrNode, renderRules) {
      if (!structuredTextOrNode) {
        return null;
      }
      var result = transformNode(adapter, guards_1.isStructuredText(structuredTextOrNode) ? structuredTextOrNode.value.document : guards_1.isDocument(structuredTextOrNode) ? structuredTextOrNode.document : structuredTextOrNode, "t-0", [], renderRules);
      return result;
    }
    exports.render = render2;
  }
});

// node_modules/datocms-structured-text-utils/dist/cjs/types.js
var require_types = __commonJS({
  "node_modules/datocms-structured-text-utils/dist/cjs/types.js"(exports) {
    init_shims();
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/datocms-structured-text-utils/dist/cjs/validate.js
var require_validate = __commonJS({
  "node_modules/datocms-structured-text-utils/dist/cjs/validate.js"(exports) {
    init_shims();
    "use strict";
    var __rest = exports && exports.__rest || function(s2, e) {
      var t = {};
      for (var p in s2)
        if (Object.prototype.hasOwnProperty.call(s2, p) && e.indexOf(p) < 0)
          t[p] = s2[p];
      if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s2); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p[i]))
            t[p[i]] = s2[p[i]];
        }
      return t;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.validate = void 0;
    var definitions_1 = require_definitions();
    function validate(document) {
      if (document === null || document === void 0) {
        return { valid: true };
      }
      if (document.schema !== "dast") {
        return {
          valid: false,
          message: '.schema is not "dast":\n\n ' + JSON.stringify(document, null, 2)
        };
      }
      var nodes = [document.document];
      var node = document.document;
      var _loop_1 = function() {
        var next = nodes.pop();
        if (!next) {
          return "break";
        }
        node = next;
        var type = node.type, attributes = __rest(node, ["type"]);
        var invalidAttribute = Object.keys(attributes).find(function(attr) {
          return !definitions_1.allowedAttributes[node.type].includes(attr);
        });
        if (invalidAttribute) {
          return { value: {
            valid: false,
            message: '"' + node.type + '" has an invalid attribute "' + invalidAttribute + '":\n\n ' + JSON.stringify(node, null, 2)
          } };
        }
        if ("meta" in node) {
          if (!Array.isArray(node.meta)) {
            return { value: {
              valid: false,
              message: '"' + node.type + `"'s meta is not an Array:

 ` + JSON.stringify(node, null, 2)
            } };
          }
          var invalidMeta = node.meta.find(function(entry) {
            return typeof entry !== "object" || !("id" in entry) || !("value" in entry) || typeof entry.value !== "string";
          });
          if (invalidMeta) {
            return { value: {
              valid: false,
              message: '"' + node.type + '" has an invalid meta ' + JSON.stringify(invalidMeta) + ":\n\n " + JSON.stringify(node, null, 2)
            } };
          }
        }
        if ("marks" in node) {
          if (!Array.isArray(node.marks)) {
            return { value: {
              valid: false,
              message: '"' + node.type + `"'s marks is not an Array:

 ` + JSON.stringify(node, null, 2)
            } };
          }
          var invalidMark = node.marks.find(function(mark) {
            return !definitions_1.allowedMarks.includes(mark);
          });
          if (invalidMark) {
            return { value: {
              valid: false,
              message: '"' + node.type + '" has an invalid mark "' + invalidMark + '":\n\n ' + JSON.stringify(node, null, 2)
            } };
          }
        }
        if ("children" in node) {
          if (!Array.isArray(node.children)) {
            return { value: {
              valid: false,
              message: '"' + node.type + `"'s children is not an Array:

 ` + JSON.stringify(node, null, 2)
            } };
          }
          if (node.children.length === 0) {
            return { value: {
              valid: false,
              message: '"' + node.type + `"'s children cannot be an empty Array:

 ` + JSON.stringify(node, null, 2)
            } };
          }
          var allowed_1 = definitions_1.allowedChildren[node.type];
          if (typeof allowed_1 === "string" && allowed_1 === "inlineNodes") {
            allowed_1 = definitions_1.inlineNodeTypes;
          }
          var invalidChildIndex = node.children.findIndex(function(child) {
            return !child || !allowed_1.includes(child.type);
          });
          if (invalidChildIndex !== -1) {
            var invalidChild = node.children[invalidChildIndex];
            return { value: {
              valid: false,
              message: '"' + node.type + '" has invalid child "' + (invalidChild ? invalidChild.type : invalidChild) + '":\n\n ' + JSON.stringify(node, null, 2)
            } };
          }
          for (var i = node.children.length - 1; i >= 0; i--) {
            nodes.push(node.children[i]);
          }
        }
      };
      while (nodes.length > 0) {
        var state_1 = _loop_1();
        if (typeof state_1 === "object")
          return state_1.value;
        if (state_1 === "break")
          break;
      }
      return {
        valid: true
      };
    }
    exports.validate = validate;
  }
});

// node_modules/datocms-structured-text-utils/dist/cjs/index.js
var require_cjs = __commonJS({
  "node_modules/datocms-structured-text-utils/dist/cjs/index.js"(exports) {
    init_shims();
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() {
        return m[k];
      } });
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports && exports.__exportStar || function(m, exports2) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
          __createBinding(exports2, m, p);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_definitions(), exports);
    __exportStar(require_guards(), exports);
    __exportStar(require_render(), exports);
    __exportStar(require_types(), exports);
    __exportStar(require_validate(), exports);
  }
});

// node_modules/datocms-structured-text-generic-html-renderer/dist/cjs/index.js
var require_cjs2 = __commonJS({
  "node_modules/datocms-structured-text-generic-html-renderer/dist/cjs/index.js"(exports) {
    init_shims();
    "use strict";
    var __assign = exports && exports.__assign || function() {
      __assign = Object.assign || function(t) {
        for (var s2, i = 1, n = arguments.length; i < n; i++) {
          s2 = arguments[i];
          for (var p in s2)
            if (Object.prototype.hasOwnProperty.call(s2, p))
              t[p] = s2[p];
        }
        return t;
      };
      return __assign.apply(this, arguments);
    };
    var __spreadArrays = exports && exports.__spreadArrays || function() {
      for (var s2 = 0, i = 0, il = arguments.length; i < il; i++)
        s2 += arguments[i].length;
      for (var r = Array(s2), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.render = exports.defaultMetaTransformer = exports.markToTagName = exports.RenderError = exports.renderRule = void 0;
    var datocms_structured_text_utils_1 = require_cjs();
    Object.defineProperty(exports, "renderRule", { enumerable: true, get: function() {
      return datocms_structured_text_utils_1.renderRule;
    } });
    Object.defineProperty(exports, "RenderError", { enumerable: true, get: function() {
      return datocms_structured_text_utils_1.RenderError;
    } });
    function markToTagName(mark) {
      switch (mark) {
        case "emphasis":
          return "em";
        case "underline":
          return "u";
        case "strikethrough":
          return "del";
        case "highlight":
          return "mark";
        default:
          return mark;
      }
    }
    exports.markToTagName = markToTagName;
    var defaultMetaTransformer = function(_a) {
      var meta = _a.meta;
      var attributes = {};
      meta.forEach(function(entry) {
        if (["target", "title", "rel"].includes(entry.id)) {
          attributes[entry.id] = entry.value;
        }
      });
      return attributes;
    };
    exports.defaultMetaTransformer = defaultMetaTransformer;
    function render2(adapter, structuredTextOrNode, customRules, metaTransformer) {
      if (metaTransformer === void 0) {
        metaTransformer = exports.defaultMetaTransformer;
      }
      return datocms_structured_text_utils_1.render(adapter, structuredTextOrNode, __spreadArrays(customRules, [
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isRoot, function(_a) {
          var renderFragment = _a.adapter.renderFragment, key = _a.key, children = _a.children;
          return renderFragment(children, key);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isParagraph, function(_a) {
          var renderNode = _a.adapter.renderNode, key = _a.key, children = _a.children;
          return renderNode("p", { key }, children);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isList, function(_a) {
          var renderNode = _a.adapter.renderNode, node = _a.node, key = _a.key, children = _a.children;
          return renderNode(node.style === "bulleted" ? "ul" : "ol", { key }, children);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isListItem, function(_a) {
          var renderNode = _a.adapter.renderNode, key = _a.key, children = _a.children;
          return renderNode("li", { key }, children);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isBlockquote, function(_a) {
          var renderNode = _a.adapter.renderNode, key = _a.key, node = _a.node, children = _a.children;
          var childrenWithAttribution = node.attribution ? __spreadArrays(children || [], [
            renderNode("footer", { key: "footer" }, node.attribution)
          ]) : children;
          return renderNode("blockquote", { key }, childrenWithAttribution);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isCode, function(_a) {
          var _b = _a.adapter, renderNode = _b.renderNode, renderText = _b.renderText, key = _a.key, node = _a.node;
          return renderNode("pre", { key, "data-language": node.language }, renderNode("code", null, renderText(node.code)));
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isLink, function(_a) {
          var renderNode = _a.adapter.renderNode, key = _a.key, children = _a.children, node = _a.node;
          var meta = node.meta ? metaTransformer({ node, meta: node.meta }) : {};
          return renderNode("a", __assign(__assign({}, meta || {}), { key, href: node.url }), children);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isThematicBreak, function(_a) {
          var renderNode = _a.adapter.renderNode, key = _a.key;
          return renderNode("hr", { key });
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isHeading, function(_a) {
          var node = _a.node, renderNode = _a.adapter.renderNode, children = _a.children, key = _a.key;
          return renderNode("h" + node.level, { key }, children);
        }),
        datocms_structured_text_utils_1.renderRule(datocms_structured_text_utils_1.isSpan, function(_a) {
          var _b = _a.adapter, renderNode = _b.renderNode, renderText = _b.renderText, key = _a.key, node = _a.node;
          var marks = node.marks || [];
          var lines = node.value.split(/\n/);
          var textWithNewlinesConvertedToBr = lines.length > 0 ? lines.slice(1).reduce(function(acc, line, index2) {
            return acc.concat([
              renderNode("br", { key: key + "-br-" + index2 }),
              renderText(line, key + "-line-" + index2)
            ]);
          }, [renderText(lines[0], key + "-line-first")]) : renderText(node.value, key);
          return marks.reduce(function(children, mark) {
            return renderNode(markToTagName(mark), { key }, children);
          }, textWithNewlinesConvertedToBr);
        })
      ]));
    }
    exports.render = render2;
  }
});

// node_modules/browser-split/index.js
var require_browser_split = __commonJS({
  "node_modules/browser-split/index.js"(exports, module2) {
    init_shims();
    module2.exports = function split(undef) {
      var nativeSplit = String.prototype.split, compliantExecNpcg = /()??/.exec("")[1] === undef, self;
      self = function(str, separator, limit) {
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
          return nativeSplit.call(str, separator, limit);
        }
        var output = [], flags = (separator.ignoreCase ? "i" : "") + (separator.multiline ? "m" : "") + (separator.extended ? "x" : "") + (separator.sticky ? "y" : ""), lastLastIndex = 0, separator = new RegExp(separator.source, flags + "g"), separator2, match, lastIndex, lastLength;
        str += "";
        if (!compliantExecNpcg) {
          separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
        }
        limit = limit === undef ? -1 >>> 0 : limit >>> 0;
        while (match = separator.exec(str)) {
          lastIndex = match.index + match[0].length;
          if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));
            if (!compliantExecNpcg && match.length > 1) {
              match[0].replace(separator2, function() {
                for (var i = 1; i < arguments.length - 2; i++) {
                  if (arguments[i] === undef) {
                    match[i] = undef;
                  }
                }
              });
            }
            if (match.length > 1 && match.index < str.length) {
              Array.prototype.push.apply(output, match.slice(1));
            }
            lastLength = match[0].length;
            lastLastIndex = lastIndex;
            if (output.length >= limit) {
              break;
            }
          }
          if (separator.lastIndex === match.index) {
            separator.lastIndex++;
          }
        }
        if (lastLastIndex === str.length) {
          if (lastLength || !separator.test("")) {
            output.push("");
          }
        } else {
          output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
      };
      return self;
    }();
  }
});

// node_modules/indexof/index.js
var require_indexof = __commonJS({
  "node_modules/indexof/index.js"(exports, module2) {
    init_shims();
    var indexOf = [].indexOf;
    module2.exports = function(arr, obj) {
      if (indexOf)
        return arr.indexOf(obj);
      for (var i = 0; i < arr.length; ++i) {
        if (arr[i] === obj)
          return i;
      }
      return -1;
    };
  }
});

// node_modules/class-list/index.js
var require_class_list = __commonJS({
  "node_modules/class-list/index.js"(exports, module2) {
    init_shims();
    var indexof = require_indexof();
    module2.exports = ClassList;
    function ClassList(elem) {
      var cl = elem.classList;
      if (cl) {
        return cl;
      }
      var classList = {
        add,
        remove,
        contains,
        toggle,
        toString: $toString,
        length: 0,
        item
      };
      return classList;
      function add(token) {
        var list = getTokens();
        if (indexof(list, token) > -1) {
          return;
        }
        list.push(token);
        setTokens(list);
      }
      function remove(token) {
        var list = getTokens(), index2 = indexof(list, token);
        if (index2 === -1) {
          return;
        }
        list.splice(index2, 1);
        setTokens(list);
      }
      function contains(token) {
        return indexof(getTokens(), token) > -1;
      }
      function toggle(token) {
        if (contains(token)) {
          remove(token);
          return false;
        } else {
          add(token);
          return true;
        }
      }
      function $toString() {
        return elem.className;
      }
      function item(index2) {
        var tokens = getTokens();
        return tokens[index2] || null;
      }
      function getTokens() {
        var className = elem.className;
        return filter(className.split(" "), isTruthy);
      }
      function setTokens(list) {
        var length = list.length;
        elem.className = list.join(" ");
        classList.length = length;
        for (var i = 0; i < list.length; i++) {
          classList[i] = list[i];
        }
        delete list[length];
      }
    }
    function filter(arr, fn) {
      var ret = [];
      for (var i = 0; i < arr.length; i++) {
        if (fn(arr[i]))
          ret.push(arr[i]);
      }
      return ret;
    }
    function isTruthy(value) {
      return !!value;
    }
  }
});

// node_modules/html-element/html-attributes.js
var require_html_attributes = __commonJS({
  "node_modules/html-element/html-attributes.js"(exports, module2) {
    init_shims();
    var PROPS_TO_ATTRS = {
      "className": "class",
      "htmlFor": "for"
    };
    var HTML_ATTRIBUTES = {
      "accept": new Set([
        "form",
        "input"
      ]),
      "accept-charset": new Set([
        "form"
      ]),
      "accesskey": "GLOBAL",
      "action": new Set([
        "form"
      ]),
      "align": new Set([
        "applet",
        "caption",
        "col",
        "colgroup",
        "hr",
        "iframe",
        "img",
        "table",
        "tbody",
        "td",
        "tfoot",
        "th",
        "thead",
        "tr"
      ]),
      "alt": new Set([
        "applet",
        "area",
        "img",
        "input"
      ]),
      "async": new Set([
        "script"
      ]),
      "autocomplete": new Set([
        "form",
        "input"
      ]),
      "autofocus": new Set([
        "button",
        "input",
        "keygen",
        "select",
        "textarea"
      ]),
      "autoplay": new Set([
        "audio",
        "video"
      ]),
      "autosave": new Set([
        "input"
      ]),
      "bgcolor": new Set([
        "body",
        "col",
        "colgroup",
        "marquee",
        "table",
        "tbody",
        "tfoot",
        "td",
        "th",
        "tr"
      ]),
      "border": new Set([
        "img",
        "object",
        "table"
      ]),
      "buffered": new Set([
        "audio",
        "video"
      ]),
      "challenge": new Set([
        "keygen"
      ]),
      "charset": new Set([
        "meta",
        "script"
      ]),
      "checked": new Set([
        "command",
        "input"
      ]),
      "cite": new Set([
        "blockquote",
        "del",
        "ins",
        "q"
      ]),
      "class": "GLOBAL",
      "code": new Set([
        "applet"
      ]),
      "codebase": new Set([
        "applet"
      ]),
      "color": new Set([
        "basefont",
        "font",
        "hr"
      ]),
      "cols": new Set([
        "textarea"
      ]),
      "colspan": new Set([
        "td",
        "th"
      ]),
      "content": new Set([
        "meta"
      ]),
      "contenteditable": "GLOBAL",
      "contextmenu": "GLOBAL",
      "controls": new Set([
        "audio",
        "video"
      ]),
      "coords": new Set([
        "area"
      ]),
      "data": new Set([
        "object"
      ]),
      "datetime": new Set([
        "del",
        "ins",
        "time"
      ]),
      "default": new Set([
        "track"
      ]),
      "defer": new Set([
        "script"
      ]),
      "dir": "GLOBAL",
      "dirname": new Set([
        "input",
        "textarea"
      ]),
      "disabled": new Set([
        "button",
        "command",
        "fieldset",
        "input",
        "keygen",
        "optgroup",
        "option",
        "select",
        "textarea"
      ]),
      "download": new Set([
        "a",
        "area"
      ]),
      "draggable": "GLOBAL",
      "dropzone": "GLOBAL",
      "enctype": new Set([
        "form"
      ]),
      "for": new Set([
        "label",
        "output"
      ]),
      "form": new Set([
        "button",
        "fieldset",
        "input",
        "keygen",
        "label",
        "meter",
        "object",
        "output",
        "progress",
        "select",
        "textarea"
      ]),
      "formaction": new Set([
        "input",
        "button"
      ]),
      "headers": new Set([
        "td",
        "th"
      ]),
      "height": new Set([
        "canvas",
        "embed",
        "iframe",
        "img",
        "input",
        "object",
        "video"
      ]),
      "hidden": "GLOBAL",
      "high": new Set([
        "meter"
      ]),
      "href": new Set([
        "a",
        "area",
        "base",
        "link"
      ]),
      "hreflang": new Set([
        "a",
        "area",
        "link"
      ]),
      "http-equiv": new Set([
        "meta"
      ]),
      "icon": new Set([
        "command"
      ]),
      "id": "GLOBAL",
      "ismap": new Set([
        "img"
      ]),
      "itemprop": "GLOBAL",
      "keytype": new Set([
        "keygen"
      ]),
      "kind": new Set([
        "track"
      ]),
      "label": new Set([
        "track"
      ]),
      "lang": "GLOBAL",
      "language": new Set([
        "script"
      ]),
      "list": new Set([
        "input"
      ]),
      "loop": new Set([
        "audio",
        "bgsound",
        "marquee",
        "video"
      ]),
      "low": new Set([
        "meter"
      ]),
      "manifest": new Set([
        "html"
      ]),
      "max": new Set([
        "input",
        "meter",
        "progress"
      ]),
      "maxlength": new Set([
        "input",
        "textarea"
      ]),
      "maxlength": new Set([
        "input",
        "textarea"
      ]),
      "media": new Set([
        "a",
        "area",
        "link",
        "source",
        "style"
      ]),
      "method": new Set([
        "form"
      ]),
      "min": new Set([
        "input",
        "meter"
      ]),
      "multiple": new Set([
        "input",
        "select"
      ]),
      "muted": new Set([
        "video"
      ]),
      "name": new Set([
        "button",
        "form",
        "fieldset",
        "iframe",
        "input",
        "keygen",
        "object",
        "output",
        "select",
        "textarea",
        "map",
        "meta",
        "param"
      ]),
      "novalidate": new Set([
        "form"
      ]),
      "open": new Set([
        "details"
      ]),
      "optimum": new Set([
        "meter"
      ]),
      "pattern": new Set([
        "input"
      ]),
      "ping": new Set([
        "a",
        "area"
      ]),
      "placeholder": new Set([
        "input",
        "textarea"
      ]),
      "poster": new Set([
        "video"
      ]),
      "preload": new Set([
        "audio",
        "video"
      ]),
      "radiogroup": new Set([
        "command"
      ]),
      "readonly": new Set([
        "input",
        "textarea"
      ]),
      "rel": new Set([
        "a",
        "area",
        "link"
      ]),
      "required": new Set([
        "input",
        "select",
        "textarea"
      ]),
      "reversed": new Set([
        "ol"
      ]),
      "rows": new Set([
        "textarea"
      ]),
      "rowspan": new Set([
        "td",
        "th"
      ]),
      "sandbox": new Set([
        "iframe"
      ]),
      "scope": new Set([
        "th"
      ]),
      "scoped": new Set([
        "style"
      ]),
      "seamless": new Set([
        "iframe"
      ]),
      "selected": new Set([
        "option"
      ]),
      "shape": new Set([
        "a",
        "area"
      ]),
      "size": new Set([
        "input",
        "select"
      ]),
      "sizes": new Set([
        "img",
        "link",
        "source"
      ]),
      "span": new Set([
        "col",
        "colgroup"
      ]),
      "spellcheck": "GLOBAL",
      "src": new Set([
        "audio",
        "embed",
        "iframe",
        "img",
        "input",
        "script",
        "source",
        "track",
        "video"
      ]),
      "srcdoc": new Set([
        "iframe"
      ]),
      "srclang": new Set([
        "track"
      ]),
      "srcset": new Set([
        "img"
      ]),
      "start": new Set([
        "ol"
      ]),
      "step": new Set([
        "input"
      ]),
      "style": "GLOBAL",
      "summary": new Set([
        "table"
      ]),
      "tabindex": "GLOBAL",
      "target": new Set([
        "a",
        "area",
        "base",
        "form"
      ]),
      "title": "GLOBAL",
      "type": new Set([
        "button",
        "input",
        "command",
        "embed",
        "object",
        "script",
        "source",
        "style",
        "menu"
      ]),
      "usemap": new Set([
        "img",
        "input",
        "object"
      ]),
      "value": new Set([
        "button",
        "option",
        "input",
        "li",
        "meter",
        "progress",
        "param"
      ]),
      "width": new Set([
        "canvas",
        "embed",
        "iframe",
        "img",
        "input",
        "object",
        "video"
      ]),
      "wrap": new Set([
        "textarea"
      ])
    };
    function isStandardAttribute(attrName, tagName) {
      tagName = tagName.toLowerCase();
      var attr = HTML_ATTRIBUTES[attrName.toLowerCase()];
      return !!attr && (attr === "GLOBAL" || attr.has(tagName));
    }
    function propToAttr(prop) {
      return PROPS_TO_ATTRS[prop] || prop;
    }
    module2.exports = {
      isStandardAttribute,
      propToAttr
    };
  }
});

// node_modules/html-element/index.js
var require_html_element = __commonJS({
  "node_modules/html-element/index.js"(exports, module2) {
    init_shims();
    var ClassList = require_class_list();
    var htmlAttributes = require_html_attributes();
    function Event(type, data) {
      this.type = type;
      this.target = null;
      Object.keys(data || {}).forEach(function(attr) {
        this[attr] = data[attr];
      }, this);
    }
    Event.prototype.preventDefault = function() {
    };
    Event.prototype.stopPropagation = function() {
    };
    Event.prototype.stopImmediatePropagation = function() {
    };
    function addEventListener(eventType, listener) {
      this._eventListeners = this._eventListeners || {};
      this._eventListeners[eventType] = this._eventListeners[eventType] || [];
      var listeners = this._eventListeners[eventType];
      if (listeners.indexOf(listener) === -1) {
        listeners.push(listener);
      }
    }
    function removeEventListener(eventType, listener) {
      var listeners = this._eventListeners && this._eventListeners[eventType];
      if (listeners) {
        var index2 = listeners.indexOf(listener);
        if (index2 !== -1) {
          listeners.splice(index2, 1);
        }
      }
    }
    function dispatchEvent(event) {
      event.target = this;
      var listeners = this._eventListeners && this._eventListeners[event.type];
      if (listeners) {
        listeners.forEach(function(listener) {
          listener(event);
        });
      }
      return true;
    }
    function Document() {
    }
    Document.prototype.createTextNode = function(v) {
      var n = new Text();
      n.textContent = v;
      n.nodeName = "#text";
      n.nodeType = 3;
      return n;
    };
    Document.prototype.createElement = function(nodeName) {
      var el = new Element();
      el.nodeName = el.tagName = nodeName;
      return el;
    };
    Document.prototype.createComment = function(data) {
      var el = new Comment();
      el.data = data;
      return el;
    };
    Document.prototype.addEventListener = addEventListener;
    Document.prototype.removeEventListener = removeEventListener;
    Document.prototype.dispatchEvent = dispatchEvent;
    function Node() {
    }
    Text.prototype = new Node();
    Element.prototype = new Node();
    Comment.prototype = new Node();
    function Style(el) {
      this.el = el;
      this.styles = [];
    }
    Style.prototype.setProperty = function(n, v) {
      this.el._setProperty(this.styles, { name: n, value: v });
    };
    Style.prototype.getProperty = function(n) {
      return this.el._getProperty(this.styles, n);
    };
    Style.prototype.__defineGetter__("cssText", function() {
      var stylified = "";
      this.styles.forEach(function(s2) {
        stylified += s2.name + ":" + s2.value + ";";
      });
      return stylified;
    });
    Style.prototype.__defineSetter__("cssText", function(v) {
      this.styles.length = 0;
      v.split(";").forEach(function(part) {
        var splitPoint = part.indexOf(":");
        if (splitPoint) {
          var key = part.slice(0, splitPoint).trim();
          var value = part.slice(splitPoint + 1).trim();
          this.setProperty(key, value);
        }
      }, this);
    });
    function Attribute(name, value) {
      if (name) {
        this.name = name;
        this.value = value ? value : "";
      }
    }
    function Element() {
      var self = this;
      this.style = new Style(this);
      this.classList = ClassList(this);
      this.childNodes = [];
      this.attributes = [];
      this.dataset = {};
      this.className = "";
      this._setProperty = function(arr, obj, key, val) {
        var p = self._getProperty(arr, key);
        if (p) {
          p.value = String(val);
          return;
        }
        arr.push(typeof obj === "function" ? new obj(key.toLowerCase(), String(val)) : obj);
      };
      this._getProperty = function(arr, key) {
        if (!key)
          return;
        key = key.toLowerCase();
        for (var i = 0; i < arr.length; i++) {
          if (key === arr[i].name)
            return arr[i];
        }
      };
    }
    Element.prototype.nodeType = 1;
    Element.prototype.appendChild = function(child) {
      child.parentElement = this;
      this.childNodes.push(child);
      return child;
    };
    Element.prototype.setAttribute = function(n, v) {
      if (n === "style") {
        this.style.cssText = v;
      } else {
        this._setProperty(this.attributes, Attribute, n, v);
      }
    };
    Element.prototype.getAttribute = function(n) {
      if (n === "style") {
        return this.style.cssText;
      } else {
        var result = this._getProperty(this.attributes, n);
        return typeof result !== "undefined" ? result.value : null;
      }
    };
    Element.prototype.removeAttribute = function(n) {
      if (n === "class") {
        delete this.className;
      } else {
        for (var i = 0, len = this.attributes.length; i < len; i++) {
          if (this.attributes[i].name === n) {
            this.attributes.splice(i, 1);
            break;
          }
        }
      }
    };
    Element.prototype.replaceChild = function(newChild, oldChild) {
      var self = this;
      var replaced = false;
      this.childNodes.forEach(function(child, index2) {
        if (child === oldChild) {
          self.childNodes[index2] = newChild;
          newChild.parentElement = this;
          replaced = true;
        }
      });
      if (replaced)
        return oldChild;
    };
    Element.prototype.removeChild = function(rChild) {
      var self = this;
      var removed = true;
      this.childNodes.forEach(function(child, index2) {
        if (child === rChild) {
          self.childNodes.splice(index2, 1);
          rChild.parentElement = null;
          removed = true;
        }
      });
      if (removed)
        return rChild;
    };
    Element.prototype.insertBefore = function(newChild, existingChild) {
      var childNodes = this.childNodes;
      if (existingChild === null) {
        childNodes.push(newChild);
      } else {
        for (var i = 0, len = childNodes.length; i < len; i++) {
          var child = childNodes[i];
          if (child === existingChild) {
            i === 0 ? childNodes.unshift(newChild) : childNodes.splice(i, 0, newChild);
            break;
          }
        }
      }
      newChild.parentElement = this;
      return newChild;
    };
    Element.prototype.addEventListener = addEventListener;
    Element.prototype.removeEventListener = removeEventListener;
    Element.prototype.dispatchEvent = dispatchEvent;
    Element.prototype.insertAdjacentHTML = function(position, text) {
    };
    Element.prototype.__defineGetter__("innerHTML", function() {
      var s2 = this.childNodes.html || "";
      this.childNodes.forEach(function(e) {
        s2 += e.outerHTML || e.textContent;
      });
      return s2;
    });
    Element.prototype.__defineSetter__("innerHTML", function(v) {
      this.childNodes.length = 0;
      this.childNodes.html = v;
    });
    Element.prototype.__defineGetter__("outerHTML", function() {
      var a = [], self = this;
      var VOID_ELEMENTS = {
        AREA: true,
        BASE: true,
        BR: true,
        COL: true,
        EMBED: true,
        HR: true,
        IMG: true,
        INPUT: true,
        KEYGEN: true,
        LINK: true,
        META: true,
        PARAM: true,
        SOURCE: true,
        TRACK: true,
        WBR: true
      };
      function _stringify(arr) {
        var attr = [], value;
        arr.forEach(function(a2) {
          value = a2.name != "style" ? a2.value : self.style.cssText;
          attr.push(a2.name + '="' + escapeAttribute(value) + '"');
        });
        return attr.length ? " " + attr.join(" ") : "";
      }
      function _dataify(data) {
        var attr = [], value;
        Object.keys(data).forEach(function(name) {
          attr.push("data-" + name + '="' + escapeAttribute(data[name]) + '"');
        });
        return attr.length ? " " + attr.join(" ") : "";
      }
      function _propertify() {
        var props = [];
        for (var key in self) {
          var attrName = htmlAttributes.propToAttr(key);
          if (self.hasOwnProperty(key) && ["string", "boolean", "number"].indexOf(typeof self[key]) !== -1 && htmlAttributes.isStandardAttribute(attrName, self.nodeName) && _shouldOutputProp(key, attrName)) {
            props.push({ name: attrName, value: self[key] });
          }
        }
        return props ? _stringify(props) : "";
      }
      function _shouldOutputProp(prop, attr) {
        if (self.getAttribute(attr)) {
          return false;
        } else {
          if (prop === "className" && !self[prop]) {
            return false;
          }
        }
        return true;
      }
      var attrs = this.style.cssText ? this.attributes.concat([{ name: "style" }]) : this.attributes;
      a.push("<" + this.nodeName + _propertify() + _stringify(attrs) + _dataify(this.dataset) + ">");
      if (!VOID_ELEMENTS[this.nodeName.toUpperCase()]) {
        a.push(this.innerHTML);
        a.push("</" + this.nodeName + ">");
      }
      return a.join("");
    });
    Element.prototype.__defineGetter__("textContent", function() {
      var s2 = "";
      this.childNodes.forEach(function(e) {
        s2 += e.textContent;
      });
      return s2;
    });
    Element.prototype.__defineSetter__("textContent", function(v) {
      var textNode = new Text();
      textNode.textContent = v;
      this.childNodes = [textNode];
      return v;
    });
    function escapeHTML(s2) {
      return String(s2).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    function escapeAttribute(s2) {
      return escapeHTML(s2).replace(/"/g, "&quot;");
    }
    Element.prototype.nodeValue = null;
    function Text() {
    }
    Text.prototype.nodeType = 3;
    Text.prototype.nodeName = "#text";
    Text.prototype.__defineGetter__("textContent", function() {
      return escapeHTML(this.value || "");
    });
    Text.prototype.__defineSetter__("textContent", function(v) {
      this.value = v;
    });
    Text.prototype.__defineGetter__("nodeValue", function() {
      return escapeHTML(this.value || "");
    });
    Text.prototype.__defineSetter__("nodeValue", function(v) {
      this.value = v;
    });
    Text.prototype.__defineGetter__("length", function() {
      return (this.value || "").length;
    });
    Text.prototype.replaceData = function(offset, length, str) {
      this.value = this.value.slice(0, offset) + str + this.value.slice(offset + length);
    };
    function Comment() {
    }
    Comment.prototype.nodeType = 8;
    Comment.prototype.nodeName = "#comment";
    Comment.prototype.__defineGetter__("data", function() {
      return this.value;
    });
    Comment.prototype.__defineSetter__("data", function(v) {
      this.value = v;
    });
    Comment.prototype.__defineGetter__("outerHTML", function() {
      return "<!--" + escapeHTML(this.value || "") + "-->";
    });
    Comment.prototype.__defineGetter__("nodeValue", function() {
      return escapeHTML(this.value || "");
    });
    Comment.prototype.__defineSetter__("nodeValue", function(v) {
      this.value = v;
    });
    function defineParentNode(obj) {
      obj.__defineGetter__("parentNode", function() {
        return this.parentElement;
      });
    }
    defineParentNode(Element.prototype);
    defineParentNode(Comment.prototype);
    defineParentNode(Text.prototype);
    defineParentNode(Node.prototype);
    module2.exports = {
      Document,
      Node,
      Element,
      Comment,
      Text,
      document: new Document(),
      Event,
      CustomEvent: Event
    };
  }
});

// node_modules/hyperscript/index.js
var require_hyperscript = __commonJS({
  "node_modules/hyperscript/index.js"(exports, module2) {
    init_shims();
    var split = require_browser_split();
    var ClassList = require_class_list();
    var w = typeof window === "undefined" ? require_html_element() : window;
    var document = w.document;
    var Text = w.Text;
    function context() {
      var cleanupFuncs = [];
      function h2() {
        var args = [].slice.call(arguments), e = null;
        function item(l) {
          var r;
          function parseClass(string) {
            var m = split(string, /([\.#]?[^\s#.]+)/);
            if (/^\.|#/.test(m[1]))
              e = document.createElement("div");
            forEach(m, function(v2) {
              var s3 = v2.substring(1, v2.length);
              if (!v2)
                return;
              if (!e)
                e = document.createElement(v2);
              else if (v2[0] === ".")
                ClassList(e).add(s3);
              else if (v2[0] === "#")
                e.setAttribute("id", s3);
            });
          }
          if (l == null)
            ;
          else if (typeof l === "string") {
            if (!e)
              parseClass(l);
            else
              e.appendChild(r = document.createTextNode(l));
          } else if (typeof l === "number" || typeof l === "boolean" || l instanceof Date || l instanceof RegExp) {
            e.appendChild(r = document.createTextNode(l.toString()));
          } else if (isArray(l))
            forEach(l, item);
          else if (isNode(l))
            e.appendChild(r = l);
          else if (l instanceof Text)
            e.appendChild(r = l);
          else if (typeof l === "object") {
            for (var k in l) {
              if (typeof l[k] === "function") {
                if (/^on\w+/.test(k)) {
                  (function(k2, l2) {
                    if (e.addEventListener) {
                      e.addEventListener(k2.substring(2), l2[k2], false);
                      cleanupFuncs.push(function() {
                        e.removeEventListener(k2.substring(2), l2[k2], false);
                      });
                    } else {
                      e.attachEvent(k2, l2[k2]);
                      cleanupFuncs.push(function() {
                        e.detachEvent(k2, l2[k2]);
                      });
                    }
                  })(k, l);
                } else {
                  e[k] = l[k]();
                  cleanupFuncs.push(l[k](function(v2) {
                    e[k] = v2;
                  }));
                }
              } else if (k === "style") {
                if (typeof l[k] === "string") {
                  e.style.cssText = l[k];
                } else {
                  for (var s2 in l[k])
                    (function(s3, v2) {
                      if (typeof v2 === "function") {
                        e.style.setProperty(s3, v2());
                        cleanupFuncs.push(v2(function(val) {
                          e.style.setProperty(s3, val);
                        }));
                      } else
                        var match = l[k][s3].match(/(.*)\W+!important\W*$/);
                      if (match) {
                        e.style.setProperty(s3, match[1], "important");
                      } else {
                        e.style.setProperty(s3, l[k][s3]);
                      }
                    })(s2, l[k][s2]);
                }
              } else if (k === "attrs") {
                for (var v in l[k]) {
                  e.setAttribute(v, l[k][v]);
                }
              } else if (k.substr(0, 5) === "data-") {
                e.setAttribute(k, l[k]);
              } else {
                e[k] = l[k];
              }
            }
          } else if (typeof l === "function") {
            var v = l();
            e.appendChild(r = isNode(v) ? v : document.createTextNode(v));
            cleanupFuncs.push(l(function(v2) {
              if (isNode(v2) && r.parentElement)
                r.parentElement.replaceChild(v2, r), r = v2;
              else
                r.textContent = v2;
            }));
          }
          return r;
        }
        while (args.length)
          item(args.shift());
        return e;
      }
      h2.cleanup = function() {
        for (var i = 0; i < cleanupFuncs.length; i++) {
          cleanupFuncs[i]();
        }
        cleanupFuncs.length = 0;
      };
      return h2;
    }
    var h = module2.exports = context();
    h.context = context;
    function isNode(el) {
      return el && el.nodeName && el.nodeType;
    }
    function forEach(arr, fn) {
      if (arr.forEach)
        return arr.forEach(fn);
      for (var i = 0; i < arr.length; i++)
        fn(arr[i], i);
    }
    function isArray(arr) {
      return Object.prototype.toString.call(arr) == "[object Array]";
    }
  }
});

// node_modules/datocms-structured-text-to-dom-nodes/dist/cjs/index.js
var require_cjs3 = __commonJS({
  "node_modules/datocms-structured-text-to-dom-nodes/dist/cjs/index.js"(exports) {
    init_shims();
    "use strict";
    var __spreadArrays = exports && exports.__spreadArrays || function() {
      for (var s2 = 0, i = 0, il = arguments.length; i < il; i++)
        s2 += arguments[i].length;
      for (var r = Array(s2), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    var __importDefault = exports && exports.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.render = exports.defaultAdapter = exports.RenderError = exports.renderRule = void 0;
    var datocms_structured_text_generic_html_renderer_1 = require_cjs2();
    Object.defineProperty(exports, "renderRule", { enumerable: true, get: function() {
      return datocms_structured_text_generic_html_renderer_1.renderRule;
    } });
    var datocms_structured_text_utils_1 = require_cjs();
    Object.defineProperty(exports, "RenderError", { enumerable: true, get: function() {
      return datocms_structured_text_utils_1.RenderError;
    } });
    var hyperscript_1 = __importDefault(require_hyperscript());
    var hyperscriptAdapter = function(tagName, attrs) {
      var children = [];
      for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
      }
      if (attrs) {
        delete attrs.key;
      }
      return hyperscript_1.default.apply(void 0, __spreadArrays([tagName, attrs || void 0], children));
    };
    exports.defaultAdapter = {
      renderNode: hyperscriptAdapter,
      renderFragment: function(children) {
        return children;
      },
      renderText: function(text) {
        return text;
      }
    };
    function render2(structuredTextOrNode, settings) {
      var renderInlineRecord = settings === null || settings === void 0 ? void 0 : settings.renderInlineRecord;
      var renderLinkToRecord = settings === null || settings === void 0 ? void 0 : settings.renderLinkToRecord;
      var renderBlock = settings === null || settings === void 0 ? void 0 : settings.renderBlock;
      var customRules = (settings === null || settings === void 0 ? void 0 : settings.customRules) || [];
      var result = datocms_structured_text_generic_html_renderer_1.render({
        renderText: (settings === null || settings === void 0 ? void 0 : settings.renderText) || exports.defaultAdapter.renderText,
        renderNode: (settings === null || settings === void 0 ? void 0 : settings.renderNode) || exports.defaultAdapter.renderNode,
        renderFragment: (settings === null || settings === void 0 ? void 0 : settings.renderFragment) || exports.defaultAdapter.renderFragment
      }, structuredTextOrNode, __spreadArrays(customRules, [
        datocms_structured_text_generic_html_renderer_1.renderRule(datocms_structured_text_utils_1.isInlineItem, function(_a) {
          var node = _a.node, adapter = _a.adapter;
          if (!renderInlineRecord) {
            throw new datocms_structured_text_utils_1.RenderError("The Structured Text document contains an 'inlineItem' node, but no 'renderInlineRecord' option is specified!", node);
          }
          if (!datocms_structured_text_utils_1.isStructuredText(structuredTextOrNode) || !structuredTextOrNode.links) {
            throw new datocms_structured_text_utils_1.RenderError("The document contains an 'itemLink' node, but the passed value is not a Structured Text GraphQL response, or .links is not present!", node);
          }
          var item = structuredTextOrNode.links.find(function(item2) {
            return item2.id === node.item;
          });
          if (!item) {
            throw new datocms_structured_text_utils_1.RenderError("The Structured Text document contains an 'inlineItem' node, but cannot find a record with ID " + node.item + " inside .links!", node);
          }
          return renderInlineRecord({ record: item, adapter });
        }),
        datocms_structured_text_generic_html_renderer_1.renderRule(datocms_structured_text_utils_1.isItemLink, function(_a) {
          var node = _a.node, children = _a.children, adapter = _a.adapter;
          if (!renderLinkToRecord) {
            throw new datocms_structured_text_utils_1.RenderError("The Structured Text document contains an 'itemLink' node, but no 'renderLinkToRecord' option is specified!", node);
          }
          if (!datocms_structured_text_utils_1.isStructuredText(structuredTextOrNode) || !structuredTextOrNode.links) {
            throw new datocms_structured_text_utils_1.RenderError("The document contains an 'itemLink' node, but the passed value is not a Structured Text GraphQL response, or .links is not present!", node);
          }
          var item = structuredTextOrNode.links.find(function(item2) {
            return item2.id === node.item;
          });
          if (!item) {
            throw new datocms_structured_text_utils_1.RenderError("The Structured Text document contains an 'itemLink' node, but cannot find a record with ID " + node.item + " inside .links!", node);
          }
          return renderLinkToRecord({
            record: item,
            adapter,
            children,
            transformedMeta: node.meta ? ((settings === null || settings === void 0 ? void 0 : settings.metaTransformer) || datocms_structured_text_generic_html_renderer_1.defaultMetaTransformer)({
              node,
              meta: node.meta
            }) : null
          });
        }),
        datocms_structured_text_generic_html_renderer_1.renderRule(datocms_structured_text_utils_1.isBlock, function(_a) {
          var node = _a.node, adapter = _a.adapter;
          if (!renderBlock) {
            throw new datocms_structured_text_utils_1.RenderError("The Structured Text document contains a 'block' node, but no 'renderBlock' option is specified!", node);
          }
          if (!datocms_structured_text_utils_1.isStructuredText(structuredTextOrNode) || !structuredTextOrNode.blocks) {
            throw new datocms_structured_text_utils_1.RenderError("The document contains an 'block' node, but the passed value is not a Structured Text GraphQL response, or .blocks is not present!", node);
          }
          var item = structuredTextOrNode.blocks.find(function(item2) {
            return item2.id === node.item;
          });
          if (!item) {
            throw new datocms_structured_text_utils_1.RenderError("The Structured Text document contains a 'block' node, but cannot find a record with ID " + node.item + " inside .blocks!", node);
          }
          return renderBlock({ record: item, adapter });
        })
      ]), settings === null || settings === void 0 ? void 0 : settings.metaTransformer);
      return result;
    }
    exports.render = render2;
  }
});

// .svelte-kit/netlify/entry.js
__export(exports, {
  handler: () => handler
});
init_shims();

// .svelte-kit/output/server/app.js
init_shims();
var import_cookie = __toModule(require_cookie());

// node_modules/@lukeed/uuid/dist/index.mjs
init_shims();
var IDX = 256;
var HEX = [];
var BUFFER;
while (IDX--)
  HEX[IDX] = (IDX + 256).toString(16).substring(1);
function v4() {
  var i = 0, num, out = "";
  if (!BUFFER || IDX + 16 > 256) {
    BUFFER = Array(i = 256);
    while (i--)
      BUFFER[i] = 256 * Math.random() | 0;
    i = IDX = 0;
  }
  for (; i < 16; i++) {
    num = BUFFER[IDX + i];
    if (i == 6)
      out += HEX[num & 15 | 64];
    else if (i == 8)
      out += HEX[num & 63 | 128];
    else
      out += HEX[num];
    if (i & 1 && i > 1 && i < 11)
      out += "-";
  }
  IDX++;
  return out;
}

// .svelte-kit/output/server/app.js
var import_datocms_structured_text_to_dom_nodes = __toModule(require_cjs3());
var import_datocms_structured_text_utils = __toModule(require_cjs());
var __require2 = typeof require !== "undefined" ? require : (x) => {
  throw new Error('Dynamic require of "' + x + '" is not supported');
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var _map;
function get_single_valued_header(headers, key) {
  const value = headers[key];
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return void 0;
    }
    if (value.length > 1) {
      throw new Error(`Multiple headers provided for ${key}. Multiple may be provided only for set-cookie`);
    }
    return value[0];
  }
  return value;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
function lowercase_keys(obj) {
  const clone2 = {};
  for (const key in obj) {
    clone2[key.toLowerCase()] = obj[key];
  }
  return clone2;
}
function error(body) {
  return {
    status: 500,
    body,
    headers: {}
  };
}
function is_string(s2) {
  return typeof s2 === "string" || s2 instanceof String;
}
function is_content_type_textual(content_type) {
  if (!content_type)
    return true;
  const [type] = content_type.split(";");
  return type === "text/plain" || type === "application/json" || type === "application/x-www-form-urlencoded" || type === "multipart/form-data";
}
async function render_endpoint(request, route, match) {
  const mod = await route.load();
  const handler2 = mod[request.method.toLowerCase().replace("delete", "del")];
  if (!handler2) {
    return;
  }
  const params = route.params(match);
  const response = await handler2({ ...request, params });
  const preface = `Invalid response from route ${request.path}`;
  if (!response) {
    return;
  }
  if (typeof response !== "object") {
    return error(`${preface}: expected an object, got ${typeof response}`);
  }
  let { status = 200, body, headers = {} } = response;
  headers = lowercase_keys(headers);
  const type = get_single_valued_header(headers, "content-type");
  const is_type_textual = is_content_type_textual(type);
  if (!is_type_textual && !(body instanceof Uint8Array || is_string(body))) {
    return error(`${preface}: body must be an instance of string or Uint8Array if content-type is not a supported textual content-type`);
  }
  let normalized_body;
  if ((typeof body === "object" || typeof body === "undefined") && !(body instanceof Uint8Array) && (!type || type.startsWith("application/json"))) {
    headers = { ...headers, "content-type": "application/json; charset=utf-8" };
    normalized_body = JSON.stringify(typeof body === "undefined" ? {} : body);
  } else {
    normalized_body = body;
  }
  return { status, body: normalized_body, headers };
}
var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function devalue(value) {
  var counts = new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new Error("Cannot stringify a function");
    }
    if (counts.has(thing)) {
      counts.set(thing, counts.get(thing) + 1);
      return;
    }
    counts.set(thing, 1);
    if (!isPrimitive(thing)) {
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach(walk);
          break;
        case "Set":
        case "Map":
          Array.from(thing).forEach(walk);
          break;
        default:
          var proto = Object.getPrototypeOf(thing);
          if (proto !== Object.prototype && proto !== null && Object.getOwnPropertyNames(proto).sort().join("\0") !== objectProtoOwnPropertyNames) {
            throw new Error("Cannot stringify arbitrary non-POJOs");
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new Error("Cannot stringify POJOs with symbolic keys");
          }
          Object.keys(thing).forEach(function(key) {
            return walk(thing[key]);
          });
      }
    }
  }
  walk(value);
  var names = new Map();
  Array.from(counts).filter(function(entry) {
    return entry[1] > 1;
  }).sort(function(a, b) {
    return b[1] - a[1];
  }).forEach(function(entry, i) {
    names.set(entry[0], getName(i));
  });
  function stringify(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (isPrimitive(thing)) {
      return stringifyPrimitive(thing);
    }
    var type = getType(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return "Object(" + stringify(thing.valueOf()) + ")";
      case "RegExp":
        return "new RegExp(" + stringifyString(thing.source) + ', "' + thing.flags + '")';
      case "Date":
        return "new Date(" + thing.getTime() + ")";
      case "Array":
        var members = thing.map(function(v, i) {
          return i in thing ? stringify(v) : "";
        });
        var tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return "[" + members.join(",") + tail + "]";
      case "Set":
      case "Map":
        return "new " + type + "([" + Array.from(thing).map(stringify).join(",") + "])";
      default:
        var obj = "{" + Object.keys(thing).map(function(key) {
          return safeKey(key) + ":" + stringify(thing[key]);
        }).join(",") + "}";
        var proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? "Object.assign(Object.create(null)," + obj + ")" : "Object.create(null)";
        }
        return obj;
    }
  }
  var str = stringify(value);
  if (names.size) {
    var params_1 = [];
    var statements_1 = [];
    var values_1 = [];
    names.forEach(function(name, thing) {
      params_1.push(name);
      if (isPrimitive(thing)) {
        values_1.push(stringifyPrimitive(thing));
        return;
      }
      var type = getType(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values_1.push("Object(" + stringify(thing.valueOf()) + ")");
          break;
        case "RegExp":
          values_1.push(thing.toString());
          break;
        case "Date":
          values_1.push("new Date(" + thing.getTime() + ")");
          break;
        case "Array":
          values_1.push("Array(" + thing.length + ")");
          thing.forEach(function(v, i) {
            statements_1.push(name + "[" + i + "]=" + stringify(v));
          });
          break;
        case "Set":
          values_1.push("new Set");
          statements_1.push(name + "." + Array.from(thing).map(function(v) {
            return "add(" + stringify(v) + ")";
          }).join("."));
          break;
        case "Map":
          values_1.push("new Map");
          statements_1.push(name + "." + Array.from(thing).map(function(_a) {
            var k = _a[0], v = _a[1];
            return "set(" + stringify(k) + ", " + stringify(v) + ")";
          }).join("."));
          break;
        default:
          values_1.push(Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}");
          Object.keys(thing).forEach(function(key) {
            statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
          });
      }
    });
    statements_1.push("return " + str);
    return "(function(" + params_1.join(",") + "){" + statements_1.join(";") + "}(" + values_1.join(",") + "))";
  } else {
    return str;
  }
}
function getName(num) {
  var name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
  return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
  if (typeof thing === "string")
    return stringifyString(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  var str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  return str;
}
function getType(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
  return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
  return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
  var result = '"';
  for (var i = 0; i < str.length; i += 1) {
    var char = str.charAt(i);
    var code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$1) {
      result += escaped$1[char];
    } else if (code >= 55296 && code <= 57343) {
      var next = str.charCodeAt(i + 1);
      if (code <= 56319 && (next >= 56320 && next <= 57343)) {
        result += char + str[++i];
      } else {
        result += "\\u" + code.toString(16).toUpperCase();
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
function noop$1() {
}
function safe_not_equal(a, b) {
  return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
}
Promise.resolve();
var subscriber_queue = [];
function writable(value, start = noop$1) {
  let stop;
  const subscribers = new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop$1) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set) || noop$1;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
function hash(value) {
  let hash2 = 5381;
  let i = value.length;
  if (typeof value === "string") {
    while (i)
      hash2 = hash2 * 33 ^ value.charCodeAt(--i);
  } else {
    while (i)
      hash2 = hash2 * 33 ^ value[--i];
  }
  return (hash2 >>> 0).toString(36);
}
var s$1 = JSON.stringify;
async function render_response({
  branch,
  options: options2,
  $session,
  page_config,
  status,
  error: error2,
  page: page2
}) {
  const css2 = new Set(options2.entry.css);
  const js = new Set(options2.entry.js);
  const styles = new Set();
  const serialized_data = [];
  let rendered;
  let is_private = false;
  let maxage;
  if (error2) {
    error2.stack = options2.get_stack(error2);
  }
  if (page_config.ssr) {
    branch.forEach(({ node, loaded, fetched, uses_credentials }) => {
      if (node.css)
        node.css.forEach((url) => css2.add(url));
      if (node.js)
        node.js.forEach((url) => js.add(url));
      if (node.styles)
        node.styles.forEach((content) => styles.add(content));
      if (fetched && page_config.hydrate)
        serialized_data.push(...fetched);
      if (uses_credentials)
        is_private = true;
      maxage = loaded.maxage;
    });
    const session = writable($session);
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        session
      },
      page: page2,
      components: branch.map(({ node }) => node.module.default)
    };
    for (let i = 0; i < branch.length; i += 1) {
      props[`props_${i}`] = await branch[i].loaded.props;
    }
    let session_tracking_active = false;
    const unsubscribe = session.subscribe(() => {
      if (session_tracking_active)
        is_private = true;
    });
    session_tracking_active = true;
    try {
      rendered = options2.root.render(props);
    } finally {
      unsubscribe();
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  const include_js = page_config.router || page_config.hydrate;
  if (!include_js)
    js.clear();
  const links = options2.amp ? styles.size > 0 || rendered.css.code.length > 0 ? `<style amp-custom>${Array.from(styles).concat(rendered.css.code).join("\n")}</style>` : "" : [
    ...Array.from(js).map((dep) => `<link rel="modulepreload" href="${dep}">`),
    ...Array.from(css2).map((dep) => `<link rel="stylesheet" href="${dep}">`)
  ].join("\n		");
  let init2 = "";
  if (options2.amp) {
    init2 = `
		<style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
		<noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>
		<script async src="https://cdn.ampproject.org/v0.js"><\/script>`;
  } else if (include_js) {
    init2 = `<script type="module">
			import { start } from ${s$1(options2.entry.file)};
			start({
				target: ${options2.target ? `document.querySelector(${s$1(options2.target)})` : "document.body"},
				paths: ${s$1(options2.paths)},
				session: ${try_serialize($session, (error3) => {
      throw new Error(`Failed to serialize session data: ${error3.message}`);
    })},
				host: ${page2 && page2.host ? s$1(page2.host) : "location.host"},
				route: ${!!page_config.router},
				spa: ${!page_config.ssr},
				trailing_slash: ${s$1(options2.trailing_slash)},
				hydrate: ${page_config.ssr && page_config.hydrate ? `{
					status: ${status},
					error: ${serialize_error(error2)},
					nodes: [
						${(branch || []).map(({ node }) => `import(${s$1(node.entry)})`).join(",\n						")}
					],
					page: {
						host: ${page2 && page2.host ? s$1(page2.host) : "location.host"}, // TODO this is redundant
						path: ${s$1(page2 && page2.path)},
						query: new URLSearchParams(${page2 ? s$1(page2.query.toString()) : ""}),
						params: ${page2 && s$1(page2.params)}
					}
				}` : "null"}
			});
		<\/script>`;
  }
  if (options2.service_worker) {
    init2 += `<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('${options2.service_worker}');
			}
		<\/script>`;
  }
  const head = [
    rendered.head,
    styles.size && !options2.amp ? `<style data-svelte>${Array.from(styles).join("\n")}</style>` : "",
    links,
    init2
  ].join("\n\n		");
  const body = options2.amp ? rendered.html : `${rendered.html}

			${serialized_data.map(({ url, body: body2, json }) => {
    let attributes = `type="application/json" data-type="svelte-data" data-url="${url}"`;
    if (body2)
      attributes += ` data-body="${hash(body2)}"`;
    return `<script ${attributes}>${json}<\/script>`;
  }).join("\n\n	")}
		`;
  const headers = {
    "content-type": "text/html"
  };
  if (maxage) {
    headers["cache-control"] = `${is_private ? "private" : "public"}, max-age=${maxage}`;
  }
  if (!options2.floc) {
    headers["permissions-policy"] = "interest-cohort=()";
  }
  return {
    status,
    headers,
    body: options2.template({ head, body })
  };
}
function try_serialize(data, fail) {
  try {
    return devalue(data);
  } catch (err) {
    if (fail)
      fail(coalesce_to_error(err));
    return null;
  }
}
function serialize_error(error2) {
  if (!error2)
    return null;
  let serialized = try_serialize(error2);
  if (!serialized) {
    const { name, message, stack } = error2;
    serialized = try_serialize({ ...error2, name, message, stack });
  }
  if (!serialized) {
    serialized = "{}";
  }
  return serialized;
}
function normalize(loaded) {
  const has_error_status = loaded.status && loaded.status >= 400 && loaded.status <= 599 && !loaded.redirect;
  if (loaded.error || has_error_status) {
    const status = loaded.status;
    if (!loaded.error && has_error_status) {
      return {
        status: status || 500,
        error: new Error()
      };
    }
    const error2 = typeof loaded.error === "string" ? new Error(loaded.error) : loaded.error;
    if (!(error2 instanceof Error)) {
      return {
        status: 500,
        error: new Error(`"error" property returned from load() must be a string or instance of Error, received type "${typeof error2}"`)
      };
    }
    if (!status || status < 400 || status > 599) {
      console.warn('"error" returned from load() without a valid status code \u2014 defaulting to 500');
      return { status: 500, error: error2 };
    }
    return { status, error: error2 };
  }
  if (loaded.redirect) {
    if (!loaded.status || Math.floor(loaded.status / 100) !== 3) {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be accompanied by a 3xx status code')
      };
    }
    if (typeof loaded.redirect !== "string") {
      return {
        status: 500,
        error: new Error('"redirect" property returned from load() must be a string')
      };
    }
  }
  return loaded;
}
var s = JSON.stringify;
async function load_node({
  request,
  options: options2,
  state,
  route,
  page: page2,
  node,
  $session,
  context,
  prerender_enabled,
  is_leaf,
  is_error,
  status,
  error: error2
}) {
  const { module: module2 } = node;
  let uses_credentials = false;
  const fetched = [];
  let set_cookie_headers = [];
  let loaded;
  const page_proxy = new Proxy(page2, {
    get: (target, prop, receiver) => {
      if (prop === "query" && prerender_enabled) {
        throw new Error("Cannot access query on a page with prerendering enabled");
      }
      return Reflect.get(target, prop, receiver);
    }
  });
  if (module2.load) {
    const load_input = {
      page: page_proxy,
      get session() {
        uses_credentials = true;
        return $session;
      },
      fetch: async (resource, opts = {}) => {
        let url;
        if (typeof resource === "string") {
          url = resource;
        } else {
          url = resource.url;
          opts = {
            method: resource.method,
            headers: resource.headers,
            body: resource.body,
            mode: resource.mode,
            credentials: resource.credentials,
            cache: resource.cache,
            redirect: resource.redirect,
            referrer: resource.referrer,
            integrity: resource.integrity,
            ...opts
          };
        }
        const resolved = resolve(request.path, url.split("?")[0]);
        let response;
        const filename = resolved.replace(options2.paths.assets, "").slice(1);
        const filename_html = `${filename}/index.html`;
        const asset = options2.manifest.assets.find((d2) => d2.file === filename || d2.file === filename_html);
        if (asset) {
          response = options2.read ? new Response(options2.read(asset.file), {
            headers: asset.type ? { "content-type": asset.type } : {}
          }) : await fetch(`http://${page2.host}/${asset.file}`, opts);
        } else if (resolved.startsWith("/") && !resolved.startsWith("//")) {
          const relative = resolved;
          const headers = {
            ...opts.headers
          };
          if (opts.credentials !== "omit") {
            uses_credentials = true;
            headers.cookie = request.headers.cookie;
            if (!headers.authorization) {
              headers.authorization = request.headers.authorization;
            }
          }
          if (opts.body && typeof opts.body !== "string") {
            throw new Error("Request body must be a string");
          }
          const search = url.includes("?") ? url.slice(url.indexOf("?") + 1) : "";
          const rendered = await respond({
            host: request.host,
            method: opts.method || "GET",
            headers,
            path: relative,
            rawBody: opts.body == null ? null : new TextEncoder().encode(opts.body),
            query: new URLSearchParams(search)
          }, options2, {
            fetched: url,
            initiator: route
          });
          if (rendered) {
            if (state.prerender) {
              state.prerender.dependencies.set(relative, rendered);
            }
            response = new Response(rendered.body, {
              status: rendered.status,
              headers: rendered.headers
            });
          }
        } else {
          if (resolved.startsWith("//")) {
            throw new Error(`Cannot request protocol-relative URL (${url}) in server-side fetch`);
          }
          if (typeof request.host !== "undefined") {
            const { hostname: fetch_hostname } = new URL(url);
            const [server_hostname] = request.host.split(":");
            if (`.${fetch_hostname}`.endsWith(`.${server_hostname}`) && opts.credentials !== "omit") {
              uses_credentials = true;
              opts.headers = {
                ...opts.headers,
                cookie: request.headers.cookie
              };
            }
          }
          const external_request = new Request(url, opts);
          response = await options2.hooks.externalFetch.call(null, external_request);
        }
        if (response) {
          const proxy = new Proxy(response, {
            get(response2, key, receiver) {
              async function text() {
                const body = await response2.text();
                const headers = {};
                for (const [key2, value] of response2.headers) {
                  if (key2 === "set-cookie") {
                    set_cookie_headers = set_cookie_headers.concat(value);
                  } else if (key2 !== "etag") {
                    headers[key2] = value;
                  }
                }
                if (!opts.body || typeof opts.body === "string") {
                  fetched.push({
                    url,
                    body: opts.body,
                    json: `{"status":${response2.status},"statusText":${s(response2.statusText)},"headers":${s(headers)},"body":${escape$1(body)}}`
                  });
                }
                return body;
              }
              if (key === "text") {
                return text;
              }
              if (key === "json") {
                return async () => {
                  return JSON.parse(await text());
                };
              }
              return Reflect.get(response2, key, response2);
            }
          });
          return proxy;
        }
        return response || new Response("Not found", {
          status: 404
        });
      },
      context: { ...context }
    };
    if (is_error) {
      load_input.status = status;
      load_input.error = error2;
    }
    loaded = await module2.load.call(null, load_input);
  } else {
    loaded = {};
  }
  if (!loaded && is_leaf && !is_error)
    return;
  if (!loaded) {
    throw new Error(`${node.entry} - load must return a value except for page fall through`);
  }
  return {
    node,
    loaded: normalize(loaded),
    context: loaded.context || context,
    fetched,
    set_cookie_headers,
    uses_credentials
  };
}
var escaped$2 = {
  "<": "\\u003C",
  ">": "\\u003E",
  "/": "\\u002F",
  "\\": "\\\\",
  "\b": "\\b",
  "\f": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "	": "\\t",
  "\0": "\\0",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
function escape$1(str) {
  let result = '"';
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charAt(i);
    const code = char.charCodeAt(0);
    if (char === '"') {
      result += '\\"';
    } else if (char in escaped$2) {
      result += escaped$2[char];
    } else if (code >= 55296 && code <= 57343) {
      const next = str.charCodeAt(i + 1);
      if (code <= 56319 && next >= 56320 && next <= 57343) {
        result += char + str[++i];
      } else {
        result += `\\u${code.toString(16).toUpperCase()}`;
      }
    } else {
      result += char;
    }
  }
  result += '"';
  return result;
}
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
async function respond_with_error({ request, options: options2, state, $session, status, error: error2 }) {
  const default_layout = await options2.load_component(options2.manifest.layout);
  const default_error = await options2.load_component(options2.manifest.error);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params: {}
  };
  const loaded = await load_node({
    request,
    options: options2,
    state,
    route: null,
    page: page2,
    node: default_layout,
    $session,
    context: {},
    prerender_enabled: is_prerender_enabled(options2, default_error, state),
    is_leaf: false,
    is_error: false
  });
  const branch = [
    loaded,
    await load_node({
      request,
      options: options2,
      state,
      route: null,
      page: page2,
      node: default_error,
      $session,
      context: loaded ? loaded.context : {},
      prerender_enabled: is_prerender_enabled(options2, default_error, state),
      is_leaf: false,
      is_error: true,
      status,
      error: error2
    })
  ];
  try {
    return await render_response({
      options: options2,
      $session,
      page_config: {
        hydrate: options2.hydrate,
        router: options2.router,
        ssr: options2.ssr
      },
      status,
      error: error2,
      branch,
      page: page2
    });
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return {
      status: 500,
      headers: {},
      body: error3.stack
    };
  }
}
function is_prerender_enabled(options2, node, state) {
  return options2.prerender && (!!node.module.prerender || !!state.prerender && state.prerender.all);
}
async function respond$1(opts) {
  const { request, options: options2, state, $session, route } = opts;
  let nodes;
  try {
    nodes = await Promise.all(route.a.map((id) => id ? options2.load_component(id) : void 0));
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return await respond_with_error({
      request,
      options: options2,
      state,
      $session,
      status: 500,
      error: error3
    });
  }
  const leaf = nodes[nodes.length - 1].module;
  let page_config = get_page_config(leaf, options2);
  if (!leaf.prerender && state.prerender && !state.prerender.all) {
    return {
      status: 204,
      headers: {},
      body: ""
    };
  }
  let branch = [];
  let status = 200;
  let error2;
  let set_cookie_headers = [];
  ssr:
    if (page_config.ssr) {
      let context = {};
      for (let i = 0; i < nodes.length; i += 1) {
        const node = nodes[i];
        let loaded;
        if (node) {
          try {
            loaded = await load_node({
              ...opts,
              node,
              context,
              prerender_enabled: is_prerender_enabled(options2, node, state),
              is_leaf: i === nodes.length - 1,
              is_error: false
            });
            if (!loaded)
              return;
            set_cookie_headers = set_cookie_headers.concat(loaded.set_cookie_headers);
            if (loaded.loaded.redirect) {
              return with_cookies({
                status: loaded.loaded.status,
                headers: {
                  location: encodeURI(loaded.loaded.redirect)
                }
              }, set_cookie_headers);
            }
            if (loaded.loaded.error) {
              ({ status, error: error2 } = loaded.loaded);
            }
          } catch (err) {
            const e = coalesce_to_error(err);
            options2.handle_error(e, request);
            status = 500;
            error2 = e;
          }
          if (loaded && !error2) {
            branch.push(loaded);
          }
          if (error2) {
            while (i--) {
              if (route.b[i]) {
                const error_node = await options2.load_component(route.b[i]);
                let node_loaded;
                let j = i;
                while (!(node_loaded = branch[j])) {
                  j -= 1;
                }
                try {
                  const error_loaded = await load_node({
                    ...opts,
                    node: error_node,
                    context: node_loaded.context,
                    prerender_enabled: is_prerender_enabled(options2, error_node, state),
                    is_leaf: false,
                    is_error: true,
                    status,
                    error: error2
                  });
                  if (error_loaded.loaded.error) {
                    continue;
                  }
                  page_config = get_page_config(error_node.module, options2);
                  branch = branch.slice(0, j + 1).concat(error_loaded);
                  break ssr;
                } catch (err) {
                  const e = coalesce_to_error(err);
                  options2.handle_error(e, request);
                  continue;
                }
              }
            }
            return with_cookies(await respond_with_error({
              request,
              options: options2,
              state,
              $session,
              status,
              error: error2
            }), set_cookie_headers);
          }
        }
        if (loaded && loaded.loaded.context) {
          context = {
            ...context,
            ...loaded.loaded.context
          };
        }
      }
    }
  try {
    return with_cookies(await render_response({
      ...opts,
      page_config,
      status,
      error: error2,
      branch: branch.filter(Boolean)
    }), set_cookie_headers);
  } catch (err) {
    const error3 = coalesce_to_error(err);
    options2.handle_error(error3, request);
    return with_cookies(await respond_with_error({
      ...opts,
      status: 500,
      error: error3
    }), set_cookie_headers);
  }
}
function get_page_config(leaf, options2) {
  return {
    ssr: "ssr" in leaf ? !!leaf.ssr : options2.ssr,
    router: "router" in leaf ? !!leaf.router : options2.router,
    hydrate: "hydrate" in leaf ? !!leaf.hydrate : options2.hydrate
  };
}
function with_cookies(response, set_cookie_headers) {
  if (set_cookie_headers.length) {
    response.headers["set-cookie"] = set_cookie_headers;
  }
  return response;
}
async function render_page(request, route, match, options2, state) {
  if (state.initiator === route) {
    return {
      status: 404,
      headers: {},
      body: `Not found: ${request.path}`
    };
  }
  const params = route.params(match);
  const page2 = {
    host: request.host,
    path: request.path,
    query: request.query,
    params
  };
  const $session = await options2.hooks.getSession(request);
  const response = await respond$1({
    request,
    options: options2,
    state,
    $session,
    route,
    page: page2
  });
  if (response) {
    return response;
  }
  if (state.fetched) {
    return {
      status: 500,
      headers: {},
      body: `Bad request in load function: failed to fetch ${state.fetched}`
    };
  }
}
function read_only_form_data() {
  const map = new Map();
  return {
    append(key, value) {
      if (map.has(key)) {
        (map.get(key) || []).push(value);
      } else {
        map.set(key, [value]);
      }
    },
    data: new ReadOnlyFormData(map)
  };
}
var ReadOnlyFormData = class {
  constructor(map) {
    __privateAdd(this, _map, void 0);
    __privateSet(this, _map, map);
  }
  get(key) {
    const value = __privateGet(this, _map).get(key);
    return value && value[0];
  }
  getAll(key) {
    return __privateGet(this, _map).get(key);
  }
  has(key) {
    return __privateGet(this, _map).has(key);
  }
  *[Symbol.iterator]() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *entries() {
    for (const [key, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield [key, value[i]];
      }
    }
  }
  *keys() {
    for (const [key] of __privateGet(this, _map))
      yield key;
  }
  *values() {
    for (const [, value] of __privateGet(this, _map)) {
      for (let i = 0; i < value.length; i += 1) {
        yield value[i];
      }
    }
  }
};
_map = new WeakMap();
function parse_body(raw, headers) {
  if (!raw)
    return raw;
  const content_type = headers["content-type"];
  const [type, ...directives] = content_type ? content_type.split(/;\s*/) : [];
  const text = () => new TextDecoder(headers["content-encoding"] || "utf-8").decode(raw);
  switch (type) {
    case "text/plain":
      return text();
    case "application/json":
      return JSON.parse(text());
    case "application/x-www-form-urlencoded":
      return get_urlencoded(text());
    case "multipart/form-data": {
      const boundary = directives.find((directive) => directive.startsWith("boundary="));
      if (!boundary)
        throw new Error("Missing boundary");
      return get_multipart(text(), boundary.slice("boundary=".length));
    }
    default:
      return raw;
  }
}
function get_urlencoded(text) {
  const { data, append } = read_only_form_data();
  text.replace(/\+/g, " ").split("&").forEach((str) => {
    const [key, value] = str.split("=");
    append(decodeURIComponent(key), decodeURIComponent(value));
  });
  return data;
}
function get_multipart(text, boundary) {
  const parts = text.split(`--${boundary}`);
  if (parts[0] !== "" || parts[parts.length - 1].trim() !== "--") {
    throw new Error("Malformed form data");
  }
  const { data, append } = read_only_form_data();
  parts.slice(1, -1).forEach((part) => {
    const match = /\s*([\s\S]+?)\r\n\r\n([\s\S]*)\s*/.exec(part);
    if (!match) {
      throw new Error("Malformed form data");
    }
    const raw_headers = match[1];
    const body = match[2].trim();
    let key;
    const headers = {};
    raw_headers.split("\r\n").forEach((str) => {
      const [raw_header, ...raw_directives] = str.split("; ");
      let [name, value] = raw_header.split(": ");
      name = name.toLowerCase();
      headers[name] = value;
      const directives = {};
      raw_directives.forEach((raw_directive) => {
        const [name2, value2] = raw_directive.split("=");
        directives[name2] = JSON.parse(value2);
      });
      if (name === "content-disposition") {
        if (value !== "form-data")
          throw new Error("Malformed form data");
        if (directives.filename) {
          throw new Error("File upload is not yet implemented");
        }
        if (directives.name) {
          key = directives.name;
        }
      }
    });
    if (!key)
      throw new Error("Malformed form data");
    append(key, body);
  });
  return data;
}
async function respond(incoming, options2, state = {}) {
  if (incoming.path !== "/" && options2.trailing_slash !== "ignore") {
    const has_trailing_slash = incoming.path.endsWith("/");
    if (has_trailing_slash && options2.trailing_slash === "never" || !has_trailing_slash && options2.trailing_slash === "always" && !(incoming.path.split("/").pop() || "").includes(".")) {
      const path = has_trailing_slash ? incoming.path.slice(0, -1) : incoming.path + "/";
      const q = incoming.query.toString();
      return {
        status: 301,
        headers: {
          location: options2.paths.base + path + (q ? `?${q}` : "")
        }
      };
    }
  }
  const headers = lowercase_keys(incoming.headers);
  const request = {
    ...incoming,
    headers,
    body: parse_body(incoming.rawBody, headers),
    params: {},
    locals: {}
  };
  try {
    return await options2.hooks.handle({
      request,
      resolve: async (request2) => {
        if (state.prerender && state.prerender.fallback) {
          return await render_response({
            options: options2,
            $session: await options2.hooks.getSession(request2),
            page_config: { ssr: false, router: true, hydrate: true },
            status: 200,
            branch: []
          });
        }
        const decoded = decodeURI(request2.path);
        for (const route of options2.manifest.routes) {
          const match = route.pattern.exec(decoded);
          if (!match)
            continue;
          const response = route.type === "endpoint" ? await render_endpoint(request2, route, match) : await render_page(request2, route, match, options2, state);
          if (response) {
            if (response.status === 200) {
              const cache_control = get_single_valued_header(response.headers, "cache-control");
              if (!cache_control || !/(no-store|immutable)/.test(cache_control)) {
                const etag = `"${hash(response.body || "")}"`;
                if (request2.headers["if-none-match"] === etag) {
                  return {
                    status: 304,
                    headers: {},
                    body: ""
                  };
                }
                response.headers["etag"] = etag;
              }
            }
            return response;
          }
        }
        const $session = await options2.hooks.getSession(request2);
        return await respond_with_error({
          request: request2,
          options: options2,
          state,
          $session,
          status: 404,
          error: new Error(`Not found: ${request2.path}`)
        });
      }
    });
  } catch (err) {
    const e = coalesce_to_error(err);
    options2.handle_error(e, request);
    return {
      status: 500,
      headers: {},
      body: options2.dev ? e.stack : e.message
    };
  }
}
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
var current_component;
function set_current_component(component) {
  current_component = component;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function setContext(key, context) {
  get_current_component().$$.context.set(key, context);
}
function getContext(key) {
  return get_current_component().$$.context.get(key);
}
Promise.resolve();
var escaped = {
  '"': "&quot;",
  "'": "&#39;",
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;"
};
function escape(html) {
  return String(html).replace(/["'&<>]/g, (match) => escaped[match]);
}
function each(items, fn) {
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
var missing_component = {
  $$render: () => ""
};
function validate_component(component, name) {
  if (!component || !component.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
  }
  return component;
}
var on_destroy;
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(parent_component ? parent_component.$$.context : context || []),
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css2) => css2.code).join("\n"),
          map: null
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  return ` ${name}${value === true ? "" : `=${typeof value === "string" ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}
function add_classes(classes) {
  return classes ? ` class="${classes}"` : "";
}
function afterUpdate() {
}
var css = {
  code: "#svelte-announcer.svelte-1j55zn5{position:absolute;left:0;top:0;clip:rect(0 0 0 0);clip-path:inset(50%);overflow:hidden;white-space:nowrap;width:1px;height:1px}",
  map: `{"version":3,"file":"root.svelte","sources":["root.svelte"],"sourcesContent":["<!-- This file is generated by @sveltejs/kit \u2014 do not edit it! -->\\n<script>\\n\\timport { setContext, afterUpdate, onMount } from 'svelte';\\n\\n\\t// stores\\n\\texport let stores;\\n\\texport let page;\\n\\n\\texport let components;\\n\\texport let props_0 = null;\\n\\texport let props_1 = null;\\n\\texport let props_2 = null;\\n\\n\\tsetContext('__svelte__', stores);\\n\\n\\t$: stores.page.set(page);\\n\\tafterUpdate(stores.page.notify);\\n\\n\\tlet mounted = false;\\n\\tlet navigated = false;\\n\\tlet title = null;\\n\\n\\tonMount(() => {\\n\\t\\tconst unsubscribe = stores.page.subscribe(() => {\\n\\t\\t\\tif (mounted) {\\n\\t\\t\\t\\tnavigated = true;\\n\\t\\t\\t\\ttitle = document.title || 'untitled page';\\n\\t\\t\\t}\\n\\t\\t});\\n\\n\\t\\tmounted = true;\\n\\t\\treturn unsubscribe;\\n\\t});\\n<\/script>\\n\\n<svelte:component this={components[0]} {...(props_0 || {})}>\\n\\t{#if components[1]}\\n\\t\\t<svelte:component this={components[1]} {...(props_1 || {})}>\\n\\t\\t\\t{#if components[2]}\\n\\t\\t\\t\\t<svelte:component this={components[2]} {...(props_2 || {})}/>\\n\\t\\t\\t{/if}\\n\\t\\t</svelte:component>\\n\\t{/if}\\n</svelte:component>\\n\\n{#if mounted}\\n\\t<div id=\\"svelte-announcer\\" aria-live=\\"assertive\\" aria-atomic=\\"true\\">\\n\\t\\t{#if navigated}\\n\\t\\t\\t{title}\\n\\t\\t{/if}\\n\\t</div>\\n{/if}\\n\\n<style>\\n\\t#svelte-announcer {\\n\\t\\tposition: absolute;\\n\\t\\tleft: 0;\\n\\t\\ttop: 0;\\n\\t\\tclip: rect(0 0 0 0);\\n\\t\\tclip-path: inset(50%);\\n\\t\\toverflow: hidden;\\n\\t\\twhite-space: nowrap;\\n\\t\\twidth: 1px;\\n\\t\\theight: 1px;\\n\\t}\\n</style>"],"names":[],"mappings":"AAsDC,iBAAiB,eAAC,CAAC,AAClB,QAAQ,CAAE,QAAQ,CAClB,IAAI,CAAE,CAAC,CACP,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CACnB,SAAS,CAAE,MAAM,GAAG,CAAC,CACrB,QAAQ,CAAE,MAAM,CAChB,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,GAAG,CACV,MAAM,CAAE,GAAG,AACZ,CAAC"}`
};
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { components } = $$props;
  let { props_0 = null } = $$props;
  let { props_1 = null } = $$props;
  let { props_2 = null } = $$props;
  setContext("__svelte__", stores);
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.props_0 === void 0 && $$bindings.props_0 && props_0 !== void 0)
    $$bindings.props_0(props_0);
  if ($$props.props_1 === void 0 && $$bindings.props_1 && props_1 !== void 0)
    $$bindings.props_1(props_1);
  if ($$props.props_2 === void 0 && $$bindings.props_2 && props_2 !== void 0)
    $$bindings.props_2(props_2);
  $$result.css.add(css);
  {
    stores.page.set(page2);
  }
  return `


${validate_component(components[0] || missing_component, "svelte:component").$$render($$result, Object.assign(props_0 || {}), {}, {
    default: () => `${components[1] ? `${validate_component(components[1] || missing_component, "svelte:component").$$render($$result, Object.assign(props_1 || {}), {}, {
      default: () => `${components[2] ? `${validate_component(components[2] || missing_component, "svelte:component").$$render($$result, Object.assign(props_2 || {}), {}, {})}` : ``}`
    })}` : ``}`
  })}

${``}`;
});
var base = "";
var assets = "";
function set_paths(paths) {
  base = paths.base;
  assets = paths.assets || base;
}
function set_prerendering(value) {
}
var handle = async ({ request, resolve: resolve2 }) => {
  const cookies = import_cookie.default.parse(request.headers.cookie || "");
  request.locals.userid = cookies.userid || v4();
  if (request.query.has("_method")) {
    request.method = request.query.get("_method").toUpperCase();
  }
  const response = await resolve2(request);
  if (!cookies.userid) {
    response.headers["set-cookie"] = import_cookie.default.serialize("userid", request.locals.userid, {
      path: "/",
      httpOnly: true
    });
  }
  return response;
};
var user_hooks = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  handle
});
var template = ({ head, body }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<meta name="viewport" content="width=device-width, initial-scale=1" />\n\n		<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n		<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n		<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n		<link rel="manifest" href="/site.webmanifest">\n		<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#142ef2">\n		<meta name="msapplication-TileColor" content="#da532c">\n		<meta name="theme-color" content="#142ef2">\n\n		<link rel="preload" href="/fonts/geomanist-bold-webfont.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />\n		<link rel="preload" href="/fonts/geomanist-regular-webfont.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />\n\n		' + head + '\n	</head>\n	<body>\n		<div id="svelte">' + body + "</div>\n	</body>\n</html>\n";
var options = null;
var default_settings = { paths: { "base": "", "assets": "" } };
function init(settings = default_settings) {
  set_paths(settings.paths);
  set_prerendering(settings.prerendering || false);
  const hooks = get_hooks(user_hooks);
  options = {
    amp: false,
    dev: false,
    entry: {
      file: assets + "/_app/start-43a4f68a.js",
      css: [assets + "/_app/assets/start-61d1577b.css"],
      js: [assets + "/_app/start-43a4f68a.js", assets + "/_app/chunks/vendor-b50ad44c.js"]
    },
    fetched: void 0,
    floc: false,
    get_component_path: (id) => assets + "/_app/" + entry_lookup[id],
    get_stack: (error2) => String(error2),
    handle_error: (error2, request) => {
      hooks.handleError({ error: error2, request });
      error2.stack = options.get_stack(error2);
    },
    hooks,
    hydrate: true,
    initiator: void 0,
    load_component,
    manifest,
    paths: settings.paths,
    prerender: true,
    read: settings.read,
    root: Root,
    service_worker: null,
    router: true,
    ssr: true,
    target: "#svelte",
    template,
    trailing_slash: "never"
  };
}
var d = (s2) => s2.replace(/%23/g, "#").replace(/%3[Bb]/g, ";").replace(/%2[Cc]/g, ",").replace(/%2[Ff]/g, "/").replace(/%3[Ff]/g, "?").replace(/%3[Aa]/g, ":").replace(/%40/g, "@").replace(/%26/g, "&").replace(/%3[Dd]/g, "=").replace(/%2[Bb]/g, "+").replace(/%24/g, "$");
var empty = () => ({});
var manifest = {
  assets: [{ "file": ".DS_Store", "size": 6148, "type": null }, { "file": "android-chrome-192x192.png", "size": 13300, "type": "image/png" }, { "file": "android-chrome-512x512.png", "size": 36717, "type": "image/png" }, { "file": "apple-touch-icon.png", "size": 8872, "type": "image/png" }, { "file": "browserconfig.xml", "size": 246, "type": "application/xml" }, { "file": "favicon-16x16.png", "size": 1090, "type": "image/png" }, { "file": "favicon-32x32.png", "size": 1803, "type": "image/png" }, { "file": "favicon.ico", "size": 15086, "type": "image/vnd.microsoft.icon" }, { "file": "fonts/geomanist-bold-webfont.woff", "size": 39652, "type": "font/woff" }, { "file": "fonts/geomanist-bold-webfont.woff2", "size": 27624, "type": "font/woff2" }, { "file": "fonts/geomanist-regular-webfont.woff", "size": 40904, "type": "font/woff" }, { "file": "fonts/geomanist-regular-webfont.woff2", "size": 28184, "type": "font/woff2" }, { "file": "mstile-150x150.png", "size": 9783, "type": "image/png" }, { "file": "robots.txt", "size": 67, "type": "text/plain" }, { "file": "safari-pinned-tab.svg", "size": 4348, "type": "image/svg+xml" }, { "file": "site.webmanifest", "size": 426, "type": "application/manifest+json" }],
  layout: "src/routes/__layout.svelte",
  error: "src/routes/__error.svelte",
  routes: [
    {
      type: "endpoint",
      pattern: /^\/index\.query$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return index_query;
      })
    },
    {
      type: "page",
      pattern: /^\/$/,
      params: empty,
      a: ["src/routes/__layout.svelte", "src/routes/index.svelte"],
      b: ["src/routes/__error.svelte"]
    },
    {
      type: "endpoint",
      pattern: /^\/layout\.query$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return layout_query;
      })
    },
    {
      type: "endpoint",
      pattern: /^\/slug\.query$/,
      params: empty,
      load: () => Promise.resolve().then(function() {
        return slug_query;
      })
    },
    {
      type: "page",
      pattern: /^\/([^/]+?)\/?$/,
      params: (m) => ({ slug: d(m[1]) }),
      a: ["src/routes/__layout.svelte", "src/routes/[slug].svelte"],
      b: ["src/routes/__error.svelte"]
    }
  ]
};
var get_hooks = (hooks) => ({
  getSession: hooks.getSession || (() => ({})),
  handle: hooks.handle || (({ request, resolve: resolve2 }) => resolve2(request)),
  handleError: hooks.handleError || (({ error: error2 }) => console.error(error2.stack)),
  externalFetch: hooks.externalFetch || fetch
});
var module_lookup = {
  "src/routes/__layout.svelte": () => Promise.resolve().then(function() {
    return __layout;
  }),
  "src/routes/__error.svelte": () => Promise.resolve().then(function() {
    return __error;
  }),
  "src/routes/index.svelte": () => Promise.resolve().then(function() {
    return index;
  }),
  "src/routes/[slug].svelte": () => Promise.resolve().then(function() {
    return _slug_;
  })
};
var metadata_lookup = { "src/routes/__layout.svelte": { "entry": "pages/__layout.svelte-056cc3c9.js", "css": ["assets/pages/__layout.svelte-3a2b9985.css"], "js": ["pages/__layout.svelte-056cc3c9.js", "chunks/vendor-b50ad44c.js", "chunks/dato-request-402a6275.js", "chunks/stores-2564c142.js"], "styles": [] }, "src/routes/__error.svelte": { "entry": "pages/__error.svelte-1054687e.js", "css": [], "js": ["pages/__error.svelte-1054687e.js", "chunks/vendor-b50ad44c.js"], "styles": [] }, "src/routes/index.svelte": { "entry": "pages/index.svelte-72b1a4cc.js", "css": [], "js": ["pages/index.svelte-72b1a4cc.js", "chunks/vendor-b50ad44c.js", "chunks/dato-request-402a6275.js", "chunks/Sections-0e2abe90.js"], "styles": [] }, "src/routes/[slug].svelte": { "entry": "pages/[slug].svelte-60d13575.js", "css": [], "js": ["pages/[slug].svelte-60d13575.js", "chunks/vendor-b50ad44c.js", "chunks/dato-request-402a6275.js", "chunks/Sections-0e2abe90.js", "chunks/stores-2564c142.js"], "styles": [] } };
async function load_component(file) {
  const { entry, css: css2, js, styles } = metadata_lookup[file];
  return {
    module: await module_lookup[file](),
    entry: assets + "/_app/" + entry,
    css: css2.map((dep) => assets + "/_app/" + dep),
    js: js.map((dep) => assets + "/_app/" + dep),
    styles
  };
}
function render(request, {
  prerender: prerender2
} = {}) {
  const host = request.headers["host"];
  return respond({ ...request, host }, options, { prerender: prerender2 });
}
var seoMeta = `
  seoMeta {
    title
    description
    twitterCard
    image {
      responsiveImage(imgixParams: { w: 1200, h: 630, fit: crop, fm: jpg }) {
        src
        width
        height
      }
    }
  }
`;
var structuredText = `
  value
  links {
    ... on HomeRecord {
      id
      _modelApiKey
    }
    ... on PageRecord {
      id
      _modelApiKey
      slug
    }
  }
`;
var heroMain = `
  _modelApiKey
  title
  text {
    ${structuredText}
  }
`;
var textSection = `
  _modelApiKey
  title
  columnLeft {
    ${structuredText}
  }
  columnRight {
    ${structuredText}
  }
`;
var query$2 = `
  query Home {
    home {
      title
      ${seoMeta}
      sections {
        ...on HeroMainRecord {
          ${heroMain}
        }
        ...on TextSectionRecord {
          ${textSection}
        }
      }
    }
  }
`;
var index_query = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": query$2
});
var query$1 = `
  query Navigation {
    navigation {
      links {
        slug
        title
      }
    }
    allSocials {
      key
      title
      url
    }
  }
`;
var layout_query = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": query$1
});
var heroPage = `
  _modelApiKey
  title
  text {
    ${structuredText}
  }
`;
var image = `
  format
  url
  width
  height
  title
`;
var responsiveImage = `
  srcSet
  webpSrcSet
  sizes
  src

  # size information (post-transformations)
  width
  height
  aspectRatio

  # SEO attributes
  alt
  title

  # background color placeholder or...
  bgColor

  # blur-up placeholder, JPEG format, base64-encoded
  base64
`;
var project = `
  _modelApiKey
  title
  text {
    ${structuredText}
  }
  url
  image {
    ${image}
    responsiveImage(imgixParams: {  fit: crop, w: 1177, h: 730, auto: format }) {
      ${responsiveImage}
    }
  }
`;
var query = `
  query Page($slug: String) {
    page(filter: {slug: {eq: $slug}}) {
      title
      ${seoMeta}
      sections {
        ...on HeroPageRecord {
          ${heroPage}
        }
        ...on ProjectRecord {
          ${project}
        }
      }
    }
  }
`;
var slug_query = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": query
});
async function datoRequest({ query: query2, variables, fetch: fetch2, token }) {
  const endpoint = "https://graphql.datocms.com/preview";
  const data = await fetch2(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query: query2, variables })
  }).then((response) => {
    if (response.status != 200) {
      throw new Error(`Invalid request (${response.status})`);
    } else {
      return response.json();
    }
  }).then((response) => {
    if (response.errors && response.errors.length) {
      throw new Error(response.errors[0].message);
    } else {
      return response.data;
    }
  });
  return data;
}
var getStores = () => {
  const stores = getContext("__svelte__");
  return {
    page: {
      subscribe: stores.page.subscribe
    },
    navigating: {
      subscribe: stores.navigating.subscribe
    },
    get preloading() {
      console.error("stores.preloading is deprecated; use stores.navigating instead");
      return {
        subscribe: stores.navigating.subscribe
      };
    },
    session: stores.session
  };
};
var page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
var Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { pages } = $$props;
  let { socials } = $$props;
  if ($$props.pages === void 0 && $$bindings.pages && pages !== void 0)
    $$bindings.pages(pages);
  if ($$props.socials === void 0 && $$bindings.socials && socials !== void 0)
    $$bindings.socials(socials);
  $$unsubscribe_page();
  return `<header><div><a sveltekit:prefetch href="${"/"}">Home</a></div>

	<nav><ul>${each(pages, ({ slug, title }) => `<li${add_classes([$page.path === `/${slug}` ? "active" : ""].join(" ").trim())}><a sveltekit:prefetch${add_attribute("href", `/${slug}`, 0)}>${escape(title)}</a>
				</li>`)}</ul></nav>

	<ul>${each(socials, ({ url, title }) => `<li><a${add_attribute("href", url, 0)} target="${"_blank"}" rel="${"noopener noreferrer"}">${escape(title)}</a>
			</li>`)}</ul>
</header>`;
});
var Footer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { pages } = $$props;
  if ($$props.pages === void 0 && $$bindings.pages && pages !== void 0)
    $$bindings.pages(pages);
  $$unsubscribe_page();
  return `<footer><ul>${each(pages, ({ slug, title }) => `<li${add_classes([$page.path === `/${slug}` ? "active" : ""].join(" ").trim())}><a sveltekit:prefetch${add_attribute("href", `/${slug}`, 0)}>${escape(title)}</a>
      </li>`)}</ul>
</footer>`;
});
async function load$3({ page: page2, fetch: fetch2 }) {
  const token = "a54861921a6272e65b9e0c77891669";
  const { navigation, allSocials } = await datoRequest({ query: query$1, fetch: fetch2, token });
  if (!navigation) {
    return;
  }
  return {
    props: { navigation, socials: allSocials }
  };
}
var _layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { navigation } = $$props;
  let { socials } = $$props;
  if ($$props.navigation === void 0 && $$bindings.navigation && navigation !== void 0)
    $$bindings.navigation(navigation);
  if ($$props.socials === void 0 && $$bindings.socials && socials !== void 0)
    $$bindings.socials(socials);
  return `${validate_component(Header, "Header").$$render($$result, { pages: navigation.links, socials }, {}, {})}
<main>${slots.default ? slots.default({}) : ``}</main>
${validate_component(Footer, "Footer").$$render($$result, { pages: navigation.links }, {}, {})}`;
});
var __layout = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _layout,
  load: load$3
});
function load$2({ error: error2, status }) {
  return { props: { props: { error: error2, status } } };
}
var _error = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { error: error2 } = $$props;
  let { status } = $$props;
  if ($$props.error === void 0 && $$bindings.error && error2 !== void 0)
    $$bindings.error(error2);
  if ($$props.status === void 0 && $$bindings.status && status !== void 0)
    $$bindings.status(status);
  return `${$$result.head += `${$$result.title = `<title>${escape(status)}</title>`, ""}`, ""}

<h1>${escape(status)}
	${error2 ? `: ${escape(error2.message)}` : ``}</h1>
<a sveltekit:prefetch href="${"/"}">Home</a>`;
});
var __error = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": _error,
  load: load$2
});
var SeoHead = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { seo = {} } = $$props;
  let { slug = "" } = $$props;
  const title = seo.title || "Hornebom";
  const description = seo.description || "Portfolio of Hornebom, frontend and creative developer, based in Rotterdam, The Netherlands.";
  if ($$props.seo === void 0 && $$bindings.seo && seo !== void 0)
    $$bindings.seo(seo);
  if ($$props.slug === void 0 && $$bindings.slug && slug !== void 0)
    $$bindings.slug(slug);
  return `${$$result.head += `${$$result.title = `<title>${escape(title)}</title>`, ""}<meta key="${"og:title"}" property="${"og:title"}" name="${"twitter:title"}"${add_attribute("content", title, 0)} data-svelte="svelte-ajtuxi"><meta key="${"og:type"}" property="${"og:type"}" content="${"website"}" data-svelte="svelte-ajtuxi"><meta key="${"description"}" name="${"description"}"${add_attribute("content", description, 0)} data-svelte="svelte-ajtuxi"><meta key="${"og:description"}" property="${"og:description"}" name="${"twitter:description"}"${add_attribute("content", description, 0)} data-svelte="svelte-ajtuxi">${seo && seo.image && seo.image.responsiveImage ? `<meta key="${"og:image"}" property="${"og:image"}"${add_attribute("content", `${seo.image.responsiveImage.src}?auto=format&fm=jpg&auto=quality`, 0)} data-svelte="svelte-ajtuxi">
    
    <meta key="${"og:image:width"}" property="${"og:image:width"}"${add_attribute("content", `${seo.image.responsiveImage.width}`, 0)} data-svelte="svelte-ajtuxi">
    
    <meta key="${"og:image:height"}" property="${"og:image:height"}"${add_attribute("content", `${seo.image.responsiveImage.height}`, 0)} data-svelte="svelte-ajtuxi">` : ``}<meta key="${"og:url"}" property="${"og:url"}"${add_attribute("content", `https://www.hornebom.com/${slug ? slug : ""}`, 0)} data-svelte="svelte-ajtuxi"><meta key="${"twitter:card"}" name="${"twitter:card"}"${add_attribute("content", seo && seo.twitterCard || "summary_large_image", 0)} data-svelte="svelte-ajtuxi">`, ""}`;
});
var StructuredText = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { text } = $$props;
  const options2 = {
    renderLinkToRecord({ record, children, adapter: { renderNode } }) {
      const href = record._modelApiKey === "page" ? `/${record.slug}` : "/";
      return renderNode("a", { href }, children);
    },
    customRules: [
      (0, import_datocms_structured_text_to_dom_nodes.renderRule)(import_datocms_structured_text_utils.isHeading, ({ adapter: { renderNode }, node, children, key }) => {
        return renderNode("h2", { key, classList: "class-name" }, children);
      })
    ]
  };
  const nodes = (0, import_datocms_structured_text_to_dom_nodes.render)(text, options2);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  return `${each(nodes, ({ outerHTML }) => `<!-- HTML_TAG_START -->${outerHTML}<!-- HTML_TAG_END -->`)}`;
});
var HeroMain = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let formattedTitle;
  let { title } = $$props;
  let { text } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  formattedTitle = title.replace(/(<p)/igm, "<h1").replace(/<\/p>/igm, "</h1>");
  return `<section><!-- HTML_TAG_START -->${formattedTitle}<!-- HTML_TAG_END -->

  ${text ? `<div>${validate_component(StructuredText, "StructuredText").$$render($$result, { text }, {}, {})}</div>` : ``}</section>`;
});
var HeroPage = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { text } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  return `<section>${title ? `<h1>${escape(title)}</h1>` : ``}

  ${text && text.value ? `<div>${validate_component(StructuredText, "StructuredText").$$render($$result, { text }, {}, {})}</div>` : ``}</section>`;
});
var TextSection = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { columnLeft } = $$props;
  let { columnRight } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.columnLeft === void 0 && $$bindings.columnLeft && columnLeft !== void 0)
    $$bindings.columnLeft(columnLeft);
  if ($$props.columnRight === void 0 && $$bindings.columnRight && columnRight !== void 0)
    $$bindings.columnRight(columnRight);
  return `<section>${title ? `<h2>${escape(title)}</h2>` : ``}

  ${columnLeft ? `${validate_component(StructuredText, "StructuredText").$$render($$result, { text: columnLeft }, {}, {})}` : ``}
  
  ${columnRight ? `${validate_component(StructuredText, "StructuredText").$$render($$result, { text: columnRight }, {}, {})}` : ``}</section>`;
});
var Image = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { image: image2 } = $$props;
  const width = image2.format === "svg" ? image2.width : image2.responsiveImage.width;
  const height = image2.format === "svg" ? image2.height : image2.responsiveImage.height;
  const altText = image2.alt || "";
  if ($$props.image === void 0 && $$bindings.image && image2 !== void 0)
    $$bindings.image(image2);
  return `<div><span style="${"padding-top: " + escape(height / width * 100) + "%"}"></span>

  ${image2.format === "svg" ? `<img${add_attribute("src", image2.url, 0)}${add_attribute("alt", altText, 0)}>` : `<img${add_attribute("src", image2.url, 0)}${add_attribute("alt", altText, 0)}${add_attribute("title", image2.title, 0)}${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("srcset", image2.responsiveImage.srcSet, 0)}${add_attribute("sizes", image2.responsiveImage.sizes, 0)} loading="${"lazy"}">`}</div>`;
});
var Project = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { text } = $$props;
  let { url } = $$props;
  let { image: image2 } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0)
    $$bindings.title(title);
  if ($$props.text === void 0 && $$bindings.text && text !== void 0)
    $$bindings.text(text);
  if ($$props.url === void 0 && $$bindings.url && url !== void 0)
    $$bindings.url(url);
  if ($$props.image === void 0 && $$bindings.image && image2 !== void 0)
    $$bindings.image(image2);
  return `<article>${title ? `<h2>${escape(title)}</h2>` : ``}

  ${text ? `<div>${validate_component(StructuredText, "StructuredText").$$render($$result, { text }, {}, {})}</div>` : ``}

  ${url ? `<a${add_attribute("href", url, 0)} target="${"_blank"}" rel="${"noopener noreferrer"}">See it live
    </a>` : ``}
  
  ${image2 ? `${validate_component(Image, "Image").$$render($$result, { image: image2 }, {}, {})}` : ``}</article>`;
});
var Sections = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { sections } = $$props;
  const types2 = {
    "hero_main": HeroMain,
    "hero_page": HeroPage,
    "text_section": TextSection,
    "project": Project
  };
  if ($$props.sections === void 0 && $$bindings.sections && sections !== void 0)
    $$bindings.sections(sections);
  return `${each(sections, ({ _modelApiKey, ...rest }) => `${types2[_modelApiKey] ? `${validate_component(types2[_modelApiKey] || missing_component, "svelte:component").$$render($$result, Object.assign(rest), {}, {})}` : `<p>No section of type: ${escape(_modelApiKey)}</p>`}`)}`;
});
var prerender$1 = true;
async function load$1({ fetch: fetch2, page: page2 }) {
  const { slug } = page2.params;
  const token = "a54861921a6272e65b9e0c77891669";
  const { home } = await datoRequest({ query: query$2, fetch: fetch2, token });
  return { props: { page: { ...home, slug } } };
}
var Routes = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { page: page2 } = $$props;
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  return `${validate_component(SeoHead, "SeoHead").$$render($$result, { seo: page2.seoMeta, slug: page2.slug }, {}, {})}

${page2.sections ? `${validate_component(Sections, "Sections").$$render($$result, { sections: page2.sections }, {}, {})}` : ``}`;
});
var index = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": Routes,
  prerender: prerender$1,
  load: load$1
});
var prerender = true;
async function load({ page: page2, fetch: fetch2 }) {
  const { slug } = page2.params;
  const token = "a54861921a6272e65b9e0c77891669";
  const data = await datoRequest({ query, variables: { slug }, fetch: fetch2, token });
  if (!data.page) {
    return;
  }
  return { props: { data: data.page } };
}
var U5Bslugu5D = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let seoProps;
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  let { data } = $$props;
  if ($$props.data === void 0 && $$bindings.data && data !== void 0)
    $$bindings.data(data);
  seoProps = {
    seo: data.seoMeta,
    slug: $page.params.slug
  };
  $$unsubscribe_page();
  return `${validate_component(SeoHead, "SeoHead").$$render($$result, Object.assign(seoProps), {}, {})}

${data.sections ? `${validate_component(Sections, "Sections").$$render($$result, { sections: data.sections }, {}, {})}` : ``}`;
});
var _slug_ = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  [Symbol.toStringTag]: "Module",
  "default": U5Bslugu5D,
  prerender,
  load
});

// .svelte-kit/netlify/entry.js
init();
async function handler(event) {
  const { path, httpMethod, headers, rawQuery, body, isBase64Encoded } = event;
  const query2 = new URLSearchParams(rawQuery);
  const encoding = isBase64Encoded ? "base64" : headers["content-encoding"] || "utf-8";
  const rawBody = typeof body === "string" ? Buffer.from(body, encoding) : body;
  const rendered = await render({
    method: httpMethod,
    headers,
    path,
    query: query2,
    rawBody
  });
  if (rendered) {
    return {
      isBase64Encoded: false,
      statusCode: rendered.status,
      ...splitHeaders(rendered.headers),
      body: rendered.body
    };
  }
  return {
    statusCode: 404,
    body: "Not found"
  };
}
function splitHeaders(headers) {
  const h = {};
  const m = {};
  for (const key in headers) {
    const value = headers[key];
    const target = Array.isArray(value) ? m : h;
    target[key] = value;
  }
  return {
    headers: h,
    multiValueHeaders: m
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * ECMAScript compliant, uniform cross-browser split method
 */
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
