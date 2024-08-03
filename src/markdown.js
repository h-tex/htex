import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItPrism from "markdown-it-prism";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMathjax3 from "markdown-it-mathjax3";
import markdownItDeflist from "markdown-it-deflist";
import markdownItTableCaptions from "markdown-it-table-captions";

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
		md.use(markdownItFootnote, options.footnotes);

		md.renderer.rules.footnote_caption = function (tokens, idx) {
			let n = Number(tokens[idx].meta.id + 1).toString();

			if (tokens[idx].meta.subId > 0) {
				n += `:${ tokens[idx].meta.subId }`;
			}

			return `${n}`;
		}

		const backrefLabel = 'back to text';

		const epubRules = {
			footnote_ref: ['<a', '<a epub:type="noteref"'],
			footnote_open: ['<li', '<li epub:type="footnote"'],
			footnote_anchor: ['<a', `<a aria-label="${backrefLabel}"`],
		}

		Object.keys(epubRules).map(rule => {
			let defaultRender = md.renderer.rules[rule];
			md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
				return defaultRender(tokens, idx, options, env, self).replace(...epubRules[rule]);
			}
		});
		// md.renderer.rules.footnote_ref = function (tokens, idx, options, env, slf) {
		// 	const id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
		// 	const caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);
		// 	let refid = id;

		// 	if (tokens[idx].meta.subId > 0) {
		// 		refid += `:${tokens[idx].meta.subId}`
		// 	}

		// 	return `<sup class="footnote-ref"><a href="#fn${id}" id="fnref${refid}">${caption}</a></sup>`
		// };
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