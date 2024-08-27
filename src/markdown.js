import * as plugins from "./md/plugins.js";
import * as localPlugins from "./md/plugins-local.js";

import { init } from "./md/util.js";

export default function (...args) {
	let { md, eleventy, options } = init(...args);

	for (let pluginId in plugins) {
		if (options[pluginId] !== false) {
			md.use(plugins[pluginId], options[pluginId]);
		}
	}

	for (let pluginId in localPlugins) {
		if (options[pluginId] !== false) {
			localPlugins[pluginId](md, options[pluginId]);
		}
	}

	if (eleventy) {
		// 11ty mode
		eleventy.setLibrary("md", md);

		eleventy.addPairedShortcode("md", function (content) {
			return md.render(content);
		});

		eleventy.addFilter("md", (value, o = {}) => {
			if (typeof value !== "string") {
				if (value instanceof String) {
					value = value + "";
				}
				else {
					return value;
				}
			}

			let ret = md.render(value, o);

			// if (o.url) {
			// 	ret = filters.relativize_urls(ret, o.url);
			// }

			return ret;
		});

		eleventy.addFilter("md_inline", (value) => {
			if (typeof value !== "string") {
				return value;
			}

			return md.renderInline(value);
		});
	}
};
