import fs from "fs";
import path from "path";
import { isAbsolute, rebase_url, relativize_urls } from "./filters/urls.js";

let toArray = v => v === undefined ? v : Array.isArray(v) ? v : [v];

function fixURL (url, pageURL) {
	if (isAbsolute(url)) {
		return url;
	}

	return rebase_url(url, "/", pageURL);
}

export default function (config, {styles = [], js = []} = {}) {
	styles = toArray(styles);
	js = toArray(js);

	function scope (content) {
		let localStyles = styles.map(url => fixURL(url, this.page.url));
		let localJS = js.map(url => fixURL(url, this.page.url));

		return `<div class="shadow-host">
				<template shadowrootmode="open">
					${ localStyles.map(url => `<link rel="stylesheet" href="${ url }">`).join("\n") }
					${ localJS.map(url => `<script src="${ url }" type="module"></script>`).join("\n") }
					${ content }
				</template>
			</div>`;
	}

	config.addFilter("scoped", scope);
	config.addPairedShortcode("scoped", scope);

	config.addShortcode("include_scoped", function (url) {
		if (url.endsWith("/")) {
			url += "index.html";
		}

		// url = "." + this.page.url + url;
		url = "." + path.join(this.page.url, url);

		try {
			var html = fs.readFileSync(url, "utf8");
		}
		catch (e) {
			if (e.code === "ENOENT") {
				console.warn(`[scoped] File not found: ${ url }`);
				return `<!-- File not found: ${ url } -->`;
			}

			throw e;
		}

		config.addWatchTarget(url);

		// Remove the doctype and all elements that are invalid/useless in a fragment
		// This won't remove <meta> elements but whatever, these do no harm
		html = html.replace(/<!DOCTYPE[^>]+>|<\/?html[^>]+>|<\/?head[^>]+>|<\/?body[^>]+>/g, "");

		// Remove <title>
		html = html.replace(/<title[^>]*>.*?<\/title>/g, "");

		html = relativize_urls.call(this, html, url);

		return scope.call(this, html);
	});


}