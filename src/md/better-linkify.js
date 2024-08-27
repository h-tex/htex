import { renderBefore } from "./util.js";

/**
 * Prettier autolinks
 * @param {import('markdown-it/lib')} md - The markdown-it instance.
 * @param {object} [options]
 */
export default function betterLinkify (md, options) {
	// Variable to track if we're inside a link that could be an autolink
	let linkHref = undefined;

	renderBefore(md, {
		link_open: function (token) {
			let hrefIndex = token.attrIndex("href");
			if (hrefIndex !== -1) {
				linkHref = token.attrs[hrefIndex][1];
			}
		},
		text: function (token) {
			if (linkHref === token.content) {
				// We’re inside an autolink
				token.content = token.content
					.replace(/https?:\/\/(www\.)?/g, "")
					.replace(/\/$/, "")
				;
			}
		},
		link_close: function () {
			linkHref = undefined;
		},
	});
}
