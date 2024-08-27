import markdownItPrism from "markdown-it-prism";

export default function (md, options) {
	md.use(markdownItPrism, {
		plugins: ["normalize-whitespace"],
		...(options ?? {}),
	});
};
