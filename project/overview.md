# Ephemeral, zero-config, schema-less hosted API

## Goal
Provide a one-click API path with multiple endpoints that get populated during the actual requests. If a `POST` request is made to `/users`, create a user from the request body. A `GET` request to `/users/` should then return a list with a single element: the previously created user.  
The API should make _educated guesses_ about the caller's intents: if the user that was created contains an `id` field, it should also be accessible through `/users/:id`. Similarly, if there is a `POST` to `/users/:id/comments`, the comment may either have a `userId` field already or have it created by the API maybe?  
There should originally be no sign-up required, just a button on the web page to create a new API. The caveat: the API will be deleted after 3 to 7 days, it should be heavily rate-limited and be restricted to a certain number of items for each endpoint (and probably a cumulative total).

On API creation some kind of token is issued alongside the API path that allows for the claiming of that API later.

When an account is created, API's can be claimed with the issued token. The web frontend allows for the creation of pre-defined rules and responses for endpoints. The options are:
- allow certain methods to be performed on the endpoint or not (and possibly return a 405 Method Not Allowed status response)
- JSON data can be provided for any endpoint to be sent back as the response payload along with a custom status code, if desired

For every endpoint not specifically configured in the web frontend, the semi-"intelligent" automatic handling is used.

## Who is this for?
Hackathon participants, frontend developers who want a quick mocked API, novices without backend knowledge.

## Open Questions
- API creation
  - Is the root path going to be a subdomain or just a path to the service URL (e.g. `https://apiservice.io/your-personal-api/`)? What is required for subdomain creation and management and how do they get resolved (`CNAME` entries necessary)? What do those subdomains point to?
  - Where is information about each API saved? In the main data store together with any other stored request data or separate, e.g. in simple key-value store like Redis? This probably depends on the amount and kind of metadata that will be stored alongside each API
- Account management/authentication
  - Is there still a possiblity to configure API behavior without a frontend (query string, body content etc.)? If so, would it be advisable to implement this first and have the frontend as a stretch goal (that will most likely be hit anyway)?
  - What about API authentication (e.g. JWT tokens)? Should there be an option for authenticated/non-authenticated API access?
- API routes
  - How is a request assigned to a specific API? Is the URL parsed or is each subdomain reverse proxied? If so, where to, since there is most likely only a single Express backend server? Or does the main application server simply handle everything itself?
  - There probably isn't one, but keep investigating solutions for more intelligent API path mapping to actions (nested resources, singletons instead of collections, non-resource endpoints like `/logout`)
  - Since the order for path actions is important, how does the API ensure that the most specific route gets executed (taking into account both pre-defined endpoints [should be prioritized anyway] and automatic behavior)?
  - What about support for HEAD and OPTIONS request types?
  - How are nonsensical/not allowed route request handled (e.g. a POST to a specific resource item), 400 Bad Request and an error?
  - What is the general structure of an API response, is an error field only transmitted on error, is the data field labelled as such or is data just the top-level object returned if it was a successful request?
  - How are error messages aggregated when multiple errors occur (e.g. missing resource and wrong request type)?
- Getting and Saving Data
  - Which content types are allowed from a client? `application/json` is obvious, but what about e.g. `application/x-www-form-urlencoded`?
  - Where is data saved? In a PostgreSQL DB? Is there one big database or multiple small databases for each API? Is a NoSQL store a better alternative (document store like MongoDB or key-value-store like Redis)? If so, is there one instance (e.g. one Redis server) per API or again one big store for everything? Is the POST/PUT request stored as a JSON blob or is it serialized for optimal storage/retrieval?
  - What is the best approach for serialization anyway when considering options for searching, limits/pagination, sorting? SQL might be the obvious best choice but what about e.g. JSON extensions for Redis?
  - How are nested structures saved? If a resource has a many-to-many relationship (e.g. users and comments), will all sub-resources be saved within the main resource (e.g. all comments froma user inside the user object itself) or will those sub-resource be saved as a separate entity with a reference to the specific main resource item (e.g. all comments get a userId reference)?
  - Are different relationships (one-to-one, one-to-many, many-to-many) supported and what are the differences in their treatment?
  - 
- Serving Special Requests
  - How are the following things handled: pagination, limits, sorting? How is parsing of those URL parameters handled or is there another alternative (headers? request body? what are the best practices here)?
- CORS
  - CORS should naturally be enabled, research about CORS pre flight OPTIONS requests and how they need to be handled, if necessary

## Building Blocks
- reverse proxy for easy SSL encryption and possibly mapping requests to either the config backend or the API backend server
- API backend server in Node.js, either for handling all APIs or a deployable separate container for each API
- creation/editing backend in Node.js with either server-side rendered interface frontend (HTML/CSS/vanilla JS) or a React frontend that communicates with the backend
- small automatic database cleaner as a cronjob or something?

## Additional Features
- get a `pong` reply on a `GET /ping` request (for Christina)

## Stretch goals

- a dashboard in the frontend that provides a real-time view of all requests for that API for inspecting and debugging purposes
- pre-generated mock data that can be used for certain endpoints (like fake user data for `/users`, possibly generated by faker.js)