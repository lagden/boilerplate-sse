#!/usr/bin/env node

import '../cli/reset.js'

import process from 'node:process'
import {Agent} from 'node:http'
import {setTimeout} from 'node:timers/promises'
import {URL} from 'node:url'
import {after, before, test} from 'node:test'
import assert from 'node:assert/strict'
import got from 'got'
import {start, stop} from './__helper/server.js'

const _options = {
	redirect: 'follow',
	method: 'GET',
}

const headers = new Headers([['Content-Type', 'application/json']])

let server
let prefixUrl

before(async () => {
	;({server, prefixUrl} = await start())
})

after(async () => {
	await setTimeout(1000)
	stop(server)
	process.exit(0)
})

test('/emit/:msg', async () => {
	const r = await globalThis.fetch(`${prefixUrl}/emit/hey`, _options)
	const d = await r.json()

	assert.equal(r.status, 200)
	assert.equal(d.msg, 'hey')
})

test('/emit', async () => {
	const url = new URL(`${prefixUrl}/emit`)
	const r = await globalThis.fetch(url, {
		..._options,
		method: 'POST',
		headers,
		body: JSON.stringify({msg: 'nice!'}),
	})
	const d = await r.json()

	assert.equal(r.status, 200)
	assert.equal(d.msg, 'nice!')
})

// use Deno!
test('sse', (...args) => {
	const [, done] = args
	const agent = new Agent({keepAlive: true})
	const options = {
		agent: {
			http: agent,
		},
		retry: {
			limit: 0,
		},
	}

	const stream = got.stream(`${prefixUrl}/sse/?custom=test`, options)
	stream.on('error', () => {
		assert.ok(true)
		done()
	})

	stream.resume()

	got.get(`${prefixUrl}/emit/go?custom=test`).then(async () => {
		await got.get(`${prefixUrl}/clear`)
		stream.end()
		agent.destroy()
	})
})
