<svelte:options accessors />

<script lang="ts">
	import { onMount } from "svelte";

	export let width: string;
	export let value: string;
    export let blur: (value: string) => void;
	export let readonly: boolean = false;

	// import codemirror
	import { basicSetup } from "codemirror";
	import { EditorView, keymap } from "@codemirror/view";
	import { indentWithTab } from "@codemirror/commands";
	import { javascript } from "@codemirror/lang-javascript";
	import { EditorState } from "@codemirror/state";

	// create editor
	let editorElement: HTMLElement;
	export let editorValue: string = "";
	export let editor: EditorView | undefined = undefined;

	onMount(() => {
		editorElement.attachShadow({ mode: "open" });
		editorElement.shadowRoot!.innerHTML += `<style>
            .cm-editor {
                height: 20rem;
            }
        </style>`;

		setTimeout(() => {
			editor = new EditorView({
				extensions: [
					basicSetup,
					keymap.of([indentWithTab]),
					javascript(),
					EditorView.updateListener.of((event: any) => {
						editorValue = event.state.doc.toString();
					}),
					EditorState.readOnly.of(readonly)
				],
				doc: value,
				parent: editorElement.shadowRoot as any,
			});
		}, 100);
	});
</script>

<div bind:this={editorElement} on:blur={() => {
    blur(editorValue);
}} style="width: {width};" />
