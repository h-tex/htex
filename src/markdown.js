import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItPrism from "markdown-it-prism";
import markdownItMathjax3 from "markdown-it-mathjax3";
import markdownItDeflist from "markdown-it-deflist";
import markdownItTableCaptions from "markdown-it-table-captions";
import markdownItBracketedSpans from "markdown-it-bracketed-spans";
import markdownItSup from "markdown-it-sup";
import markdownItSub from "markdown-it-sub";

import footnotes from "./md-footnotes.js";

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
		...(options.markdownIt ?? {}),
		html: true,
		linkify: true,
		typographer: true,
	}).disable("code");

	if (options.footnotes !== false) {
		footnotes(md, options.footnotes);
	}

	if (options.math !== false) {
		md.use(markdownItMathjax3, options.math);
	}

	if (options.attributes !== false) {
		md.use(markdownItAttrs, options.attributes);
	}

	if (options.codeHighlight !== false) {
		md.use(markdownItPrism, {
			plugins: ["normalize-whitespace"],
			...(options.codeHighlight ?? {}),
		});
	}

	if (options.definitionLists !== false) {
		md.use(markdownItDeflist, options.definitionLists);
	}

	if (options.tableCaptions !== false) {
		md.use(markdownItTableCaptions, options.tableCaptions);
	}

	if (options.spans !== false) {
		md.use(markdownItBracketedSpans, options.bracketedSpans);
	}

	if (options.sup !== false) {
		md.use(markdownItSup, options.sup);
	}

	if (options.sub !== false) {
		md.use(markdownItSub, options.sub);
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
