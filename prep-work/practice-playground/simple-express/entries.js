const mongoose = require('mongoose');

const entrySchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mail: {
    type: String,
    required: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  entry: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model('Entry', entrySchema);

module.exports = Entry;

// module.exports = (function handleEntries() {
//   const entries = [];

//   return {
//     add(name, mail, entry) {
//       entries.push({
//         date: new Date(),
//         name,
//         mail,
//         entry,
//       });
//     },

//     all() {
//       return entries.slice().reverse();
//     },
//   };
// }());
