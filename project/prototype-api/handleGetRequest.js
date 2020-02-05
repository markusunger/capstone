const data = require('./dataHandler');

module.exports = function handleGetRequests(req) {
  let status = 200;
  const response = {};

  const responseObject = () => ({ status, response });

  if (!req.args) {
    // root path request or error parsing the request path,
    // what to do here?
    status = 500;
    return responseObject();
  }

  const result = req.args.reduce((tempResult, pair) => {
    const [resource, id] = pair;
    /*
      different cases:
      (1) one pair, identifier undefined:
          list of all resources
      (2) one pair, with identifier specified:
          one specific resource item
      (3) multiple pairs with the same pattern as (1) and (2):
          continue getting more specific data from the store
      problems & questions:
        how is nested data saved & retrieved? e.g., user & comments:
          /users/5/comments/1
            everything a nested JSON structure, with the whole comment saved
            inside of a user object or comments saved separately with a reference
            to the userId -> userId automatically generated and saved?
      naive solution for now: everything stored as a nested structure in the store

      TODO:
        - handle auto-creation of requested resource that don't exist
        - explore how resource items get identified, i.e. just by id or something else
          as well (e.g. first field)?
        - which data types are allowed as id's and how are they properly saved and treated
          (all to string or something else)?
    */
    let newTempResult;

    if (!tempResult) {
      // main resource retrieval (actually querying the data store)

      if (!id) {
        // retrieve list of all resource items
        const list = data.getResources(resource);
        if (!list) {
          // resource does not exist
          status = 404;
          response.error = `Resource ${resource} not found.`;
          return responseObject();
        }
        newTempResult = list;
      } else {
        // retrieve item from the resource with specific id
        const item = data.getResource(resource, Number(id));
        if (!item) {
          // resource or item with id does not exist
          status = 404;
          response.error = `Item with id ${id} in resource ${resource} not found.`;
          return responseObject();
        }
        newTempResult = item;
      }
    } else {
      // sub-resource retrieval, truncating the current result
      // eslint-disable-next-line no-lonely-if
      if (!id) {
        // retrieve list of all sub-resource items
        if (!tempResult[resource]) {
          // sub-resource does not exist
          status = 404;
          response.error = `Resource ${resource} does not exist.`;
          return responseObject();
        }
        newTempResult = tempResult[resource];
      } else {
        // retrieve item from the sub-resource with specific id
        const match = tempResult[resource].find(item => item.id === Number(id));
        if (!match) {
          // resource or item with id does not exist
          status = 404;
          response.error = `Item with id ${id} in resource ${resource} not found.`;
          return responseObject();
        }
        newTempResult = match;
      }
    }
    return newTempResult;
  }, undefined);

  if (!response.error) response.data = result;
  return responseObject();
};
