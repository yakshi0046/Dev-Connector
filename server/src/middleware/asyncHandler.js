// Express 4 does not catch rejected promises, so route handlers are wrapped to forward errors.
module.exports = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
