import markdownItFootnote from "markdown-it-footnote";
import { renderAfter } from "./util.js";

export default function (md, options) {
	md.use(markdownItFootnote, options);

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
		let tokens = this.parse(src, env);

		let pageId = env.id;
		if (pageId) {
			extractFootnoteTexts(tokens, pageId);
		}

		// We don't want every footnote to be parsed and rendered twice,
		// so we render already parsed tokens to ensure no re-parsing or re-rendering occurs.
		// At the same time, we want to avoid any conflicts with other plugins,
		// so we use the original render method to render the tokens.
		return this.renderer.render(tokens, this.options, env);
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

	// Monkey-patch the footnote_ref rule to include the footnote text
	renderAfter(md, "footnote_ref", function (footnoteRef, token, tokens, idx, options, env) {
		let footnotes = allFootnotes.get(env.id);
		let footnoteLabel = token.meta.label;
		let footnoteText = footnotes[footnoteLabel];
		footnoteText = md.renderInline(footnoteText);
		footnoteText = `<span class="footnote-text inline" hidden>${footnoteText}</span>`;

		return footnoteRef + footnoteText
	});
}
