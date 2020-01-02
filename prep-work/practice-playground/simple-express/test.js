const mongoose = require('mongoose');

const Entry = require('./entries');

mongoose.connect('mongodb://localhost:27017/guestbook', {
  useNewUrlParser: true,
  useCreateIndex: true,
})
  .then(() => console.log('Successfully connected.'),
    err => console.log(`Error connecting to database: ${err}`));

setTimeout(() => { // give mongoose time to connect
  // Entry.find({ name: 'Markus' }, (err, entries) => {
  //   if (err) console.log(err);
  //   entries.forEach(entry => console.log(entry));
  // });
  // Entry.findOne({ name: 'Markus' })
  //   .then(entry => console.log(`Entry is ${entry}`),
  //     err => console.log(`Encountered an error: ${err}`));
  Entry
    .find({ name: 'Markus' })
    .limit(3)
    .sort({ date: 'desc' })
    .exec((err, entries) => console.log(entries));
}, 1000);
