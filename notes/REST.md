# REpresentational State Transfer (REST)

REST was defined in [a dissertation](https://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm) by Roy Thomas Fielding in 2000.

## REST Architecture

### REST data elements

REST components transfer a representation of a _resource_ in a format that matches one of the standard data types (like an HTML document or a JSON structure) depending on both the client's capabilities as well as its desires (like a `content-type: application/json` in the request body). The resource's representation does not need to match the raw source of the data, it hides that completely through its interface.

At the core of REST information transfer is the _resource_. Resources conceptually map to a set of entities (basically anything that can be named, a person, a collection of other resources, a document, ...) and the resource represents a set of entities (or values) at a specific time: while a resource can be static, it can also vary wildly over time. This abstraction allows a resource to represent any source of information, regardless of its type or its implementation. It allows a reference to a concept (a list of favorite images) without having to update the reference each time that concept changes, as long as the right identifier to that concept is used.  
A _resource identifier_ is used to identify any particular resource and connectors provide a generic interface to access or change the value set of a resource. This ensures the semantic validity of those operations over time, compared to e.g. traditional links that change as their underlying resource changes (e.g. through renaming/deletion/moving).

The state of a resource at any given time is known as its _representation_, comprising data and metadata. The data format is the _media type_ of that representation and together with the transmitted control data gives the recipient the information needed to accurately process the representation (e.g. displaying an image).

### REST connectors

Connectors encapsulate the activities surrounding the access to resources and the transfer of its representations. The most common connector type is that of a client and server, with connectors like caches providing the benefits of reduced interaction latency by providing cached responses.  
All REST interactions are stateless, so that the connectors understand each request in isolation without having to know about e.g. preceding requests.

### REST components

Components are identified by their role in the overall application action. A user agent component (e.g. a web browser) is usually the initiator of requests and the recipient of the responses.

## Resource Interactions

"A REST API should be entered with no prior knowledge beyond the initial URI (bookmark) and set of standardized media types that are appropriate for the intended audience (i.e., expected to be understood by any client that might use the API). From that point on, all application state transitions must be driven by client selection of server-provided choices that are present in the received representations or implied by the user’s manipulation of those representations." (Roy Fielding, https://roy.gbiv.com/untangled/2008/rest-apis-must-be-hypertext-driven)
