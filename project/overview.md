# Ephemeral, zero-config, schema-less hosted API

## Goal
Provide a one-click API path with multiple endpoints that get populated during the actual requests. If a `POST` request is made to `/users`, create a user from the request body . A `GET` request to `/users/` should then return a list with a single element: the previously created user.  
The API should make _educated guesses_ about the caller's intents: if the user that was created contains an `id` field, it should also be accessible through `/users/:id`. Similarly, if there is a `POST` to `/users/:id/comments`, the comment may either have a `userId` field already or have it created by the API maybe?  
There should be noe sign-up required, just a button on the web page to create a new API. The caveat: the API will be deleted after 3 to 7 days, it should be heavily rate-limited and be restricted to a certain number of items for each endpoint (and a cumulative total).

## Who is this for?
Hackathon participants, frontend developers who want a quick mocked API, novices without backend knowledge.

## Project Design Thoughts
- API creation
  - On click of a 'Create API' button, a new root path gets created, e.g. `https://your-personal-api.apiservice.io/`
  - Is the root path going to be a subdomain or just a path to the service URL (the above or e.g. `https://apiservice.io/your-personal-api/`)? What is required for subdomain creation and management and how do they get resolved (`CNAME` entries necessary)? What do those subdomains point to?
  - Where is information about each API saved? In the main data store together with any other stored request data or separate, e.g. in simple key-value store like Redis?
- Account management
  - Can all functionality be implemented without having an account system in place? Is that also true for the stretch goals (especially the real-time request inspection feature or the configuration of pre-defined mock data and rule-based endpoint behavior)?
  - If an account management system is needed, does that extend to API authentication (e.g. JWT tokens)? Should there be an option for authenticated/non-authenticated API access?
- HTTP request is received
  - How is the request assigned to a specific API? Is the URL parsed or is each subdomain/API path reverse proxied to a container or something else? Or does the main application server handle everything itself?
  - If there are separate services for each API, in what form are they managed? Are containers used? Will they be run on-demand and torn down after the time limit is hit? Who manages those containers? Docker Swarm? Are there alternatives?
- Getting and Saving Data
  - How is data from a POST or PUT request saved? In a PostgreSQL DB? Is there one big database or multiple small databases for each API? Is a NoSQL store a better alterntive (document store like MongoDB or key-value-store like Redis)? If so, is there one instance (e.g. one Redis server) per API or again one big store for everything? Is the POST/PUT request stored as a JSON blob or is it serialized for optimal storage/retrieval?
- Serving Special Requests
  - How are the following things handled: pagination, limits, sorting? How is parsing of those URL parameters handled or is there another alternative (headers? request body? what are the best practices)?

# Features
- get a `pong` reply on a `GET /ping` request (for Christina)Da hätte ich dich 

## Stretch goals

- a dashboard that provides a real-time view of all requests for that API for inspecting and debugging purposes
- pre-generated mock data that be defined for certain endpoints (like fake user data for `/users`)
- possiblity to define behavior for certain endpoints (rule-based responses to certain requests)