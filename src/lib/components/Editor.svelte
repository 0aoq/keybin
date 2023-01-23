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
	import { EditorView, keymap } from "@codemirror/view";
	import { indentWithTab } from "@codemirror/commands";
	import { EditorState } from "@codemirror/state";

	import { javascript } from "@codemirror/lang-javascript";
	import { html } from "@codemirror/lang-html";

	// create editor
	let editorElement: HTMLElement;
	export let editorValue: string = "";
	export let editor: EditorView | undefined = undefined;
	export let lang: "js" | "html" = "js";

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
					lang === "js" ? javascript() : html(),
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
	}}
	style="width: {width};"
/>
