function asyncAdd(x, y, callback) {
  setTimeout(function () {
    const sum = x + y;
    callback(sum);
  }, 500);
}

const thunk = function (callback) {
  asyncAdd(5, 10, callback);
}

thunk(function (sum) {
  console.log(sum);
});

console.log('Completed');