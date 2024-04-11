import {Transform} from 'node:stream'

class SSEStream extends Transform {
	constructor() {
		super({
			writableObjectMode: true,
		})

		this.keepAlive()
	}

	keepAlive() {
		this.push(':\n\n')
	}

	_transform(chunk, encoding, callback) {
		this.push(`data: ${JSON.stringify(chunk)}\n\n`)
		callback()
	}
}

export default SSEStream
