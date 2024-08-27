export function defaultTokenRender (tokens, idx, options, env, self) {
	return self.renderToken(tokens, idx, options);
};

export function renderBefore (md, token, callback) {
	if (arguments.length === 2 && typeof token === "object") {
		// Overriding multiple tokens
		for (let key in token) {
			renderBefore(md, key, token[key]);
		}
		return;
	}

	let defaultRender = md.renderer.rules[token] || defaultTokenRender;

	return md.renderer.rules[token] = (tokens, idx, options, env, self) => {
		let ret = callback(tokens[idx], tokens, idx, options, env, self);

		if (ret !== undefined) {
			return ret;
		}

		return defaultRender(tokens, idx, options, env, self);
	}
}
