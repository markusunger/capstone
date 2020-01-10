// Node internal module import
const http = require('http');

// yarn package import
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();

app.disable('x-powered-by');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
})
  .catch((error) => {
    console.log(`Error connecting to database. ${error}`);
  });


module.exports = () => {
  const server = http.createServer(app);
  server.listen(process.env.HTTP_PORT, () => console.log(`Server listening on port ${process.env.HTTP_PORT}`));
};
