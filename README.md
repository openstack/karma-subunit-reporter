karma-subunit-reporter
======================

Writes Karma results to
[Subunit streams](https://github.com/testing-cabal/subunit) compatible with
Subunit consumers like [stackviz](https://github.com/openstack/stackviz) and
[subunit2sql](https://github.com/openstack-infra/subunit2sql).

Installation
------------

    npm install --save-dev karma-subunit-reporter

Usage
-----

Trivial usage only requires that you install the plugin and then add it as a
reporter in your `karma.conf.js`:

```javascript
module.exports = function(config) {
  config.set({
    // ...

    reporters: ['some', 'other', 'reporters', 'subunit'], // <----

    // ...
  });    
};
```

You can also specify some configuration parameters with the `subunitReporter`
object (defaults are shown below):

```javascript
module.exports = function(config) {
  config.set({
    reporters: ['subunit'],

    // ...

    subunitReporter: {
      outputFile: 'karma.subunit',
      tags: [],      // tag strings to append to all tests
      slug: false,   // convert whitespace to '_'
      separator: '.' // separator for suite components + test name
    }
  });    
};
```
