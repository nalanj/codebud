import { spawnSync } from "node:child_process";
import { rgPath } from "@vscode/ripgrep";
import { defineChatSessionFunction } from "node-llama-cpp";

export const ripgrep = defineChatSessionFunction({
	description: `
    - Find files in the current directory that match a given regular expression.
    - Returns a string array of file paths.
  `,
	params: {
		type: "object",
		properties: {
			regex: {
				type: "string",
				description: `
          - The regular expression pattern to search for. 
          - Don't worry about escaping the pattern
          - Don't worry aboutleading or trailing slashes.
        `,
			},
			include: {
				oneOf: [
					{
						type: "string",
						description:
							"The file patterns to include in the search, e.g. *.js, *.ts",
					},
					{
						type: "null",
					},
				],
			},
		},
	},

	async handler(params) {
		console.log(`ripgrep(${JSON.stringify(params)})`);

		const args = ["-li", params.regex];

		if (params.include) {
			args.push("--glob", params.include);
		}

		const rgResults = spawnSync(rgPath, args, {
			cwd: process.cwd(),
			stdio: ["ignore", "pipe", "pipe"],
			timeout: 10000,
		});

		const results = rgResults.stdout?.toString().split("\n") || [];

		return results;
	},
});
