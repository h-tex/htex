import md from "./markdown.js";
import citations from "eleventy-plugin-citations";
import outline from "eleventy-plugin-outline";
import todos from "./todos.js";
import scoped from "./scoped.js";
import imageDimensions from "./image.js";
import * as filters from "./filters.js";


export default function (config, options = {}) {
	for (let name in filters) {
		if (typeof filters[name] === "function" && !config.getFilter(name)) {
			config.addFilter(name, filters[name]);
		}
	}

	config.addPlugin(md, options.markdown);

	if (options.citations !== false) {
		config.addPlugin(citations, options.citations);
	}

	if (options.outline !== false) {
		config.addPlugin(outline, options.outline);
	}

	if (options.imageDimensions !== false) {
		config.addPlugin(imageDimensions);
	}

	if (options.todos !== false) {
		config.addPlugin(todos, options.todos);
	}

	if (options.scoped !== false) {
		config.addPlugin(scoped, options.scoped);
	}

	if (options.serverPort) {
		config.setServerOptions({
			port: options.serverPort
		});
	}
}

export { filters };
