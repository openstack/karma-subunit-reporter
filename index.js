'use strict';

var fs = require('fs');
var subunit = require('node-subunit');

function SubunitReporter(helper, logger, config) {
  config = config || {};
  var outputFile = config.outputFile || 'karma.subunit';
  var tags = config.tags || [];
  var slug = config.slug || false;
  var separator = config.separator || '.';

  var startTime, stream, file;

  this.onRunStart = function(browsers) {
    startTime = new Date().getTime();

    stream = new subunit.ObjectToSubunitStream();
    file = fs.createWriteStream(outputFile);
    stream.pipe(file);
  };

  this.onSpecComplete = function(browser, result) {
    var duration = result.time - startTime;

    var parts = result.suite.slice();
    parts.push(result.description);

    var testId = parts.join(separator);
    if (slug) {
      testId = testId.replace(/\s+/g, '_');
    }

    var status;
    if (result.success) {
      status = 'success';
    } else if (result.skipped) {
      status = 'skip';
    } else {
      status = 'fail';
    }

    var testTags = tags.slice();
    testTags.push('browser-' + browser.id);
    testTags.push('spec-' + result.id.substring(4));

    stream.write({
      testId: testId,
      status: 'inprogress',
      timestamp: new Date(startTime),
      tags: testTags
    });

    stream.write({
      testId: testId,
      status: status,
      timestamp: new Date(startTime + result.time),
      tags: testTags,
      _packet: {
        flags: { runnable: true }
      }
    });

    startTime += result.time;
  };

  this.onRunComplete = function() {
    stream.end();
  };
}

SubunitReporter.$inject = ['helper', 'logger', 'config.subunitReporter'];

module.exports = {
  'reporter:subunit': ['type', SubunitReporter]
};
