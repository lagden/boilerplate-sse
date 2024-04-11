import {createServer} from 'node:http'
import gracefulShutdown from 'http-graceful-shutdown'
import listen from 'test-listen'
import app from '../../server/app.js'

export async function start() {
	const server = createServer(app.callback())
	const prefixUrl = await listen(server)
	return {
		server,
		prefixUrl,
	}
}

export function stop(server) {
	gracefulShutdown(server, {
		forceExit: true,
	})
}
