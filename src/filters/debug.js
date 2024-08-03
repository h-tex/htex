export function keys (obj) {
	if (!obj) {
		return null;
	}

	return Object.keys(obj);
}

export function values (obj) {
	if (!obj) {
		return null;
	}

	return Object.values(obj);
}
export function jsonify (obj, indent = "\t") {
	return JSON.stringify(obj, null, indent);
}

export function log (content, ...args) {
	console.log(...args, content);
	return content;
}

// Dump as JSON, without errors for circular references and with pretty-printing
export function dump2 (obj, browser) {
	let cache = new WeakSet();

	let json = JSON.stringify(obj, (key, value) => {
		if (typeof value === "object" && value !== null) {
			// No circular reference found

			if (cache.has(value) || key === "templateContent") {
				return; // Circular reference found!
			}

			cache.add(value);
		}

		return value;
	}, "\t");

	if (browser) {
		return `<script>console.log(${json})</script>`;
	}

	return `<pre class="language-json">${json}</pre>`
}
