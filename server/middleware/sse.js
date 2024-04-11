import * as debug from '@tadashi/debug'
import ee from '@tadashi/ee'
import SSEStream from '../lib/sse-stream.js'
import name from '../lib/name.js'

const ssePool = new Set()

const keepAliveInterval = setInterval(() => {
	debug.info('ssePool size', ssePool.size)
	for (const sse of ssePool) {
		sse.keepAlive()
	}
}, 5000)

ee.on('clearKeepAliveInterval', () => {
	clearInterval(keepAliveInterval)
})

function middleware() {
	return async (ctx, next) => {
		if (ctx.res.headersSent) {
			debug.error('Response headers already sent. Unable to create SSE stream')
			await next()
			return
		}

		ctx.req.socket.setTimeout(0)
		ctx.req.socket.setNoDelay(true)
		ctx.req.socket.setKeepAlive(true)

		ctx.set('Content-Type', 'text/event-stream; charset=utf-8')
		ctx.set('Cache-Control', 'no-cache, no-transform')
		ctx.set('Connection', 'keep-alive')

		const {custom} = ctx.query
		const eventName = name(custom)

		const sse = new SSEStream()
		ssePool.add(sse)

		const listener = data => {
			sse.write(data)
		}

		ee.on(eventName, listener)

		const close = () => {
			if (ssePool.has(sse)) {
				ssePool.delete(sse)
			}

			sse.unpipe()
			sse.destroy()

			ctx.res.end()
			ctx.socket.destroy()

			ee.off(eventName, listener)
		}

		sse.on('close', close).on('error', close)

		ctx.body = sse
	}
}

export default middleware
