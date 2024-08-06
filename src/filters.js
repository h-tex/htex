import readingTime from "reading-time";
export * from "./filters/urls.js";
export * from "./filters/format.js";

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
