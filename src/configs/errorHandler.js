module.exports = function(app) {
  app.use(function(err, req, res, next) {
    switch (err.name) {
      case 'database': {
        console.log('Database Error');
        break;
      }
      case 'pageNotFound': {
        res.status(err.status);
        res.send('404');
        return next();
      }
      case 'unauthorize': {
        res.status(err.status);
        res.render('error/unauthorize', {
          detail: err.detail,
        });
        return next();
      }
      case 'tokenInvalid': {
        require('../modules/userModule').logout(req, res);
      }
      case 'formValueInvalid': {
        res.status(err.status);
        res.json({
          errors: [
            {
              title: err.title || '',
              detail: err.detail || '',
            },
          ],
          validationErrors: err.validationErrors,
        });
        return next();
      }
      default: {
        console.log('Unknown Error:', err.name);
        console.log(err.stack);
      }
    }

    res.status(err.status || 500);

    // send the error
    if (req.xhr || req.get('content-type') == 'application/json') {
      res.json({
        errors: [
          {
            title: err.title || '',
            detail: err.detail || '',
          },
        ],
      });

    // default error reporting page
    } else {
      res.render('error/report', {
        message: err.title,
        stack: err.stack,
      });
    }
  });
};