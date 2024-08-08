import markdownIt from "markdown-it";
import markdownItAttrs from "markdown-it-attrs";
import markdownItPrism from "markdown-it-prism";
import markdownItFootnote from "markdown-it-footnote";
import markdownItMathjax3 from "markdown-it-mathjax3";
import markdownItDeflist from "markdown-it-deflist";
import markdownItTableCaptions from "markdown-it-table-captions";
import markdownItBracketedSpans from "markdown-it-bracketed-spans";
import markdownItSup from "markdown-it-sup";
import markdownItSub from "markdown-it-sub";

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

		let allFootnotes = new Map(); // pageId → { label: footnote }

		/**
		 * Extract and store footnote texts from a given set of tokens for a specific page
		 * so that footnotes can be referenced and/or displayed appropriately in different document parts.
		 * For example, it allows the markdown-it-footnote plugin and Paged.js to process the same footnotes correctly.
		 * @param {markdownIt.Token[]} tokens
		 * @param {string} pageId
		 */
		function extractFootnoteTexts (tokens, pageId) {
			let footnotes = allFootnotes.get(pageId) ?? {};

			let label, done;
			for (let token of tokens) {
				if (token.type === "footnote_open") {
					// We have a new footnote to process
					done = false;
					label = token.meta.label;
					footnotes[label] = "";
				}
				else if (token.type === "footnote_close") {
					done = true;
				}
				else if (done === false && token.content) {
					// Tokens of all other types after “footnote_open” till “footnote_close” form a footnote text
					footnotes[label] += token.content;
				}
			}

			allFootnotes.set(pageId, footnotes);
		};

		// Override the render method to capture footnote texts
		md.render = function (src, env) {
			let tokens = md.parse(src, env);

			let pageId = env.id;
			if (pageId) {
				extractFootnoteTexts(tokens, pageId);
			}

			return md.renderer.render(tokens, md.options, env);
		};

		md.renderer.rules.footnote_caption = function (tokens, idx) {
			let n = Number(tokens[idx].meta.id + 1).toString();

			if (tokens[idx].meta.subId > 0) {
				n += `:${ tokens[idx].meta.subId }`;
			}

			return `${n}`;
		}

		const backrefLabel = 'back to text';

		const epubRules = {
			footnote_open: ['<li', '<li epub:type="footnote"'],
			footnote_anchor: ['<a', `<a aria-label="${backrefLabel}"`],
		}

		Object.keys(epubRules).map(rule => {
			let defaultRender = md.renderer.rules[rule];
			md.renderer.rules[rule] = (tokens, idx, options, env, self) => {
				return defaultRender(tokens, idx, options, env, self).replace(...epubRules[rule]);
			}
		});

		// Code from https://github.com/markdown-it/markdown-it-footnote/blob/fe6c169c72b9f4d6656b10aa449128456f5a990e/index.mjs#L25-L33
		md.renderer.rules.footnote_ref = function (tokens, idx, options, env, slf) {
			let id = slf.rules.footnote_anchor_name(tokens, idx, options, env, slf);
			let caption = slf.rules.footnote_caption(tokens, idx, options, env, slf);

			let refId = id;
			if (tokens[idx].meta.subId > 0) {
				refId += `:${tokens[idx].meta.subId}`;
			}

			let footnotes = allFootnotes.get(env.id);
			let footnoteLabel = tokens[idx].meta.label;
			let footnoteText = footnotes[footnoteLabel];
			footnoteText = md.renderInline(footnoteText);
			footnoteText = `<span class="footnote-text inline" hidden>${footnoteText}</span>`

			return `<sup class="footnote-ref"><a epub:type="noteref" href="#fn${id}" id="fnref${refId}">${caption}</a></sup>${footnoteText}`
		};
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