(function() {

'use strict';

var Client = require('react-engine/lib/client');

// Include all view files. Browerify doesn't do
// this automatically as it can only operate on
// static require statements.
require('../../views/**/*.jsx', {glob: true});

// boot options
var options = {
  // supply a function that can be called
  // to resolve the file that was rendered.
  viewResolver: function(viewName) {
    return require('../../views/' + viewName);
  },
};

document.addEventListener('DOMContentLoaded', function onLoad() {
  Client.boot(options);
});

// @ifdef DEV
document.write(
  ('<script \
    async \
    src="http://HOST:PORT/browser-sync/browser-sync-client.2.7.1.js">\
   <\/script>')
  .replace(
    'HOST:PORT',
    window.location.hostname + ':/* @echo BROWSER_SYNC_SNIPPET_PORT */'
  )
);
// @endif

}());