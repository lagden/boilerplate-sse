function name(custom, eventName = 'sse:data') {
	if (custom) {
		eventName = `${eventName}:${custom}`
	}
	return eventName
}

export default name
