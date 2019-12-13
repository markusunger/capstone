const entries = [];

module.exports = {
  add(name, entry) {
    entries.push({
      name,
      entry,
    });
  },
  all() {
    return entries.slice();
  },
};
