import process from 'node:process'
import {fileURLToPath} from 'node:url'
import www from 'koa-static'
import * as debug from '@tadashi/debug'
import ee from '@tadashi/ee'
import base from '@tadashi/koa-base'
import routes from './routes/routes.js'

// prettier-ignore
const {
	LOG_RESOURCE,
	PUBLIC_DIR = 'public',
} = process.env

/* c8 ignore start */
if (LOG_RESOURCE) {
	await import(LOG_RESOURCE)
}
/* c8 ignore stop */

const publicDir = fileURLToPath(new URL(`../${PUBLIC_DIR}`, import.meta.url))

// prettier-ignore
const app = base({
	error: true,
	cors: {
		credentials: true,
	},
})

// prettier-ignore
app
	.use(www(publicDir))
	.use(routes)
	.on('error', error => {
		debug.error('app', error.message)
		/* c8 ignore start */
		if (error?.log) {
			debug.error('app | log', error.log)
			ee.emit('logger', error.log)
		}
		/* c8 ignore stop */
	})

app.proxy = true

export default app
