import markdownIt from "markdown-it";

function isMarkdownIt (value) {
	return value && value.use && value.renderer;
}

function isEleventyConfig (value) {
	return value && value.setLibrary && value.addFilter && value.addPairedShortcode;
}

export function init (...args) {
	let md, eleventy, options;

	if (isEleventyConfig(args[0])) {
		eleventy = args[0];
	}
	else if (isMarkdownIt(args[0])) {
		md = args[0];
	}
	else if (!options) {
		options = args[0];
	}
	else {
		throw new Error("[htex] Cannot interpret first argument:", config);
	}

	options ??= args[1] ?? {};
	md ??= options.instance ?? markdownIt({
		html: true,
		linkify: true,
		typographer: true,
		...(options.markdownIt ?? {}),
	}).disable("code");

	return { md, eleventy, options };
}

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
		return ret === undefined ? defaultRender(tokens, idx, options, env, self) : ret;
	}
}

export function renderAfter (md, token, callback) {
	if (arguments.length === 2 && typeof token === "object") {
		// Overriding multiple tokens
		for (let key in token) {
			renderAfter(md, key, token[key]);
		}
		return;
	}

	let defaultRender = md.renderer.rules[token] || defaultTokenRender;

	return md.renderer.rules[token] = (tokens, idx, options, env, self) => {
		let text = defaultRender(tokens, idx, options, env, self);
		let ret = callback(text, tokens[idx], tokens, idx, options, env, self);
		return ret === undefined ? text : ret;
	}
}
