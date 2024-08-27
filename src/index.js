import md from "./markdown.js";
import * as plugins from "./plugins.js";
import * as filters from "./filters.js";

export default function (config, options = {}) {
	for (let name in filters) {
		if (typeof filters[name] === "function" && !config.getFilter(name)) {
			config.addFilter(name, filters[name]);
		}
	}

	config.addPlugin(md, options.markdown);

	for (let pluginId in plugins) {
		if (options[pluginId] !== false) {
			config.addPlugin(plugins[pluginId], options[pluginId]);
		}
	}

	if (options.serverPort) {
		config.setServerOptions({
			port: options.serverPort
		});
	}
}

export { filters };
