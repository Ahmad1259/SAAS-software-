const { handleRequest } = require('../apps/web/server/index.js');

module.exports = (req, res) => {
  return handleRequest(req, res);
};
