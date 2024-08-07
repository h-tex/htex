import fs from "fs";

export default function (config, {
	commentPrefix = ["TODO", "TBD", "ISSUE", "FIXME"],
	priorities = ["P0", "P1", "P2", "P3"],
	efforts = ["XS", "S", "M", "L", "XL"],
	filter = outputPath => true,
	isDuplicate = page => true,
	template = todo => `<article class="callout todo" data-prefix="${ todo.prefix }" data-priority="${ todo.priority ?? "" }" data-effort="${ todo.effort ?? "" }">${ todo.comment }</article>`,
	mdTemplate = todo => {
		let ret = `- [ ] ${ todo.comment }`;
		let extras = [];
		if (todo.priority) {
			extras.push(`Priority: ${ todo.priority }`);
		}
		if (todo.effort) {
			extras.push(`Effort: ${ todo.effort }`);
		}
		if (extras.length > 0) {
			ret += ` (${ extras.join(", ") })`;
		}
		return ret;
	},
	mdTemplatePriority = todo => {
		let ret = `- [ ] ${ todo.comment }`;
		let extras = [`in [\`${ todo.url }\``];

		if (todo.effort) {
			extras.push(`Effort: ${ todo.effort }`);
		}

		return ret + ` (${ extras.join(", ") })`
	},
	summaryFile = "./TODO.md"
} = {}) {

	let byPage = {};
	let byPriority = {};
	let totalCount = 0;
	let annotations = `(?<annotations>(?:\\s+(?:${ [...priorities, ...efforts].join("|") }))*)`;
	let pattern = RegExp(`<!--\\s*(?<prefix>${ commentPrefix.join("|") })${ annotations }\\s+(?<comment>(?!-->).+?)\\s*-->`, "gis");

	function replace (content, pattern) {
		let isPageDuplicate = isDuplicate?.(this.page);
		return content.replaceAll(pattern, (match, prefix, annotations = "", comment) => {
			let todo = { prefix, comment, url: this.page.url };

			if (!isPageDuplicate) {
				(byPage[this.page.url] = byPage[this.page.url] ?? []).push(todo);
			}

			todo.annotations = annotations.trim().split(/\s+/).filter(Boolean);

			for (let annotation of todo.annotations) {
				if (priorities.includes(annotation)) {
					todo.priority = annotation;

					if (!isPageDuplicate) {
						(byPriority[annotation] = byPriority[annotation] ?? []).push(todo);
					}
				}
				else if (efforts.includes(annotation)) {
					todo.effort = annotation;
				}
			}

			if (!isPageDuplicate) {
				totalCount++;
			}

			return template(todo);
		});
	}

	config.addTransform("todo", function (content, outputPath) {
		if (filter?.(outputPath) === false) {
			return content;
		}

		content = replace.call(this, content, pattern);

		return content;
	});

	config.on("eleventy.after", async function() {
		// Run me after the build ends
		if (totalCount > 0) {
			let urls = Object.keys(byPage);
			let priorityBreakdown = priorities.filter(p => byPriority[p]).map(priority => `${ priority }: ${ byPriority[priority].length }`).join(", ");
			priorityBreakdown = priorityBreakdown ? ` (${ priorityBreakdown })` : "";
			let message = `✅ Found ${ totalCount } todos${ priorityBreakdown }`;

			if (urls.length > 1) {
				message += ` across ${ urls.length } pages`;
			}
			else {
				message += ` in ${ urls[0] }`;
			}

			if (summaryFile) {
				let contents = `# To-Dos (generated)\n\n## By page\n\n`;
				contents += urls.map(url => `### In [\`${ url }\`](${ url })\n${ byPage[url].map(mdTemplate).join("\n") }`).join("\n\n");

				if (Object.keys(byPriority).length > 0) {
					contents += "\n\n## By priority";
					contents += priorities.filter(p => byPriority[p]).map(priority => {
						return `\n\n### Priority: ${ priority}\n${ byPriority[priority].map(mdTemplatePriority).join("\n") }`
					}).join("\n");
				}

				fs.writeFileSync(summaryFile, contents);
				message += `. For details see ${ summaryFile }.`;
			}
			else {
				message += ` (${ urls.map(url => `${ url } (${ byPage[url].length })`).join(", ") })`;
			}

			console.warn(message);
		}
		else if (summaryFile) {
			// Check if file exists
			if (fs.existsSync(summaryFile)) {
				fs.writeFileSync(summaryFile, "# To-Dos (generated)\n\nNone! Well done! 🎉");
			}
		}
	});

	let inputPathToUrl;
	config.on("eleventy.contentMap", ({inputPathToUrl: newInputPathToUrl}) => {
		inputPathToUrl = newInputPathToUrl;
	});

	// Run me before --watch or --serve re-runs
	config.on("eleventy.beforeWatch", async (changedFiles) => {
		if (!inputPathToUrl) {
			return;
		}

		for (let inputPath of changedFiles) {
			let url = inputPathToUrl[inputPath];
			delete byPage[url];
		}
	});
}