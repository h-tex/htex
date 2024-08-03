import readingTime from "reading-time";
export * from "./filters/urls.js";
export * from "./filters/format.js";
export * from "./filters/debug.js";

export function is (value, type) {
	return Object.prototype.toString.call(value) === `[object ${type}]`;
}

export function reading_time (text) {
	if (!text) {
		return;
	}

	// Strip HTML comments
	text = text.replace(/<!--.*?-->/gs, "");

	return readingTime(text, {
		wordsPerMinute: 350
	});
}

export function findItemById (collection, id) {
	return collection.find(item => item.data.id === id);
}
