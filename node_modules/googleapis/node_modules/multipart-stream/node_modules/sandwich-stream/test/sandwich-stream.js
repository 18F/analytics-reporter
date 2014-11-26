var test = require('tape');
var sandwichStream = require('..');
var PassThrough = require('stream').PassThrough;

test('Emits error if no streams added', function (t) {
  var ss = sandwichStream();
  ss.on('error', function (err) {
    t.equal(err.message, 'SandwichStream no streams added error');
    t.end();
  });
  ss.read();
});

test('Emits content of 1 stream', function (t) {
  var ss = sandwichStream();
  var pt = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.on('data', output.push.bind(output));
  ss.on('end', function () {
    t.equal(Buffer.concat(output).toString(), 'Content of 1 stream');
    t.end();
  });

  pt.write('Content ');
  process.nextTick(function () {
    pt.write('of 1 stream');
    process.nextTick(function () {
      pt.end();
    });
  });
});

test('Emits content of 2 streams', function (t) {
  var ss = sandwichStream();
  var pt = new PassThrough();
  var pt2 = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.add(pt2);
  ss.on('data', output.push.bind(output));
  ss.on('end', function () {
    t.equal(Buffer.concat(output).toString(), 'Content of 1 stream followed by another');
    t.end();
  });

  pt.write('Content ');
  process.nextTick(function () {
    pt.write('of 1 stream');
    process.nextTick(function () {
      pt2.write(' followed ');
      pt.end();
      process.nextTick(function () {
        pt2.write('by another');
        process.nextTick(function () {
          pt2.end();
        });
      });
    });
  });
});

test('Emits errors from sub-streams', function (t) {
  var ss = sandwichStream();
  var pt = new PassThrough();

  ss.add(pt);
  ss.on('error', function (err) {
    t.equal(err.message, 'Sub-stream error message');
    t.end();
  });
  ss.read();
  pt.emit('error', new Error('Sub-stream error message'));
});

test('Prepends a header at the start of a stream', function (t) {
  var ss = sandwichStream({
    head: 'HEAD'
  });
  var pt = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.on('data', output.push.bind(output));
  ss.on('end', function () {
    t.equal(Buffer.concat(output).toString(), 'HEAD before the content');
    t.end();
  });
  pt.end(' before the content');
});

test('Appends a footer at the end of a stream', function (t) {
  var ss = sandwichStream({
    tail: 'TAIL'
  });
  var pt = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.on('data', output.push.bind(output));
  ss.on('end', function () {
    t.equal(Buffer.concat(output).toString(), 'After the content is the TAIL');
    t.end();
  });
  pt.end('After the content is the ');
});

test('Separates each stream with content', function (t) {
  var ss = sandwichStream({
    separator: new Buffer(' ... ')
  });
  var pt = new PassThrough();
  var pt2 = new PassThrough();
  var pt3 = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.add(pt2);
  ss.add(pt3);
  ss.on('data', output.push.bind(output));
  ss.on('end', function () {
    t.equal(Buffer.concat(output).toString(), '1 ... 2 ... 3');
    t.end();
  });
  pt.end('1');
  pt2.end('2');
  pt3.end(new Buffer('3'));
});

test('Pipes', function (t) {
  var ss = sandwichStream({
    head: '=====\n',
    separator: '\n',
    tail: '\n-----'
  });
  var pt = new PassThrough();
  var pt2 = new PassThrough();
  var pt3 = new PassThrough();
  var pipeOut = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.add(pt2);
  ss.add(pt3);
  pipeOut.on('data', output.push.bind(output));
  pipeOut.on('end', function () {
    t.equal(Buffer.concat(output).toString(), '=====\n1\n2\n3\n-----');
    t.end();
  });
  pt.end(new Buffer('1'));
  pt2.end('2');
  pt3.end('3');
  ss.pipe(pipeOut);
});

test('Throws error if you add a stream while streaming', function (t) {
  var ss = sandwichStream();
  var pt = new PassThrough();
  var pt2 = new PassThrough();
  var output = [];

  ss.add(pt);
  ss.on('data', output.push.bind(output));

  pt.write('Content ');
  process.nextTick(function () {
    try {
      ss.add(pt2);
    }
    catch (err) {
      t.equal(err.message, 'SandwichStream error adding new stream while streaming');
      t.end();
    }
  });
});

test('Exposes the SandwichStream class', function (t) {
  var ss = sandwichStream();
  t.ok(ss instanceof sandwichStream.SandwichStream);
  t.end();
});
