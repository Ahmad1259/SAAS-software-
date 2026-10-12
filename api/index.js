let handleRequest;
let initError = null;

try {
  const server = require('../apps/web/server/index.js');
  handleRequest = server.handleRequest;
} catch (err) {
  initError = {
    message: err.message,
    stack: err.stack,
    code: err.code
  };
}

module.exports = async (req, res) => {
  if (initError) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Server initialization failed', details: initError }));
  }
  return handleRequest(req, res);
};
