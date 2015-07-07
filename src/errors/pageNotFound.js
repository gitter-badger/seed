module.exports = function PageNotFoundError(title, detail) {
  Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.status = 404;
  this.title = title || 'Page not found';
};

require('util').inherits(module.exports, Error);