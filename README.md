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
      tags: [],       // tag strings to append to all tests
      slug: false,    // if true, convert whitespace to '_'
      separator: '.', // separator for suite components + test name
      normalize: null // an optional normalization function, see below
    }
  });    
};
```

### Normalizing Test Names

Given that JavaScript's test name formatting conventions are dissimilar to those
in other subunit-supported languages (particularly, Python) it may be desirable
to convert tokens to something that more closely resembles the other languages
in your environment. Additionally, tooling may require that test names be
reasonably well-formed for parsing and categorization purposes.

In all cases, test name tokens are gathered from karma's `suite` field along
with the test's description. For Jasmine tests, `suite` is an ordered list of
enclosing `describe()` strings for each test. The list of tokens (i.e. suites
plus description) are then passed to some mapping function.

If not otherwise configured, this mapping function simply returns the list
of tokens unaltered; however, it can also be configured to perform simple
conversions from Jasmine-style test descriptions to simple, dot-separated
Python-ish test names. If configured with `slug: true`, spaces will be collapsed
and converted to `_`, which yields decent results in some cases.

If more advanced conversion is needed, a custom mapping function can be provided
using the `normalize` parameter, which accepts a list of tokens and returns a
modified list of tokens.

As a final step, mapped tokens are then joined using the `separator` parameter
(`.` by default).

## Tags

The plugin automatically appends certain tags to each test: the browser ID
(`browser-*`) and the spec ID (`spec-*`). If multiple browsers are tested
concurrently these tags can be used to match results across browsers.

Constant tags to apply to all tests can be also be specified using the `tags`
config option. Each string in the list is unconditionally appended to all tests,
and can be used as a potential compatibility measure (for example, to support
tools that assume a `worker-*` tag should exist).

## Output Differences

While in theory this plugin's output should work correctly with all
subunit-compatible tooling, in practice it may violate some assumptions that
can be made safely in other languages.

For one, tests only run in a single worker thread (and unless configured, no
`worker-#` tag is present). Additionally, within the single worker, tests are
(at least potentially) run asynchronously and may have overlapping execution
timelines.

Some other minor differences also exist. Currently file attachments aren't
supported, so log output, error messages, and tracebacks won't be included in
the subunit output. There's also no 'setUpClass' or other events that might be
logged in Python tests.
