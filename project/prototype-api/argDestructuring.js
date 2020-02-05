/*
  Destructures the request path into the requested resources and their item identifiers,
  taking into account any nested relationship

  input: the request object with access to req.path,
         specifying the endpoint accessed by the user
  output: a data type with the flexibility and processing ease
          to quickly determine the resource sets and
          specific item identifiers for them
  problem: the path is separated into segments (divided by forward slashes),
           the requested resource action or transition is dependent on:
             the request type (GET, POST, PUT, DELETE)
             the media type (should only handle application/json for now anyway)
             the number of path segments
           right now, the only sensible option is to treat pairs of segments as
           resource identifier (e.g. 'users') + specific item (e.g. '57')
  data structure:
    an array of arrays of pair values, because the optimal format might be dependent
    on how the data store will handle nested relationships.
  algorithm:
    split the path segments into chunks of two, each pair representing a resource + identifier
    for each pair, create a sub-array in the args array that contains the resource + the
    identifier (undefined if not present)
    the interpretation of the args array is left to the request type handlers
*/

function splitIntoPairs(arr) {
  const pairs = [];
  for (let i = 0; i < arr.length; i += 2) {
    const pair = arr.slice(i, i + 2);
    if (pair.length < 2) pair.push(undefined);
    pairs.push(pair);
  }
  return pairs;
}

module.exports = function argDestructuring(req, res, next) {
  let { path } = req;
  if (req.path[0] === '/') path = path.slice(1);
  const requestArgs = splitIntoPairs(path.split('/'));
  req.args = requestArgs;
  next();
};
