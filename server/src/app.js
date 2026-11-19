const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { clientOrigins } = require('./config');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(helmet());
app.use(cors({ origin: clientOrigins() }));
app.use(express.json({ limit: '100kb' }));

app.get('/', (req, res) => res.json({ service: 'DevConnector API', status: 'UP' }));
app.get('/api/health', (req, res) => res.json({ status: 'UP' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/posts', require('./routes/posts'));
app.use((req, res) => res.status(404).json({ message: 'Not found' }));
app.use(errorHandler);

module.exports = app;
