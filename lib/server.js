/*!
 * Pop - Serves a generated site using Express.
 * Copyright 2011 Alex R. Young
 * MIT Licensed
 */

/**
 * Module dependencies and local variables.
 */
var path = require('path')
  , watch = require('nodewatch')
  , siteBuilder
  , log = require(__dirname + '/log');

/**
 * Instantiates and runs the Express server.
 */
function server() {
  // TODO: Show require express error
  var express = require('express'),
      app = express.createServer();

  app.configure(function() {
    app.use(express.static(siteBuilder.outputRoot));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  // Map missing trailing slashes for posts
  app.get('*', function(req, res) {
    var postPath = siteBuilder.outputRoot + req.url + '/';
    // TODO: Security
    if (req.url.match(/[^/]$/) && fs.existsSync(postPath)) {
      res.redirect(req.url + '/');
    } else {
      res.send('404');
    }
  });

  app.listen(siteBuilder.config.port);
  log.info('Listening on port', siteBuilder.config.port);
}

/**
 * Watches for file changes and regenerates files as required.
 * TODO: Work in progress
 */
function watchChanges() {
  function buildChange(file) {
    log.info('File changed:', file);
    try {
      siteBuilder.buildChange(file);
    } catch (e) {
      log.error('Error building site:', e);
    }
  }

  // TODO: What happens when files/dirs are added?
  siteBuilder.fileMap.files.forEach(function(file) {
    if (file.type === 'dir') {
      watch.add(file.name).onChange(buildChange);
    }
  });
}

module.exports = function(s) {
  siteBuilder = s;
  return {
    run: server
  , watch: watchChanges
  };
};

