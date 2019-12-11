const express = require('express');

const HTTP_PORT = 3030;

const app = express();

app.listen(HTTP_PORT, () => console.log(`Listening on port ${HTTP_PORT}`));
