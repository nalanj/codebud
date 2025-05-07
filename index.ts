#!/usr/bin/env node
import os from "node:os";
import path from "node:path";
import { LlamaChatSession, getLlama, resolveModelFile } from "node-llama-cpp";
import functions from "./functions/index.js";

if (!process.argv[2]) {
	console.error("Please provide a prompt as the first argument.");
	process.exit(1);
}

process.on("SIGINT", () => {
	console.log("SIGINT received. Exiting...");
	process.exit(0);
});

const configDir = path.join(os.homedir(), ".config", "codebud");
const modelDir = path.join(configDir, "models");

// medium model
//const modelUri = "hf:mradermacher/DeepSeek-R1-Distill-Qwen-14B-GGUF:Q4_K_M";

// small model
const modelUri = "hf:mradermacher/DeepSeek-R1-Distill-Qwen-7B-GGUF:Q4_K_M";

// large model
// const modelUri = "hf:mradermacher/DeepSeek-R1-Distill-Qwen-32B-GGUF:Q4_K_M";

console.log("Loading model...");
const llama = await getLlama();
const model = await llama.loadModel({
	modelPath: await resolveModelFile(modelUri, modelDir),
	defaultContextFlashAttention: true,
});

console.log("Creating context...");
const context = await model.createContext();
const session = new LlamaChatSession({
	contextSequence: context.getSequence(),
});

console.log("Submitting prompt...");
const a1 = await session.promptWithMeta(
	`
		Background:
			- You are a helpful programming assistant.
			- You're able to call the available functions to help the user with their tasks. 
			- You work with fairly advanced programmers, so you can be concise and use technical language.
			- You must always base your answers on the information provided in the task
				and the state of the codebase as provided by the results of the given functions.
			- The progammers you work with want you to bias toward actions. Call functions
				when needed and answer their questions explicity.
		Task:
			${process.argv[2]}
	`,
	{
		functions,
		onResponseChunk(chunk) {
			const isThoughtSegment =
				chunk.type === "segment" && chunk.segmentType === "thought";

			if (chunk.type === "segment" && chunk.segmentStartTime != null)
				process.stdout.write(` [segment start: ${chunk.segmentType}] `);

			process.stdout.write(chunk.text);

			if (chunk.type === "segment" && chunk.segmentEndTime != null)
				process.stdout.write(` [segment end: ${chunk.segmentType}] `);
		},
	},
);

const fullResponse = a1.response
	.map((item) => {
		if (typeof item === "string") {
			return item;
		}

		if (item.type === "segment") {
			const isThoughtSegment = item.segmentType === "thought";
			let res = "";

			if (item.startTime != null)
				res += ` [segment start: ${item.segmentType}] `;

			res += item.text;

			if (item.endTime != null) res += ` [segment end: ${item.segmentType}] `;

			return res;
		}

		return "";
	})
	.join("");
