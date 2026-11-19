require('dotenv').config();

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

module.exports = {
  mongoUri: () => required('MONGO_URI'),
  jwtSecret: () => required('JWT_SECRET'),
  clientOrigins: () => (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()),
};
