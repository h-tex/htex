import { imageDimensionsFromData } from "image-dimensions";
import path from "path";
import fs from "fs";

// Assumptions:
// - No unquoted src
// - No quotes in image path
const imageRegex = /<img[^>]*\s+src=["'](?<url>[^"']+)["'][^>]*(?=>)/gm;

export default function (config) {
	config.addTransform("image-dimensions", function (content, outputPath) {
		if (outputPath && outputPath.endsWith(".html") && content.includes("<img")) {
			content = content.replaceAll(imageRegex, (tag, ...args) => {
				let url = args.at(-1)?.url;
				if (url) {
					let base = path.parse(outputPath).dir;
					url = path.resolve(base, url);

					let image;

					try {
						image = fs.readFileSync(url);
					}
					catch (e) {
						if (e.code === "ENOENT") {
							console.warn(`[image-dimensions] Image not found: ${url} (in ${ this.page.url })`);
							return tag;
						}

						throw e;
					}
					let metadata = imageDimensionsFromData(image);
					if (metadata) {
						let { width, height } = metadata;

						let style = `--natural-width: ${width}; --natural-height: ${height};`;

						if (tag.includes("style=")) {
							tag = tag.replace(/style=(?<q>['"])/i, `style=$<q>${ style } `);
						}
						else {
							tag += ` style="${ style }"`;
						}

					}
				}

				return tag;
			});
		}

		return content;
	});
}