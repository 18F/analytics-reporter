# multipart-stream
Simple streaming nodejs module to build http multipart bodies. Use [browserify](https://github.com/substack/browserify) to make it browser-compatible.

[![testling badge](https://ci.testling.com/hendrikcech/multipart-stream.png)](https://ci.testling.com/hendrikcech/multipart-stream)

## install
	npm install multipart-stream

# usage
```javascript
var Multipart = require('multipart-stream')

// returns a readable stream
var mp = new Multipart()

mp.addPart({
	// by default no headers are set
	headers: {
		'Content-Type': 'text/plain'
	},
	// pass either a string, a buffer or a readable stream
	body: 'Simple string'
})

var data = ''
mp.on('data', function(d) {
	data += d
}).on('end', function() {
	console.log(data)
})
```

# test
	npm test

# license
The MIT License (MIT)

Copyright (c) 2014 Hendrik Cech

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.