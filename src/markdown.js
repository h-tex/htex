import markdownIt from "markdown-it";
import markdownItPrism from "markdown-it-prism";
import * as plugins from "./md/plugins.js";

import footnotes from "./md/footnotes.js";
import betterLinkify from "./md/better-linkify.js";

function isMarkdownIt (value) {
	return value && value.use && value.renderer;
}

function isEleventyConfig (value) {
	return value && value.setLibrary && value.addFilter && value.addPairedShortcode;
}

export default function (config, options = {}) {
	let md, eleventy;

	if (isEleventyConfig(config)) {
		eleventy = config;
	}
	else if (isMarkdownIt(config)) {
		md = config;
	}
	else if (!options) {
		options = config;
	}
	else {
		throw new Error("[htex] Cannot interpret first argument:", config);
	}

	md ??= options.instance ?? markdownIt({
		html: true,
		linkify: true,
		typographer: true,
		...(options.markdownIt ?? {}),
	}).disable("code");

	if (options.betterLinkify !== false && options.linkify !== false) {
		betterLinkify(md, options.betterLinkify);
	}

	if (options.footnotes !== false) {
		footnotes(md, options.footnotes);
	}

	for (let pluginId in plugins) {
		if (options[pluginId] !== false) {
			md.use(plugins[pluginId], options[pluginId]);
		}
	}

	if (options.codeHighlight !== false) {
		md.use(markdownItPrism, {
			plugins: ["normalize-whitespace"],
			...(options.codeHighlight ?? {}),
		});
	}

	if (eleventy) {
		// 11ty mode
		eleventy.setLibrary("md", md);

		eleventy.addPairedShortcode("md", function (content) {
			return md.render(content);
		});

		eleventy.addFilter("md", (value, o = {}) => {
			if (typeof value !== "string") {
				if (value instanceof String) {
					value = value + "";
				}
				else {
					return value;
				}
			}

			let ret = md.render(value, o);

			// if (o.url) {
			// 	ret = filters.relativize_urls(ret, o.url);
			// }

			return ret;
		});

		eleventy.addFilter("md_inline", (value) => {
			if (typeof value !== "string") {
				return value;
			}

			return md.renderInline(value);
		});
	}
};
