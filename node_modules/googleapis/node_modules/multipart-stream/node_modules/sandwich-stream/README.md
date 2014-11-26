# SandwichStream

[![Travis CI Test Status](https://travis-ci.org/connrs/node-sandwich-stream.png)](https://travis-ci.org/connrs/node-sandwich-stream)

While I'm not overjoyed about how performant the internals will operate, I wanted a readable stream that was ACTUALLY A READABLE STREAM. Not a streams1 stream masquerading as streams2. As soon as somebody writes a better concat stream as a readable stream with a nice simple API, this baby is going to develop some serious abandonment issues.

## Installation

    npm install sandwich-stream

## Usage

    var sandwichStream = require('sandwich-stream');
    var ss = sandwichStream({
      head: 'Thing at the top\n',
      tail: '\nThing at the bottom',
      separator: '\n ---- \n'
    });
    ss.add(aStreamIPreparedEarlier);
    ss.add(anotherStreamIPreparedEarlier);
    ss.add(aFurtherStreamIPreparedEarlier);
    ss.pipe(process.stdout);

    // The thing at the top
    //  ---- 
    // Stream1
    //  ---- 
    // Stream2
    //  ---- 
    // Stream3
    // The thing at the bottom

The `head` option takes a string/buffer and pushes the string before all other content

The `foot` option takes a string/buffer and pushes the string after all other data has been pushed

The `separator` option pushes a string/buffer between each stream

Too add a stream use the .add method: `ss.add(streamVariable);`
