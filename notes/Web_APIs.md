# The Design of Web APIs

## What is a Web API?

A web API (_Application Programming Interface_) is a web interface for software. In the strictest terms, the API describes only the interface with which to interact with a piece of software. It is an abstraction of the underlying software's implementation. However, in most cases nowadays (especially true for web APIs), the term API is used to describe the whole software, meaning both the interface and the actual implementation (referring to the _backend_ or the _provider_).

## API Usability

Naming resources and properties properly is important to increase user friendliness of the API. A feature flag called `bankAccountOverdraftProtectionFeatureActiveBln` obfuscates much of the actual information: the `bln` (for the associated data type) is unnecessary as is the `Active` (being again redundant with the associated data type), `Feature` adds no value and prefixing `bankAccount` doesn't make sense in the context of a schema that is specifically stated in e.g. an OpenAPI schema. `overdraftProtection` is the way clearer name without sacrificing information.

The same goes for data types: An ISO 8601 date string is easier to understand than a UNIX timestamp integer (with the omission of a time plus time zone - if not needed - preventing time zone conversion issues). Numerical codes (e.g. `"type": 1`) are often better converted to expressive strings (e.g. `"type": "admin"`). Accurate representations are most important, closely followed by providing types that could be humanly understood even without context.  
If something like a numerical `"type"` value is internally used, an additional property `"typeName"` could be used to clarify the meaning. Data can and should be aggregated or pre-processed compared to its raw storage form to provide meaningful information to the consumer (e.g. converting a `"creationDate"` string to an integer value of `"yearsExisting"` i that is what this data is used for).

Error feedback needs to be provided for all possible error types:
- _malformed request errors_ are issued when the API cannot interpret the request: a necessary property might be missing, a data type is mismatched or does not conform to the specified format (e.g. UNIX timestamp string vs. ISO 8601 string)
- _functional errors_ are triggered by the implementations business rules, or when those are violated
- _server errors_ can be caused by a necessary service (e.g. a database) not being reachable or a bug encountered during the implementation

The feedback provided in the error response is dependent on its type. _Server errors_ need not be detailed, a generic error is sufficient. For _malformed request_ and _functional_ errors, the feedback needs to be informative enough for the consumer to know what exactly went wrong.  
The correct status code can help with that. _Malformed requests_ should return a `4xx` status code. `400 Bad Request` is fine for actual missing properties or wrong data types, while `403 Forbidden` should be used for missing authorization, signaling that the request was formally correct but failed due to being an action that was no allowed/authorized. Similarly, `404 Not Found` should be used for wrong path parameters or `409 Conflict` if an action is rate-limited and has already occured recently.
`500 Internal Server Error` can be a catch-all error code for any provider-side error.  
Error codes alone are not enough, however, as it does not provide enough information to help the consumer solve the problem. The response body should at least include a message detailing what went wrong in a human-readable string. But that might not be enough, especially if the API is consumed not by a human, but by another application. In that case, for a `400 Bad Request` error, it might be helpful to also state the property causing the error or a more fine-grained error type that the consumer can handle in a certain way. So, for a `400 Bad Request` in an accounting API, a missing amount property for a transaction might result in this error body:

  ```json
  {
"source": "amount",
"type": "MISSING_MANDATORY_PROPERTY",
"message": "Amount is mandatory"
}
```

To avoid too many request/error cycles, error feedback should be as exhaustive as possible and include multiple error messages, if necesary. Multiple `400 Bad Request` errors could look like this in the response body:

```json
{
  "message": "Invalid request",
  "errors": [
    {
      "source": "source",
      "type": "MISSING_MANDATORY_PROPERTY",
      "message": "Source is mandatory"
    },
    {
      "source": "destination",
      "type": "MISSING_MANDATORY_PROPERTY",
      "message": "Destination is mandatory"
    }
  ]
}
```

Even if there are multiple types of errors (as described above), one status code and one error message will most likely be sufficient for the consumer, as long as the information includes all errors. A generic `400 Bad Request` can then contain all malformed and functional errors.

