import bodyparser from 'koa-bodyparser'
import Router from '@koa/router'
import ee from '@tadashi/ee'
import name from '../lib/name.js'
import sse from '../middleware/sse.js'

const router = new Router()

// Emit
function _emit(ctx) {
	const {custom} = ctx.query
	const {body} = ctx.request
	const msg = body?.msg ?? ctx?.params?.msg ?? 'missing msg'
	const eventName = name(custom)
	ee.emit(eventName, {msg})
	ctx.body = {msg}
}

// Clear
function _clear(ctx) {
	ee.emit('clearKeepAliveInterval')
	ctx.body = {clear: true}
}

// prettier-ignore
router
	.get('/sse', sse())
	.get('/clear', _clear)
	.all(['/emit', '/emit/:msg'], bodyparser(), _emit)

export default router
