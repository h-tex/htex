import path from "path";

export function isRootRelative (url) {
	return url.startsWith("/");
}

export function isAbsolute (url) {
	return /^[a-z]+:/.test(url);
}

export function relative (url) {
	if (!url) {
		return "";
	}

	if (url?.url) {
		// page object
		url = url.url;
	}

	let pagePath = url.replace(/[^/]+$/, "");
	let ret = path.relative(pagePath, "/");

	return ret || ".";
}

export function absolutize (...urls) {
	let host = this?.ctx.main.domain ?? "https://phd.verou.me";
	let ret = host;
	for (let url of urls.reverse()) {
		ret = new URL(url, ret);
	}

	return ret;
}

export function rebase_url (url, from_base, to_base = this?.page.url) {
	// Use a dummy base URL to ensure the bases are absolute
	let dummyBase = 'https://dummy/';

	// Resolve old_base and new_base to absolute URLs
	let absoluteOldBase = new URL(from_base, dummyBase);
	let absoluteNewBase = new URL(to_base, dummyBase);

	// Convert the url relative to the old base to an absolute URL
	let absoluteUrl = new URL(url, absoluteOldBase);

	// Determine the relative path from the new base
	let relativeUrl = path.relative(absoluteNewBase.pathname, absoluteUrl.pathname);
	let local = absoluteUrl.search + absoluteUrl.hash;

	if (local && !relativeUrl.endsWith("/")) {
		relativeUrl = relativeUrl + "/";
	}

	return relativeUrl + local;
}

export function relativize (url) {
	return rebase_url(url, "/", this.page.url);
}

export const URL_ATTRIBUTES_TO_ELEMENT = {
	src: ["img", "video", "audio", "iframe", "object", "embed", "script", "source"],
	href: ["a", "link", "base"],
	data: ["object"],
	poster: ["video"],
};

export const URL_ELEMENTS = Object.values(URL_ATTRIBUTES_TO_ELEMENT).flat();
export const URL_ATTRIBUTES = Object.keys(URL_ATTRIBUTES_TO_ELEMENT);
export const URL_ELEMENTS_PATTERN = RegExp(`(?<=<(${ URL_ELEMENTS.join("|") })\\s+(?:[^>]*?\\s+)?(${ URL_ATTRIBUTES.join("|") })=")([^"]+)(?=")`, "gisu");

/** Go over embedded resources and make them relative to base_url */
export function relativize_urls (html, content_url) {
	return html.replace(URL_ELEMENTS_PATTERN, (url, tag, attribute) => {
		if (!URL_ATTRIBUTES_TO_ELEMENT[attribute]?.includes(tag) || isAbsolute(url)) {
			return url;
		}

		return rebase_url(url, content_url, this.page.url);
	});
}
