# CORS (Cross-Origin Resource Sharing)

CORS basically allows servers to control in which ways the same-origin policy implemented in browsers can be losened. It does so by receiving and responding with specific HTTP headers to communicate cross-origin behavior.  
The server can flexibly set features:
- domains that are allowed to make requests
- which HTTP methods the client can use
- which headers a client request can send
- whether requests may contain cookie data
- which respone headers the client can read

## In the Browser

CORS is supported with the `XMLHttpRequest` and `fetch` APIs in all major browsers, so there is no additional client support necessary for CORS to work.

By default, CORS allows the browser to only read the following response headers, unless the server specifies otherwise:
- `Cache-Control`
- `Content-Language`
- `Content-Type`
- `Expires`
- `Last-Modified`
- `Pragma`

Every non-simple request triggers a preflight request with the `OPTIONS` method to determine if the actual request can be safely sent. _Non-simple_ in this context means:
- not with the `GET`, `HEAD` or `POST` method
- including other headers than `Accept`, `Accept-Language`, `Content-Language`, `Content-Type` (or with other settings than `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain` for this) and a few other, less often used ones

This `OPTIONS` preflight request includes two relevant headers:
- `Access-Control-Request-Method`, which specifies which HTTP method the actual request intends to use (like `DELETE`)
- `Access-Control-Request-Headers`, detailing which non-CORS-safe headers (see above) the request will include (like a `Content-Type: application/json`)

Each CORS request contains the non-changeable `Origin` header, showing the server where the request originates from.

## On the Server

Since each CORS request made by a client must include the `Origin` header (specifying the scheme, host and port of the origin URL), the most important response header for the server is `Access-Control-Allow-Origin`. This can be either a single origin (like `http://200ok.app`) or a `*` wildcard to indicate that all origins are allowed to make requests. If a single origin is specified, the server should also add a `Vary` header field with the `Origin` value to indicate that the server's response might be different depending on the request origin (e.g. if the `Access-Control-Allow-Origin` response header is set dynamically depending on the request origin).
Beware: the `Origin` request header can also have a valid string value `null`, which will be the case when the origin cannot be determined, e.g. when an HTML file opened from the local filesystem issues a CORS request.

Each `OPTIONS` preflight response can (and should) send the following information:
- `Access-Control-Allow-Methods`, specifying which HTTP methods the requested resource supports
- `Access-Control-Allow-Headers` to give information about which non-CORS-safe request headers are allowed
- `Access-Control-Max-Age`, giving the amount of seconds that this preflight response can be cached without requiring another one

The server can specify whether a request is allowed to send authentication cookie content by using a special response header `Access-Control-Allow-Credentials`. This should not just be part of the preflight response, because a `GET` request with provided credentials is not normally preflighted, making the browser ignore any reponse as long as the server does not specifically state that it accepts credentials.