In the same vein, success feedback on a `2xx` status code should be equally informative. The use of `200 OK` is fine for e.g. `GET` requests, but `201 Created` is useful for immediately executed `POST` requests and `202 Accepted` for delayed operations that have been successfully enqueued. The response body itself should include every piece of the requested or created resource, especially the `id` (if applicable) to allow the client to use it in subsequent requests.

Uniformity in naming (both for API paths and properties on requests) is important for usability. If the same piece of information is used or presented in a different context, it should still bear the same name. It might get prefixed to make a different use case more clear, but should still be easily recognizable (e.g. using `accountNumber` for all uses of the account number, even if it's used as `sourceAccountNumber` in some context).  
The same uniformity should be used in those properties types. Consistency there also ensures automatic type matches when information is processed and re-used.  
Every convention chosen for naming should be enforced in all parts of a system to retain that consistency. Ideally, an API follows all levels of consistency, if possible:
- Level 1 — Consistency within an API
- Level 2 — Consistency across an organization/company/team’s APIs
- Level 3 — Consistency with the domain(s) of an API
- Level 4 — Consistency with the rest of the world

Level 4 means consistency with best or common practices used in API design. There are ISO standards for representation of currencies, times etc. and also other ubiquitous conventions, allowing API consumers to be able to instinctively use an API by virtue of previous experiences.

Providing an adaptable API might mean providing and accepting different formats for data input and output. This is easily doable either by accepting a query parameter (`?format=txt`) or by using the more idiomatic `Accept` headers. The client might send a `GET` request with the header `Accept: text/plain` and the server can then respond by sending a `Content-type: text/plain` header and using that specified format for the body data. This is called _content negotiation_. If a client request a content type that is not available, the server can return a `406 Not Acceptable` error.  
This also works for when the client sends a requst body (e.g. with a `POST`). If the media type specified in the `Content-Type` header field is not supported by the server, it can return a `415 Unsupported Media Type` error.

There are two ways to support _pagination_ for API calls: one is using query parameters (`?pageSize=30&page=2` or similar), which is a widely used method for paginating or limiting `GET` results for larger collections.  
Another way is by using the HTTP `Range` header which is used in the format `Range: <unit>=<range-start>-<range-end>`. If `items` is used as the unit throughout all collections, the chance of an unintentional use of the wrong unit gets eliminated (though `bytes` can be a relevant unit for limiting binary data transfer).  
Query parameters also have uses for allowing clients to define filter or sorting parameters, which can be neatly combined in a query string.

Discoverability (showing a consumer the options available to them) can improve an API considerably. Pagination, like described above, could add metadata to the response, providing information about the current page and the total number of pages:

```json
{
  "pagination" : {
    "page": 1,
    "totalPages": 9
  },
  "items": [...]
}
```

Continuing with that pattern, the hypermedia approach that Fielding described in his original REST specification can aid in improving discoverability. By exposing link relationships as metadata in a response, a consumer can navigate and use the whole API without having to know about its structure beforehand.  
Those links usually come in the form of `href` or `link` properties and can be used for all responses. For pagination, it could link the next and previous pages, for collection items it could link to a detail page or any other methods of using a resource or an item. See the official GitHub API for an excellent example of those related links in response bodies and how it allows discovering the whole API without ever looking up another endpoint after the root one.

Also playing into discoverability is allowing HTTP `OPTIONS` requests and responding with an `Allow` header field that specifies which HTTP methods the requested API path supports.

## API and API Data Organization and Management

Easy optimization in the way that data is sent with a response is to
- a) group related data together (maybe as a substructure like a nested object or by using shared prefixes)
- b) sort data and/or groups by their importance for the consumer

In the same way, error or success messages can be grouped by type and sorted by their importance or severity.

Considering the granularity of the data provided by an API can lead to the conclusion that some resource representations might be too large in size. Both the number of properties as well as the maximum depth of nested properties should be taken into account and reduced, if necessary.

