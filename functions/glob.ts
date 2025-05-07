import FastGlob from "fast-glob";
import { defineChatSessionFunction } from "node-llama-cpp";

export const glob = defineChatSessionFunction({
	description: `
    - Finds files by their name using a glob pattern
    - Does not find files by their content, only their name
    - Returns a string array of file paths.
  `,
	params: {
		type: "object",
		properties: {
			pattern: {
				type: "string",
				description: `
          - The glob pattern to search for
          - An asterisk (*) — matches everything except slashes (path separators), hidden files (names starting with .).
          - A double star or globstar (**) — matches zero or more directories.
          - Question mark (?) – matches any single character except slashes (path separators).
          - Sequence ([seq]) — matches any character in sequence.
          - src/**/*.js — matches all files in the src directory (any level of nesting) that have the .js extension.
          - src/*.?? — matches all files in the src directory (only first level of nesting) that have a two-character extension.
          - file-[01].js — matches files: file-0.js, file-1.js.
          - src/**/*.{css,scss} — matches all files in the src directory (any level of nesting) that have the .css or .scss extension.
          - file-[[:digit:]].js — matches files: file-0.js, file-1.js, …, file-9.js.
          - file-{1..3}.js — matches files: file-1.js, file-2.js, file-3.js.
          - file-(1|2).js — matches files: file-1.js, file-2.js.
        `,
			},
		},
	},

	async handler(params) {
		console.log(`glob(${JSON.stringify(params)})`);

		return await FastGlob(params.pattern, { dot: true });
	},
});
