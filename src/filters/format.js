
let defaultNumberFormatter = new Intl.NumberFormat("en-US");

export function number (n, options) {
	let formatter = options ? new Intl.NumberFormat(options.locale ?? "en-US", options) : defaultNumberFormatter;
	return formatter.format(n);
}

let defaultDateParts = {
	year: "numeric",
	month: "short",
	day: "numeric",
	weekday: "short",
	hour: "numeric",
	minute: "numeric",
	second: "numeric",
	timezone: "short",
};

export function date (date, format = "long") {
	try {
		date = new Date(date);
	}
	catch (e) {
		return `Invalid date (${date})`
	}

	if (format == "iso") {
		return date.toISOString().substring(0, 10);
	}

	let options = format;

	if (Array.isArray(format)) {
		options = format.reduce((acc, f) => {
			acc[f] = defaultDateParts[f];
			return acc;
		}, {});
	}
	else if (typeof format === "string") {
		if (["full", "long", "medium", "short"].includes(format)) {
			options = { dateStyle: format };
		}
		else if (format in defaultDateParts) {
			options = { [format]: defaultDateParts[format] };
		}
	}

	return date.toLocaleString("en-us", options);
}
