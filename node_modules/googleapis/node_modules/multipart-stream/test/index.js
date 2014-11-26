var test = require('tape')
var Multipart = require('../')
var PassThrough = require('stream').PassThrough

test('works', function(t) {
	t.plan(6)

	var expected = "--{boundary}\r\nSome-Header: I'm here!\r\nAnother-One: Me as well\r\n\r\nstring\r\n--{boundary}\r\n\r\nbuffer\r\n--{boundary}\r\nbody-type: stream\r\n\r\nbody!\nend.\r\n--{boundary}\r\n\r\n\r\n--{boundary}--"

	var mp = new Multipart('{boundary}')

	t.doesNotThrow(function() {
		mp.addPart({
			headers: {
				'Some-Header': 'I\'m here!',
				'Another-One': 'Me as well'
			},
			body: 'string'
		})
	}, 'headers and string body')
	
	t.doesNotThrow(function() {
		mp.add({
			body: new Buffer('buffer')
		})
	}, 'no headers and buffer body')

	t.doesNotThrow(function() {
		var bodyStream = new PassThrough()
		bodyStream.write('body!\n')
		
		mp.add({
			headers: {
				'body-type': 'stream'
			},
			body: bodyStream
		})
		
		bodyStream.end('end.')
	}, 'one header and stream body')

	t.doesNotThrow(function() {
		mp.add()
	}, 'empty part')

	var data = ''
	mp.on('data', function(d) {
		data += d
	}).on('end', function() {
		t.ok(data = data.toString(), 'end called after data was emitted')
		t.equal(data, expected)
	})
})

test('boundary', function(t) {
	var mp = new Multipart('boundary')
	t.equal(mp.boundary, 'boundary', 'mp.boundary exposed')
	
	var mp2 = new Multipart()
	t.ok(mp2.boundary && typeof mp2.boundary === 'string',
		'boundary automatically generated if not supplied')

	t.end()
})