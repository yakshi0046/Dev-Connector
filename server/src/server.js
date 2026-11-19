const mongoose = require('mongoose');
const app = require('./app');
const { mongoUri } = require('./config');

const port = process.env.PORT || 5000;

mongoose
  .connect(mongoUri())
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
