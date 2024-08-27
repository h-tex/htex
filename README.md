# hTex /eɪtʃtɛx/

A collection of markdown-it and eleventy plugins for hassle-free academic writing.
Largely compatible with the [Pandoc Markdown](https://pandoc.org/MANUAL.html#pandocs-markdown) syntax.
All plugins are enabled by default but can be disabled individiually, by passing in `false` for the corresponding option.
They can also be configured by passing a settings object.

## Installation

```bash
npm i htex
```

### As 11ty plugin

```js
import htex from 'htex/eleventy';
```

```js
eleventyConfig.use(htex, { /* options */ });
```

### Just the markdown-it plugins

If you don’t use 11ty, you can still use the markdown-it plugins.
There are two ways to do that: if you don’t already have a markdown instance,
you can simply get one back from hTex:

```js
import htex from "htex/markdown-it";

let md = htex({ /* options */ });
```

If you already have a markdown-it instance, you can add the plugins to it:

```js
import htex from "htex/markdown-it";
htex(md, { /* options */ });
```

or:

```js
import htex from "htex/markdown-it";
htex({
	instance: md,
	/* options */
});
```

## Plugins

### Eleventy

| Plugin | Option | Description |
|--------|--------|-------------|
| [eleventy-plugin-citations](https://npmjs.com/package/eleventy-plugin-citations) | `citations` | Citations and bibliographies. |
| [eleventy-plugin-outline](https://npmjs.com/package/eleventy-plugin-outline) | `outline` | Section & figure numbers, tables of content, heading anchors, and many more. |
| Todos | `todos` | Picks up todos from HTML comments, formats them nicely, and summarizes them in a separate file, by priority or by file. |
| Image dimensions | `imageDimensions` | Adds CSS custom properties for images' intrinsic width and height. |

### Markdown plugins

You can _just_ add the Markdown plugins by using the `htex/markdown` export.

| Plugin | Option | Description |
|--------|--------|-------------|
| [markdown-it-attrs](https://npmjs.com/package/markdown-it-attrs) | `attrs` | Add classes, IDs, and attributes to elements. |
| [markdown-it-prism](https://npmjs.com/package/markdown-it-prism) | `codeHighlight` | Syntax highlighting (using PrismJS) |
| [markdown-it-mathjax3](https://npmjs.com/package/markdown-it-mathjax3) | `math` | Math rendering (using MathJax 3). |
| [markdown-it-deflist](https://npmjs.com/package/markdown-it-deflist) | `definitionLists` | Definition lists. |
| [markdown-it-table-captions](https://npmjs.com/package/markdown-it-table-captions) | `tableCaptions` | Table captions. |
| [markdown-it-footnote](https://npmjs.com/package/markdown-it-footnote) | `footnote` | Footnotes. |
| [markdown-it-bracketed-spans](https://npmjs.com/package/markdown-it-bracketed-spans) | `spans` | Concise bracketed spans. |
| [markdown-it-sup](https://npmjs.com/package/markdown-it-sup) | `sup` | Superscripts using `^`. |
| [markdown-it-sub](https://npmjs.com/package/markdown-it-sub) | `sub` | Subscripts using `~`. |
