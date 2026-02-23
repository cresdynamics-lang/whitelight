/**
 * Wraps async route handlers so rejections are passed to Express error middleware
 * instead of causing unhandled rejection / process exit.
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { asyncHandler };
