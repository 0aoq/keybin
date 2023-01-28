<svelte:options accessors />

<script lang="ts">
	import { onMount } from "svelte";

	export let width: string;
	export let height: string = "20rem";
	export let value: string;
	export let blur: (value: string) => void;
	export let readonly: boolean = false;

	// import codemirror
	import { basicSetup } from "codemirror";
	import { EditorView, keymap, ViewPlugin } from "@codemirror/view";
	import { indentWithTab } from "@codemirror/commands";
	import { EditorState } from "@codemirror/state";

	import { javascript } from "@codemirror/lang-javascript";
	import { html } from "@codemirror/lang-html";
	import { json } from "@codemirror/lang-json";

	// import prettier
	import prettier from "prettier";
	import parserBabel from "prettier/parser-babel";

	// create editor
	let editorElement: HTMLElement;
	export let editorValue: string = "";
	export let editor: EditorView | undefined = undefined;
	export let lang: "js" | "html" | "json" = "js";

	onMount(() => {
		editorElement.attachShadow({ mode: "open" });
		editorElement.shadowRoot!.innerHTML += `<style>
            .cm-editor {
                height: ${height};
            }

			@media (prefers-color-scheme: dark) {
				.cm-gutters, span {
					filter: invert(1) hue-rotate(180deg);
				}
			}
        </style>`;

		setTimeout(() => {
			editor = new EditorView({
				extensions: [
					basicSetup,
					keymap.of([indentWithTab]),
					lang === "js" ? javascript() : lang === "html" ? html() : json(),
					EditorView.updateListener.of((event: any) => {
						editorValue = event.state.doc.toString();
					}),
					EditorState.readOnly.of(readonly)
				],
				doc: value,
				parent: editorElement.shadowRoot as any
			});
		}, 100);
	});
</script>

<div
	bind:this={editorElement}
	on:blur={() => {
		blur(editorValue);

		// format
		if (!editor) return;
		if (lang === "json") {
			editor.dispatch({
				changes: {
					from: 0,
					to: editor.state.doc.length,
					// insert formatted code
					insert: prettier.format(editorValue, { 
						parser: "json" ,
						plugins: [parserBabel],
					})
				}
			});
		}
	}}
	style="width: {width};"
/>
