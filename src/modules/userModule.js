var jwt = require('jwt-simple');
var moment = require('moment');
var settings = require('../configs/settings');
var errors = require('../errors/');

module.exports = {
  middleware: {
    /**
     * Parse bearer token and
     * mount `req.token` and `req.user`
     *
     * @param {object} opts
     *  - The option object with default format below:
     *
     *    {
     *      cookieKey: 'token',
     *      headerKey: 'Bearer',
     *      queryKey: 'access_token',
     *      bodyKey: 'access_token',
     *    }
     *
     *    and will be parsed in order
     *
     * @returns {function}
     *  - A middleware function
     */
    tokenParser: function(opts) {
      if (!opts) {
        opts = {};
      }
      var cookieKey = opts.cookieKey || 'access_token';
      var queryKey  = opts.queryKey  || 'access_token';
      var bodyKey   = opts.bodyKey   || 'access_token';
      var headerKey = opts.headerKey || 'Bearer';

      return function(req, res, next) {
        var bearerToken;

        // extract token from cookie
        if (req.cookies && req.cookies[cookieKey]) {
          bearerToken = req.cookies[cookieKey];

        // extract token from header
        } else if (req.headers && req.headers.authorization) {
          var parts = req.headers.authorization.split(' ');
          if (parts.length === 2 && parts[0] === headerKey) {
            bearerToken = parts[1];
          } else {
            throw new errors.tokenInvalid();
          }

        // extract token from query parameter
        } else if (req.query && req.query[queryKey]) {
          bearerToken = req.query[queryKey];

        // extract token from form value
        } else if (req.body && req.body[bodyKey]) {
          bearerToken = req.body[bodyKey];
        }

        // token exist, parse it
        if (bearerToken) {

          // well-formed token
          try {
            var decoded = jwt.decode(
              bearerToken,
              settings.user.bearerToken.secret
            );

            // token expired
            if (decoded.expiration <= Date.now()) {
              throw new errors.tokenExpiration();

            // token does not expire
            } else {
              req.token = bearerToken;
              req.user = decoded.user;
              next();
            }

          // malformed token
          } catch (err) {
            throw new errors.tokenInvalid();
          }

        // token does not exist, pass through it
        } else {
          next();
        }
      };
    },

    requireLogin: function(req, res, next) {
      if (req.token || req.user) {
        next();
      } else {
        throw new errors.unauthorize();
      }
    },
  },

  /**
   * Generate bearer token of some user
   *
   * @param {object} user
   *  - The user object retrieved from UserModel
   *
   * @returns {string}
   *  - A jwt token
   */
  generateBearerToken: function(user) {
    var token = jwt.encode({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      expiration: moment()
        .add(
          settings.user.bearerToken.expiration.split(' ')[0],
          settings.user.bearerToken.expiration.split(' ')[1]
        )
        .valueOf(),
    }, settings.user.bearerToken.secret);

    return token;
  },
  login: function(req, res, token) {
    res.cookie('access_token', token);
  },
  logout: function(req, res) {
    res.clearCookie('access_token');
  },
};