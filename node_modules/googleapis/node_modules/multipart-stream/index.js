var Sandwich = require('sandwich-stream').SandwichStream
var stream = require('stream')
var inherits = require('inherits')

var CRNL = '\r\n'

module.exports = Multipart

/**
 * Multipart request constructor.
 * @constructor
 * @param {object} [opts]
 * @param {string} [opts.boundary] - The boundary to be used. If omitted one is generated.
 * @returns {function} Returns the multipart stream.
 */
function Multipart(boundary) {
	if(!this instanceof Multipart) {
		return new Multipart(boundary)
	}

	this.boundary = boundary || Math.random().toString(36).slice(2)

	Sandwich.call(this, {
		head: '--' + this.boundary + CRNL,
		tail: CRNL + '--' + this.boundary + '--',
		separator: CRNL + '--' + this.boundary + CRNL
	})

	this._add = this.add
	this.add = this.addPart
}

inherits(Multipart, Sandwich)

/**
 * Adds a new part to the request.
 * @param {object} [part={}]
 * @param {object} [part.headers={}]
 * @param {string|buffer|stream} [part.body=\r\n]
 * @returns {function} Returns the multipart stream.
 */
Multipart.prototype.addPart = function(part) {
	part = part || {}
	var partStream = new stream.PassThrough()

	if(part.headers) {
		for(var key in part.headers) {
			var header = part.headers[key]
			partStream.write(key + ': ' + header + CRNL)
		}
	}

	partStream.write(CRNL)

	if(part.body instanceof stream.Stream) {
		part.body.pipe(partStream)
	} else {
		partStream.end(part.body)
	}

	this._add(partStream)
}