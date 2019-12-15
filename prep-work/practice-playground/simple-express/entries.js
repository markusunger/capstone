module.exports = (function handleEntries() {
  const entries = [];

  return {
    add(name, mail, entry) {
      entries.push({
        date: new Date(),
        name,
        mail,
        entry,
      });
    },

    all() {
      return entries.slice().reverse();
    },
  };
}());
