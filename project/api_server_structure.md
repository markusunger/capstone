# Express-powered Node.js API server

Handles all API-directed requests and responses. Its main tasks are:
- finding the associated user API (either by receiving it through an upstream reverse proxy or by identifying it from the requested path)
- responding to OPTIONS requests on all paths for returning CORS-related information (origin) or allowed request methods/headers
- for each request:
  - determine if a pre-defined endpoint response should be used
  - if not, determine the action to be taken according to the path and method used
  - construct an informative error response if the request is invalid, malformed or otherwise not completable (includes server-side errors like a dropped database connection)
  - send the desired response with the data requested

# Workflow through a valid GET request to a pre-defined endpoint

- API root is determined and possible authentication is established by looking up auth credentials and comparing to information sent with request header
