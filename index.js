// Copyright 2016 Hewlett-Packard Development Company, L.P.
//
// Licensed under the Apache License, Version 2.0 (the "License"); you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.
'use strict';

var fs = require('fs');
var subunit = require('subunit-js');

function SubunitReporter(helper, logger, config) {
  config = config || {};
  var outputFile = config.outputFile || 'karma.subunit';
  var tags = config.tags || [];
  var slug = config.slug || false;
  var separator = config.separator || '.';

  function normalize(parts) {
    if (slug) {
      return parts.map(function(part) {
        return part.replace(/\s+/g, '_');
      });
    } else {
      return parts;
    }
  }

  var normalizeFunction = config.normalize || normalize;

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

    var testId = normalizeFunction(parts).join(separator);

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
