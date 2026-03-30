const { createProxyMiddleware } = require('http-proxy-middleware');

/**
 * Forwards /api/* to the Stripe payment server so the browser only talks to :3000
 * and always gets JSON from Express — not the SPA index.html.
 */
module.exports = function setupProxy(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:3001',
      changeOrigin: true,
    })
  );
};
