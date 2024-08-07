import readingTime from "reading-time";
export * from "./filters/urls.js";
export * from "./filters/format.js";

export function reading_time (text, {wpm = 350} = {}) {
	if (!text) {
		return;
	}

	// https://github.com/mozilla/nunjucks/blob/ea0d6d5396d39d9eed1b864febb36fbeca908f23/nunjucks/src/filters.js#L491
	let tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>|<!--[\s\S]*?-->/gi;

	// Strip HTML comments & tags
	text = text.replaceAll(tags, "");

	let ret = readingTime(text, {
		wordsPerMinute: wpm,
	});

	if (ret.minutes > 60) {
		ret.hours = Math.floor(ret.minutes / 60);
		ret.minutes = ret.minutes % 60;
		ret.text = `${ ret.hours } hr ${ Math.ceil(ret.minutes) } min read`;
	}

	return ret;
}
